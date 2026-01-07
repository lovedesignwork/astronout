import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { Language, SUPPORTED_LANGUAGES } from '@/types';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET - Get a single page with all translations
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const supabase = await createAdminClient();

    // Get the page
    const { data: page, error: pageError } = await supabase
      .from('static_pages')
      .select('*')
      .eq('slug', slug)
      .single();

    if (pageError) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    // Get all translations
    const { data: translations, error: translationsError } = await supabase
      .from('static_pages_translations')
      .select('*')
      .eq('page_id', page.id);

    if (translationsError) {
      return NextResponse.json({ success: false, error: translationsError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      page: {
        ...page,
        translations: translations || [],
      },
    });
  } catch (error) {
    console.error('Error fetching static page:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch page' }, { status: 500 });
  }
}

// PUT - Update page status or translations
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { status, translations } = body;

    const supabase = await createAdminClient();

    // Get the page first
    const { data: page, error: pageError } = await supabase
      .from('static_pages')
      .select('id')
      .eq('slug', slug)
      .single();

    if (pageError || !page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    // Update status if provided
    if (status !== undefined) {
      const { error: statusError } = await supabase
        .from('static_pages')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', page.id);

      if (statusError) {
        return NextResponse.json({ success: false, error: statusError.message }, { status: 500 });
      }
    }

    // Update translations if provided
    if (translations && typeof translations === 'object') {
      for (const lang of SUPPORTED_LANGUAGES) {
        const translation = translations[lang];
        if (!translation) continue;

        // Check if translation exists
        const { data: existing } = await supabase
          .from('static_pages_translations')
          .select('id')
          .eq('page_id', page.id)
          .eq('language', lang)
          .single();

        const translationData = {
          title: translation.title,
          content: translation.content,
          meta_title: translation.meta_title || null,
          meta_description: translation.meta_description || null,
          updated_at: new Date().toISOString(),
        };

        if (existing) {
          // Update existing
          await supabase
            .from('static_pages_translations')
            .update(translationData)
            .eq('id', existing.id);
        } else {
          // Create new
          await supabase
            .from('static_pages_translations')
            .insert({
              page_id: page.id,
              language: lang as Language,
              ...translationData,
            });
        }
      }

      // Update page's updated_at
      await supabase
        .from('static_pages')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', page.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating static page:', error);
    return NextResponse.json({ success: false, error: 'Failed to update page' }, { status: 500 });
  }
}



