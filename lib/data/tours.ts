import { unstable_cache } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/server';
import { resolveTranslation } from '@/lib/i18n';
import type {
  Language,
  Tour,
  TourBlock,
  TourBlockTranslation,
  TourBlockWithTranslation,
  TourPricing,
  TourWithDetails,
  Upsell,
  UpsellTranslation,
  UpsellWithTranslation,
  TourAvailability,
  TourCategory,
  SpecialLabel,
} from '@/types';

/**
 * Internal function to fetch all categories from database
 */
async function fetchCategories(): Promise<TourCategory[]> {
  try {
    const supabase = createPublicClient();

    const { data: categories, error } = await supabase
      .from('tour_categories')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return (categories || []) as TourCategory[];
  } catch (error) {
    console.error('Error in fetchCategories:', error);
    return [];
  }
}

/**
 * Get all tour categories with caching
 * Cached for 5 minutes to avoid database calls on every page load
 */
export const getCategories = unstable_cache(
  fetchCategories,
  ['tour-categories'],
  { revalidate: 300, tags: ['categories'] }
);

/**
 * Get a tour by slug with all blocks and translations
 * Uses public client to support static generation
 */
export async function getTourBySlug(
  slug: string,
  lang: Language = 'en'
): Promise<TourWithDetails | null> {
  const supabase = createPublicClient();

  // Fetch tour
  const { data: tour, error: tourError } = await supabase
    .from('tours')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (tourError || !tour) {
    return null;
  }

  // Fetch blocks with translations
  const { data: blocks } = await supabase
    .from('tour_blocks')
    .select(`
      *,
      tour_block_translations (*)
    `)
    .eq('tour_id', tour.id)
    .eq('enabled', true)
    .order('order', { ascending: true });

  // Fetch pricing
  const { data: pricing } = await supabase
    .from('tour_pricing')
    .select('*')
    .eq('tour_id', tour.id)
    .single();

  // Fetch upsells with translations
  const { data: upsells } = await supabase
    .from('upsells')
    .select(`
      *,
      upsell_translations (*)
    `)
    .eq('tour_id', tour.id)
    .eq('status', 'active')
    .order('order', { ascending: true });

  // Fetch category assignments
  const { data: categoryAssignments } = await supabase
    .from('tour_category_assignments')
    .select(`
      category_id,
      tour_categories (*)
    `)
    .eq('tour_id', tour.id);

  const categories = (categoryAssignments || [])
    .map(a => a.tour_categories)
    .filter(Boolean) as unknown as TourCategory[];

  // Fetch special label assignments
  const { data: labelAssignments } = await supabase
    .from('tour_special_label_assignments')
    .select(`
      label_id,
      special_labels (*)
    `)
    .eq('tour_id', tour.id);

  const specialLabels = (labelAssignments || [])
    .map(a => a.special_labels)
    .filter(Boolean) as unknown as SpecialLabel[];

  // Resolve translations for blocks
  const blocksWithTranslations: TourBlockWithTranslation[] = (blocks || []).map(
    (block: TourBlock & { tour_block_translations: TourBlockTranslation[] }) => {
      const translation = resolveTranslation(
        block.tour_block_translations || [],
        lang
      );

      return {
        ...block,
        title: translation?.title || '',
        content: translation?.content || {},
        translations: block.tour_block_translations,
      };
    }
  );

  // Resolve translations for upsells
  const upsellsWithTranslations: UpsellWithTranslation[] = (upsells || []).map(
    (upsell: Upsell & { upsell_translations: UpsellTranslation[] }) => {
      const translation = resolveTranslation(
        upsell.upsell_translations || [],
        lang
      );

      return {
        ...upsell,
        title: translation?.title || '',
        description: translation?.description || null,
        translations: upsell.upsell_translations,
      };
    }
  );

  return {
    ...tour,
    blocks: blocksWithTranslations,
    pricing: pricing || null,
    upsells: upsellsWithTranslations,
    categories,
    specialLabels,
  };
}

/**
 * List all published tours
 * Uses public client to support static generation
 */
