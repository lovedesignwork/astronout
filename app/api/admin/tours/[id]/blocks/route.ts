import { NextRequest, NextResponse } from 'next/server';
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

  return { authorized: true };
}

// Helper to resolve tour ID from UUID or tour_number
async function resolveTourId(supabase: Awaited<ReturnType<typeof createAdminClient>>, idOrNumber: string): Promise<string | null> {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);
  
  if (isUUID) {
    return idOrNumber;
  }
  
  // Lookup by tour_number
  const { data: tour } = await supabase
    .from('tours')
    .select('id')
    .eq('tour_number', idOrNumber)
    .single();
  
  return tour?.id || null;
}

// POST - Create new block
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const { id: idOrNumber } = await params;
    const body = await request.json();
    const supabase = await createAdminClient();
    
    // Resolve tour ID from UUID or tour_number
    const tourId = await resolveTourId(supabase, idOrNumber);
    if (!tourId) {
      return NextResponse.json({ success: false, error: 'Tour not found' }, { status: 404 });
    }

    // Get max order
    const { data: existingBlocks } = await supabase
      .from('tour_blocks')
      .select('order')
      .eq('tour_id', tourId)
      .order('order', { ascending: false })
      .limit(1);

    const maxOrder = existingBlocks?.[0]?.order ?? 0;

    // Create block
    const { data: block, error: blockError } = await supabase
      .from('tour_blocks')
      .insert({
        tour_id: tourId,
        block_type: body.block_type,
        order: maxOrder + 1,
        enabled: body.enabled ?? true,
        config: body.config || {},
      })
      .select()
      .single();

    if (blockError) {
      return NextResponse.json(
        { success: false, error: blockError.message },
        { status: 500 }
      );
    }

    // Create English translation if provided
    if (body.title || body.content) {
      await supabase
        .from('tour_block_translations')
        .insert({
          block_id: block.id,
          language: 'en',
          title: body.title || null,
          content: body.content || {},
        });
    }

    return NextResponse.json({ success: true, block });
  } catch (error) {
    console.error('Error creating block:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update blocks order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const { id: idOrNumber } = await params;
    const body = await request.json();
    const supabase = await createAdminClient();
    
    // Resolve tour ID from UUID or tour_number
    const tourId = await resolveTourId(supabase, idOrNumber);
    if (!tourId) {
      return NextResponse.json({ success: false, error: 'Tour not found' }, { status: 404 });
    }

    // Update block orders
    if (body.blockOrders && Array.isArray(body.blockOrders)) {
      for (const item of body.blockOrders) {
        await supabase
          .from('tour_blocks')
          .update({ order: item.order })
          .eq('id', item.id)
          .eq('tour_id', tourId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating blocks:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}




