import { NextRequest, NextResponse } from 'next/server';
import { adminListTours } from '@/lib/data/admin';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

// Helper to verify admin auth
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

  return { authorized: true, supabase };
}

// Default blocks for a new tour
const DEFAULT_BLOCKS = [
  { block_type: 'hero', order: 1, enabled: true },
  { block_type: 'highlights', order: 2, enabled: true },
  { block_type: 'included_excluded', order: 3, enabled: true },
  { block_type: 'itinerary', order: 4, enabled: true },
  { block_type: 'what_to_bring', order: 5, enabled: true },
  { block_type: 'safety_info', order: 6, enabled: true },
  { block_type: 'terms', order: 7, enabled: true },
  { block_type: 'map', order: 8, enabled: true },
  { block_type: 'reviews', order: 9, enabled: true },
  { block_type: 'availability_selector', order: 10, enabled: true },
  { block_type: 'pricing_selector', order: 11, enabled: true },
  { block_type: 'upsells', order: 12, enabled: false },
];

// Default translations for blocks
function getDefaultTranslations(blockType: string, slug: string) {
  const defaults: Record<string, { title: string; content: Record<string, unknown> }> = {
    hero: {
      title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      content: { subtitle: '', imageUrl: '', images: [], location: '', duration: '', rating: 0, reviewCount: 0, badges: [] },
    },
    highlights: {
      title: 'Highlights',
      content: { items: [], columns: 2 },
    },
    included_excluded: {
      title: 'What\'s Included',
      content: { included: [], excluded: [] },
    },
    itinerary: {
      title: 'Itinerary',
      content: { items: [] },
    },
    what_to_bring: {
      title: 'What to Bring',
      content: { items: [], note: '' },
    },
    safety_info: {
      title: 'Safety Information',
      content: { items: [], warnings: [], restrictions: [] },
    },
    terms: {
      title: 'Terms & Conditions',
      content: { sections: [], cancellationPolicy: '', refundPolicy: '' },
    },
    map: {
      title: 'Meeting Point',
      content: { latitude: 0, longitude: 0, address: '', meetingPoint: '' },
    },
    reviews: {
      title: 'Customer Reviews',
      content: { reviews: [], averageRating: 0, totalReviews: 0 },
    },
    availability_selector: {
      title: 'Select Date',
      content: {},
    },
    pricing_selector: {
      title: 'Select Options',
      content: {},
    },
    upsells: {
      title: 'Enhance Your Experience',
      content: {},
    },
  };
  return defaults[blockType] || { title: '', content: {} };
}

// GET - List all tours
export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const tours = await adminListTours();
    return NextResponse.json({ success: true, tours });
  } catch (error) {
    console.error('Error fetching tours:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new tour with default blocks
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { slug, pricingEngine } = body;

    if (!slug || !pricingEngine) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Create the tour
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .insert({
        slug,
        pricing_engine: pricingEngine,
        status: 'draft',
      })
      .select()
      .single();

    if (tourError) {
      return NextResponse.json(
        { success: false, error: tourError.message },
        { status: 500 }
      );
    }

    // Create default blocks
    const blocksToInsert = DEFAULT_BLOCKS.map(block => ({
      tour_id: tour.id,
      ...block,
    }));

    const { data: blocks, error: blocksError } = await supabase
      .from('tour_blocks')
      .insert(blocksToInsert)
      .select();

    if (blocksError) {
      console.error('Error creating blocks:', blocksError);
    }

    // Create default translations for each block
    if (blocks) {
      const translations = blocks.map(block => {
        const defaults = getDefaultTranslations(block.block_type, slug);
        return {
          block_id: block.id,
          language: 'en',
          title: defaults.title,
          content: defaults.content,
        };
      });

      const { error: transError } = await supabase
        .from('tour_block_translations')
        .insert(translations);

      if (transError) {
        console.error('Error creating translations:', transError);
      }
    }

    // Create default pricing
    let defaultPricing = {};
    switch (pricingEngine) {
      case 'flat_per_person':
        defaultPricing = { type: 'flat_per_person', retail_price: 0, net_price: 0, currency: 'THB', min_pax: 1, max_pax: 10 };
        break;
      case 'adult_child':
        defaultPricing = { type: 'adult_child', adult_retail_price: 0, adult_net_price: 0, child_retail_price: 0, child_net_price: 0, currency: 'THB', child_age_max: 11, min_pax: 1, max_pax: 10 };
        break;
      case 'seat_based':
        defaultPricing = { type: 'seat_based', currency: 'THB', seats: [] };
        break;
    }

    await supabase
      .from('tour_pricing')
      .insert({
        tour_id: tour.id,
        config: defaultPricing,
      });

    return NextResponse.json({ success: true, tour });
  } catch (error) {
    console.error('Error creating tour:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
