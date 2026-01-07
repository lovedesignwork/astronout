import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import { TourEditor } from './TourEditor';
import type { TourWithSettings } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Helper to get tour by ID or tour_number
async function getTourByIdOrNumber(supabase: Awaited<ReturnType<typeof createAdminClient>>, idOrNumber: string) {
  // Check if it's a UUID format or a tour_number
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);
  
  if (isUUID) {
    return supabase.from('tours').select('*').eq('id', idOrNumber).single();
  } else {
    // It's a tour_number (e.g., "001", "002", etc.)
    return supabase.from('tours').select('*').eq('tour_number', idOrNumber).single();
  }
}

async function getTourWithDetails(idOrNumber: string): Promise<TourWithSettings | null> {
  const supabase = await createAdminClient();

  // Support both UUID and tour_number
  const { data: tour, error: tourError } = await getTourByIdOrNumber(supabase, idOrNumber);

  if (tourError || !tour) {
    return null;
  }

  const tourId = tour.id; // Use actual UUID for related queries

  const { data: blocks } = await supabase
    .from('tour_blocks')
    .select(`
      *,
      translations:tour_block_translations(*)
    `)
    .eq('tour_id', tourId)
    .order('order', { ascending: true });

  const { data: packages } = await supabase
    .from('tour_packages')
    .select(`
      *,
      upsells:package_upsells(*)
    `)
    .eq('tour_id', tourId)
    .order('order', { ascending: true });

  return {
    ...tour,
    blocks: blocks || [],
    packages: packages || [],
    // Ensure defaults for new fields
    hero_background_image: tour.hero_background_image || null,
    featured_images: tour.featured_images || [],
    main_media: tour.main_media || [],
    additional_photos: tour.additional_photos || [],
    video_embed_code: tour.video_embed_code || null,
    video_section_title: tour.video_section_title || 'Video',
    google_reviews: tour.google_reviews || [],
    google_rating: tour.google_rating || null,
    google_review_count: tour.google_review_count || null,
    itinerary_title: tour.itinerary_title || 'Itinerary',
    itinerary_images: tour.itinerary_images || [],
    description_enabled: tour.description_enabled ?? true,
    images_enabled: tour.images_enabled ?? true,
    packages_enabled: tour.packages_enabled ?? true,
    itinerary_enabled: tour.itinerary_enabled ?? true,
    video_enabled: tour.video_enabled ?? false,
    google_reviews_enabled: tour.google_reviews_enabled ?? true,
    safety_info_enabled: tour.safety_info_enabled ?? true,
    need_help_enabled: tour.need_help_enabled ?? true,
  } as TourWithSettings;
}

export default async function TourEditPage({ params }: PageProps) {
  const { id } = await params;
  const tour = await getTourWithDetails(id);

  if (!tour) {
    notFound();
  }

  // Use tour_number for the URL, but pass the actual UUID for API calls
  return <TourEditor tourId={tour.id} tourNumber={tour.tour_number} initialTour={tour} />;
}
