import { createClient } from '@/lib/supabase/server';
import { Language, DEFAULT_LANGUAGE, StaticPage, StaticPageTranslation, StaticPageWithTranslation } from '@/types';

/**
 * Get a single static page by slug with translation for the specified language
 */
export async function getStaticPage(
  slug: string,
  language: Language = DEFAULT_LANGUAGE
): Promise<StaticPageWithTranslation | null> {
  try {
    const supabase = await createClient();

    // Get the page
    const { data: page, error: pageError } = await supabase
      .from('static_pages')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (pageError) {
      // Silently return null if table doesn't exist (PGRST205)
      if (pageError.code === 'PGRST205' || pageError.code === '42P01') {
        return null;
      }
      console.error('Error fetching static page:', pageError);
      return null;
    }
    
    if (!page) {
      return null;
    }

    // Get translation for the requested language
    const { data: translation, error: translationError } = await supabase
      .from('static_pages_translations')
      .select('*')
      .eq('page_id', page.id)
      .eq('language', language)
      .single();

    // If no translation for requested language, try fallback to English
    let finalTranslation = translation;
    if (translationError || !translation) {
      if (language !== DEFAULT_LANGUAGE) {
        const { data: fallbackTranslation } = await supabase
          .from('static_pages_translations')
          .select('*')
          .eq('page_id', page.id)
          .eq('language', DEFAULT_LANGUAGE)
          .single();
        finalTranslation = fallbackTranslation;
      }
    }

    if (!finalTranslation) {
      console.error('No translation found for static page:', slug);
      return null;
    }

    return {
      ...page,
      title: finalTranslation.title,
      content: finalTranslation.content as Record<string, unknown>,
      meta_title: finalTranslation.meta_title,
      meta_description: finalTranslation.meta_description,
    };
  } catch (error) {
    console.error('Error in getStaticPage:', error);
    return null;
  }
}

/**
 * Get all static pages (for admin)
 */
export async function getAllStaticPages(): Promise<StaticPage[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('static_pages')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      // Silently return empty if table doesn't exist (PGRST205)
      if (error.code === 'PGRST205' || error.code === '42P01') {
        return [];
      }
      console.error('Error fetching static pages:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllStaticPages:', error);
    return [];
  }
}

/**
 * Get a static page with all translations (for admin editing)
 */
export async function getStaticPageWithAllTranslations(
  slug: string
): Promise<(StaticPage & { translations: StaticPageTranslation[] }) | null> {
  try {
    const supabase = await createClient();

    // Get the page
    const { data: page, error: pageError } = await supabase
      .from('static_pages')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (pageError) {
      // Silently return null if table doesn't exist (PGRST205)
      if (pageError.code === 'PGRST205' || pageError.code === '42P01') {
        return null;
      }
      console.error('Error fetching static page:', pageError);
      return null;
    }
    
    if (!page) {
      return null;
    }

    // Get all translations
    const { data: translations, error: translationsError } = await supabase
      .from('static_pages_translations')
      .select('*')
      .eq('page_id', page.id);

    if (translationsError) {
      // Silently return page with empty translations if table doesn't exist
      if (translationsError.code === 'PGRST205' || translationsError.code === '42P01') {
        return { ...page, translations: [] };
      }
      console.error('Error fetching translations:', translationsError);
      return null;
    }

    return {
      ...page,
      translations: translations || [],
    };
  } catch (error) {
    console.error('Error in getStaticPageWithAllTranslations:', error);
    return null;
  }
}

/**
 * Update static page status
 */
export async function updateStaticPageStatus(
  slug: string,
  status: 'draft' | 'published'
): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('static_pages')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('slug', slug);

    if (error) {
      console.error('Error updating static page status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateStaticPageStatus:', error);
    return false;
  }
}

/**
 * Update static page translation
 */
export async function updateStaticPageTranslation(
  pageId: string,
  language: Language,
  data: {
    title: string;
    content: Record<string, unknown>;
    meta_title?: string | null;
    meta_description?: string | null;
  }
): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Check if translation exists
    const { data: existing } = await supabase
      .from('static_pages_translations')
      .select('id')
      .eq('page_id', pageId)
      .eq('language', language)
      .single();

    if (existing) {
      // Update existing translation
      const { error } = await supabase
        .from('static_pages_translations')
        .update({
          title: data.title,
          content: data.content,
          meta_title: data.meta_title,
          meta_description: data.meta_description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating translation:', error);
        return false;
      }
    } else {
      // Create new translation
      const { error } = await supabase
        .from('static_pages_translations')
        .insert({
          page_id: pageId,
          language,
          title: data.title,
          content: data.content,
          meta_title: data.meta_title,
          meta_description: data.meta_description,
        });

      if (error) {
        console.error('Error creating translation:', error);
        return false;
      }
    }

    // Update page's updated_at
    await supabase
      .from('static_pages')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', pageId);

    return true;
  } catch (error) {
    console.error('Error in updateStaticPageTranslation:', error);
    return false;
  }
}

/**
 * Get page titles for footer links
 */
export async function getStaticPageTitles(
  language: Language = DEFAULT_LANGUAGE
): Promise<{ slug: string; title: string }[]> {
  try {
    const supabase = await createClient();

    const { data: pages, error: pagesError } = await supabase
      .from('static_pages')
      .select('id, slug')
      .eq('status', 'published')
      .order('order', { ascending: true });

    if (pagesError) {
      // Silently return empty if table doesn't exist (PGRST205)
      if (pagesError.code === 'PGRST205' || pagesError.code === '42P01') {
        return [];
      }
      return [];
    }
    
    if (!pages) {
      return [];
    }

    const pageIds = pages.map(p => p.id);

    const { data: translations, error: translationsError } = await supabase
      .from('static_pages_translations')
      .select('page_id, title')
      .in('page_id', pageIds)
      .eq('language', language);

    if (translationsError) {
      // Silently return empty if table doesn't exist
      if (translationsError.code === 'PGRST205' || translationsError.code === '42P01') {
        return pages.map(page => ({ slug: page.slug, title: page.slug }));
      }
      return [];
    }

    // Create a map of page_id to title
    const titleMap = new Map(translations?.map(t => [t.page_id, t.title]) || []);

    return pages.map(page => ({
      slug: page.slug,
      title: titleMap.get(page.id) || page.slug,
    }));
  } catch (error) {
    console.error('Error in getStaticPageTitles:', error);
    return [];
  }
}

