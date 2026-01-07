import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET - List all static pages with their English translations
export async function GET() {
  try {
    const supabase = await createAdminClient();

    // Get all pages
    const { data: pages, error: pagesError } = await supabase
      .from('static_pages')
      .select('*')
      .order('order', { ascending: true });

    if (pagesError) {
      return NextResponse.json({ success: false, error: pagesError.message }, { status: 500 });
    }

    // Get English translations for display
    const pageIds = pages?.map(p => p.id) || [];
    
    const { data: translations, error: translationsError } = await supabase
      .from('static_pages_translations')
      .select('page_id, title')
      .in('page_id', pageIds)
      .eq('language', 'en');

    if (translationsError) {
      return NextResponse.json({ success: false, error: translationsError.message }, { status: 500 });
    }

    // Merge pages with titles
    const titleMap = new Map(translations?.map(t => [t.page_id, t.title]) || []);
    
    const pagesWithTitles = pages?.map(page => ({
      ...page,
      title: titleMap.get(page.id) || page.slug,
    })) || [];

    return NextResponse.json({ success: true, pages: pagesWithTitles });
  } catch (error) {
    console.error('Error fetching static pages:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch static pages' }, { status: 500 });
  }
}



