import { createPublicClient, createAdminClient } from '@/lib/supabase/server';
import { Language } from '@/types';

export interface UITranslationRow {
  id: string;
  translation_key: string;
  category: string;
  en: string;
  zh: string | null;
  ru: string | null;
  ko: string | null;
  ja: string | null;
  fr: string | null;
  it: string | null;
  es: string | null;
  id_lang: string | null; // Indonesian - renamed to avoid conflict with id field
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all UI translations from the database
 * Returns a map of { key: { lang: translation } }
 * Uses public client to support static generation
 */
export async function getUITranslations(): Promise<Record<Language, Record<string, string>>> {
  try {
    const supabase = createPublicClient();
    
    const { data: translations, error } = await supabase
      .from('ui_translations')
      .select('*');

    if (error) {
      console.error('Error fetching UI translations:', error);
      return getEmptyTranslations();
    }

    if (!translations || translations.length === 0) {
      return getEmptyTranslations();
    }

    // Transform to the format expected by the t() function
    const result: Record<Language, Record<string, string>> = {
      en: {},
      zh: {},
      ru: {},
      ko: {},
      ja: {},
      fr: {},
      it: {},
      es: {},
      id: {},
    };

    translations.forEach((row: UITranslationRow) => {
      const key = row.translation_key;
      result.en[key] = row.en;
      if (row.zh) result.zh[key] = row.zh;
      if (row.ru) result.ru[key] = row.ru;
      if (row.ko) result.ko[key] = row.ko;
      if (row.ja) result.ja[key] = row.ja;
      if (row.fr) result.fr[key] = row.fr;
      if (row.it) result.it[key] = row.it;
      if (row.es) result.es[key] = row.es;
      if (row.id) result.id[key] = row.id;
    });

    return result;
  } catch (error) {
    console.error('Error in getUITranslations:', error);
    return getEmptyTranslations();
  }
}

function getEmptyTranslations(): Record<Language, Record<string, string>> {
  return {
    en: {},
    zh: {},
    ru: {},
    ko: {},
    ja: {},
    fr: {},
    it: {},
    es: {},
    id: {},
  };
}

/**
 * Get a single translation by key
 * Uses public client to support static generation
 */
export async function getTranslationByKey(key: string): Promise<UITranslationRow | null> {
  try {
    const supabase = createPublicClient();
    
    const { data, error } = await supabase
      .from('ui_translations')
      .select('*')
      .eq('translation_key', key)
      .single();

    if (error) {
      console.error('Error fetching translation by key:', error);
      return null;
    }

    return data as UITranslationRow;
  } catch (error) {
    console.error('Error in getTranslationByKey:', error);
    return null;
  }
}