export async function listTours(lang: Language = 'en'): Promise<Tour[]> {
  const supabase = createPublicClient();

  const { data: tours, error } = await supabase
    .from('tours')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tours:', error);
    return [];
  }

  return tours || [];
}

/**
 * Get tours with hero block for listing page
 * Uses public client to support static generation
 */
export async function getToursWithHero(lang: Language = 'en') {
  const supabase = createPublicClient();

  const { data: tours, error } = await supabase
    .from('tours')
    .select(`
      *,
      tour_blocks!inner (
        id,
        block_type,
        tour_block_translations (*)
      ),
      tour_pricing (config)
    `)
    .eq('status', 'published')
    .eq('tour_blocks.block_type', 'hero')
    .eq('tour_blocks.enabled', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tours with hero:', error);
    return [];
  }

  // Get tour IDs to fetch categories and labels
  const tourIds = (tours || []).map(t => t.id);

  // Fetch categories for all tours
  const { data: categoryAssignments } = await supabase
    .from('tour_category_assignments')
    .select(`
      tour_id,
      tour_categories (*)
    `)
    .in('tour_id', tourIds);

  // Fetch special labels for all tours
  const { data: labelAssignments } = await supabase
    .from('tour_special_label_assignments')
    .select(`
      tour_id,
      special_labels (*)
    `)
    .in('tour_id', tourIds);

  // Create maps for quick lookup
  const categoriesByTourId = new Map<string, TourCategory[]>();
  const labelsByTourId = new Map<string, SpecialLabel[]>();

  (categoryAssignments || []).forEach(assignment => {
    const tourId = assignment.tour_id;
    if (!categoriesByTourId.has(tourId)) {
      categoriesByTourId.set(tourId, []);
    }
    if (assignment.tour_categories) {
      categoriesByTourId.get(tourId)!.push(assignment.tour_categories as unknown as TourCategory);
    }
  });

  (labelAssignments || []).forEach(assignment => {
    const tourId = assignment.tour_id;
    if (!labelsByTourId.has(tourId)) {
      labelsByTourId.set(tourId, []);
    }
    if (assignment.special_labels) {
      labelsByTourId.get(tourId)!.push(assignment.special_labels as unknown as SpecialLabel);
    }
  });

  return (tours || []).map((tour) => {
    const heroBlock = tour.tour_blocks?.[0];
    const translations = heroBlock?.tour_block_translations as TourBlockTranslation[] | undefined;
    const translation = translations
      ? resolveTranslation(translations, lang)
      : null;

    // tour_pricing can be an array or a single object depending on the query
    // Handle both cases
    const pricingData = Array.isArray(tour.tour_pricing)
      ? tour.tour_pricing?.[0]?.config
      : tour.tour_pricing?.config;

    return {
      ...tour,
      heroTitle: translation?.title || tour.slug,
      heroContent: translation?.content || {},
      pricing: pricingData || null,
      categories: categoriesByTourId.get(tour.id) || [],
      specialLabels: labelsByTourId.get(tour.id) || [],
    };
  });
}

/**
 * Get tour availability for a date range
 * Uses public client to support static generation
 */
export async function getAvailability(
  tourId: string,
  startDate: string,
  endDate: string
): Promise<TourAvailability[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from('tour_availability')
    .select('*')
    .eq('tour_id', tourId)
    .eq('enabled', true)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('time_slot', { ascending: true });

  if (error) {
    console.error('Error fetching availability:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if a specific slot is available
 * Uses public client to support static generation
 */
export async function checkSlotAvailability(
  tourId: string,
  date: string,
  timeSlot?: string,
  requestedCapacity: number = 1
): Promise<{ available: boolean; remaining: number }> {
  const supabase = createPublicClient();

  let query = supabase
    .from('tour_availability')
    .select('capacity, booked')
    .eq('tour_id', tourId)
    .eq('date', date)
    .eq('enabled', true);

  if (timeSlot) {
    query = query.eq('time_slot', timeSlot);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    return { available: false, remaining: 0 };
  }

  const remaining = data.capacity - data.booked;
  return {
    available: remaining >= requestedCapacity,
    remaining,
  };
}

