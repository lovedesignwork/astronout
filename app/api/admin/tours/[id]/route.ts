import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';

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

// GET - Fetch single tour with all related data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();

    // Fetch tour with all fields (supports both UUID and tour_number)
    const { data: tour, error } = await getTourByIdOrNumber(supabase, id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }

    const tourId = tour.id; // Use the actual UUID for related queries

    // Fetch blocks with translations
    const { data: blocks } = await supabase
      .from('tour_blocks')
      .select(`
        *,
        translations:tour_block_translations(*)
      `)
      .eq('tour_id', tourId)
      .order('order', { ascending: true });

    // Process blocks to merge translations
    const processedBlocks = blocks?.map((block) => {
      const enTranslation = block.translations?.find(
        (t: { language: string }) => t.language === 'en'
      );
      return {
        ...block,
        title: enTranslation?.title || '',
        content: enTranslation?.content || {},
      };
    }) || [];

    // Fetch packages
    const { data: packages } = await supabase
      .from('tour_packages')
      .select(`
        *,
        upsells:package_upsells(*)
      `)
      .eq('tour_id', tourId)
      .order('order', { ascending: true });

    // Fetch category assignments
    const { data: categoryAssignments } = await supabase
      .from('tour_category_assignments')
      .select(`
        category_id,
        tour_categories (*)
      `)
      .eq('tour_id', tourId);

    const categories = categoryAssignments?.map(a => a.tour_categories).filter(Boolean) || [];

    // Fetch special label assignments
    const { data: labelAssignments } = await supabase
      .from('tour_special_label_assignments')
      .select(`
        label_id,
        special_labels (*)
      `)
      .eq('tour_id', tourId);

    const specialLabels = labelAssignments?.map(a => a.special_labels).filter(Boolean) || [];

    return NextResponse.json({
      success: true,
      tour: {
        ...tour,
        blocks: processedBlocks,
        packages: packages || [],
        categories,
        specialLabels,
      },
    });
  } catch (error) {
    console.error('Error fetching tour:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch tour' }, { status: 500 });
  }
}

// PUT - Update tour
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idOrNumber } = await params;
    const body = await request.json();
    const supabase = await createAdminClient();

    // First, resolve the tour to get the actual UUID
    const { data: existingTour, error: lookupError } = await getTourByIdOrNumber(supabase, idOrNumber);
    if (lookupError || !existingTour) {
      return NextResponse.json({ success: false, error: 'Tour not found' }, { status: 404 });
    }
    const tourId = existingTour.id;

    // If updating pricing, handle that separately
    if (body.pricing) {
      const { error: pricingError } = await supabase
        .from('tour_pricing')
        .upsert({
          tour_id: tourId,
          config: body.pricing,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'tour_id' });

      if (pricingError) {
        return NextResponse.json({ success: false, error: pricingError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    // Update tour fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Basic fields
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.pricing_engine !== undefined) updateData.pricing_engine = body.pricing_engine;
    if (body.meta !== undefined) updateData.meta = body.meta;

    // Image fields
    if (body.hero_background_image !== undefined) updateData.hero_background_image = body.hero_background_image;
    if (body.featured_images !== undefined) updateData.featured_images = body.featured_images;
    if (body.main_media !== undefined) updateData.main_media = body.main_media;
    if (body.additional_photos !== undefined) updateData.additional_photos = body.additional_photos;

    // Video fields
    if (body.video_embed_code !== undefined) updateData.video_embed_code = body.video_embed_code;
    if (body.video_section_title !== undefined) updateData.video_section_title = body.video_section_title;

    // Google Reviews fields
    if (body.google_reviews !== undefined) updateData.google_reviews = body.google_reviews;
    if (body.google_rating !== undefined) updateData.google_rating = body.google_rating;
    if (body.google_review_count !== undefined) updateData.google_review_count = body.google_review_count;

    // Itinerary fields
    if (body.itinerary_title !== undefined) updateData.itinerary_title = body.itinerary_title;
    if (body.itinerary_images !== undefined) updateData.itinerary_images = body.itinerary_images;

    // Section toggle fields
    if (body.description_enabled !== undefined) updateData.description_enabled = body.description_enabled;
    if (body.images_enabled !== undefined) updateData.images_enabled = body.images_enabled;
    if (body.packages_enabled !== undefined) updateData.packages_enabled = body.packages_enabled;
    if (body.itinerary_enabled !== undefined) updateData.itinerary_enabled = body.itinerary_enabled;
    if (body.video_enabled !== undefined) updateData.video_enabled = body.video_enabled;
    if (body.google_reviews_enabled !== undefined) updateData.google_reviews_enabled = body.google_reviews_enabled;
    if (body.safety_info_enabled !== undefined) updateData.safety_info_enabled = body.safety_info_enabled;
    if (body.need_help_enabled !== undefined) updateData.need_help_enabled = body.need_help_enabled;

    // Tags field (regular labels - free text array)
    if (body.tags !== undefined) updateData.tags = body.tags;

    const { data: tour, error } = await supabase
      .from('tours')
      .update(updateData)
      .eq('id', tourId)
      .select()
      .single();

    if (error) {
      // Check if it's a schema cache error (missing columns)
      if (error.message.includes('schema cache') || error.message.includes('column')) {
        console.error('Database schema error:', error.message);
        return NextResponse.json({ 
          success: false, 
          error: 'Database schema mismatch. Please run the migration: supabase/migrations/005_add_missing_tour_columns.sql',
          details: error.message
        }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    // Revalidate cache for this tour so frontend shows updated data immediately
    try {
      await revalidateTag('tours', 'default');
      await revalidateTag(`tour-${tour.slug}`, 'default');
    } catch (e) {
      console.error('Cache revalidation error:', e);
    }

    return NextResponse.json({ success: true, tour });
  } catch (error) {
    console.error('Error updating tour:', error);
    return NextResponse.json({ success: false, error: 'Failed to update tour' }, { status: 500 });
  }
}

// DELETE - Delete tour
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idOrNumber } = await params;
    const supabase = await createAdminClient();

    // First, resolve the tour to get the actual UUID
    const { data: existingTour, error: lookupError } = await getTourByIdOrNumber(supabase, idOrNumber);
    if (lookupError || !existingTour) {
      return NextResponse.json({ success: false, error: 'Tour not found' }, { status: 404 });
    }
    const tourId = existingTour.id;

    // Delete related data first
    await supabase.from('tour_block_translations').delete().eq('block_id', tourId);
    await supabase.from('tour_blocks').delete().eq('tour_id', tourId);
    await supabase.from('tour_pricing').delete().eq('tour_id', tourId);
    await supabase.from('tour_availability').delete().eq('tour_id', tourId);
    await supabase.from('upsell_translations').delete().match({ upsell_id: tourId });
    await supabase.from('upsells').delete().eq('tour_id', tourId);

    // Delete the tour
    const { error } = await supabase.from('tours').delete().eq('id', tourId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tour:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete tour' }, { status: 500 });
  }
}
