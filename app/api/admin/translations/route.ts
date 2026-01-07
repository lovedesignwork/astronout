import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { Language } from '@/types';

// Verify admin authentication
async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, error: 'Unauthorized' };
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    return { authorized: false, error: 'Unauthorized' };
  }

  return { authorized: true };
}

export interface UITranslation {
  id: string;
  translation_key: string;
  category: 'booking' | 'navigation' | 'forms' | 'general' | 'errors';
  en: string;
  zh: string | null;
  ru: string | null;
  ko: string | null;
  ja: string | null;
  fr: string | null;
  it: string | null;
  es: string | null;
  id: string | null;
  created_at: string;
  updated_at: string;
}

// GET - List all translations with optional category filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    const supabase = await createAdminClient();
    
    let query = supabase
      .from('ui_translations')
      .select('*')
      .order('category', { ascending: true })
      .order('translation_key', { ascending: true });
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    if (search) {
      query = query.or(`translation_key.ilike.%${search}%,en.ilike.%${search}%`);
    }
    
    const { data: translations, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, translations: translations || [] });
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch translations' }, { status: 500 });
  }
}

// POST - Create new translation key
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { translation_key, category, en, zh, ru, ko, ja, fr, it, es, id: idLang } = body;

    if (!translation_key || !en) {
      return NextResponse.json(
        { success: false, error: 'Translation key and English text are required' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    const { data: translation, error } = await supabase
      .from('ui_translations')
      .insert({
        translation_key: translation_key.toLowerCase().replace(/\s+/g, '_'),
        category: category || 'general',
        en,
        zh: zh || null,
        ru: ru || null,
        ko: ko || null,
        ja: ja || null,
        fr: fr || null,
        it: it || null,
        es: es || null,
        id: idLang || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'A translation with this key already exists' },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, translation });
  } catch (error) {
    console.error('Error creating translation:', error);
    return NextResponse.json({ success: false, error: 'Failed to create translation' }, { status: 500 });
  }
}

// PUT - Bulk update translations
export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { translations } = body;

    if (!translations || !Array.isArray(translations)) {
      return NextResponse.json(
        { success: false, error: 'Translations array is required' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Update each translation
    const results = await Promise.all(
      translations.map(async (t: Partial<UITranslation> & { id: string }) => {
        const { id, ...updates } = t;
        const { error } = await supabase
          .from('ui_translations')
          .update(updates)
          .eq('id', id);
        return { id, error };
      })
    );

    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Some translations failed to update', errors },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating translations:', error);
    return NextResponse.json({ success: false, error: 'Failed to update translations' }, { status: 500 });
  }
}



