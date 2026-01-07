import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

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

// GET - List availability
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idOrNumber } = await params;
    const supabase = await createAdminClient();

    // Resolve tour ID from UUID or tour_number
    const tourId = await resolveTourId(supabase, idOrNumber);
    if (!tourId) {
      return NextResponse.json({ success: false, error: 'Tour not found' }, { status: 404 });
    }

    const { data: slots, error } = await supabase
      .from('tour_availability')
      .select('*')
      .eq('tour_id', tourId)
      .order('date', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, slots });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch availability' }, { status: 500 });
  }
}

// POST - Create availability slot
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idOrNumber } = await params;
    const body = await request.json();
    const supabase = await createAdminClient();

    // Resolve tour ID from UUID or tour_number
    const tourId = await resolveTourId(supabase, idOrNumber);
    if (!tourId) {
      return NextResponse.json({ success: false, error: 'Tour not found' }, { status: 404 });
    }

    const { data: slot, error } = await supabase
      .from('tour_availability')
      .insert({
        tour_id: tourId,
        date: body.date,
        time_slot: body.time_slot || null,
        capacity: body.capacity || 20,
        booked: 0,
        enabled: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, slot });
  } catch (error) {
    console.error('Error creating availability:', error);
    return NextResponse.json({ success: false, error: 'Failed to create availability' }, { status: 500 });
  }
}

// PUT - Update availability slot
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const body = await request.json();
    const supabase = await createAdminClient();

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.enabled !== undefined) updateData.enabled = body.enabled;
    if (body.capacity !== undefined) updateData.capacity = body.capacity;

    const { error } = await supabase
      .from('tour_availability')
      .update(updateData)
      .eq('id', body.slotId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json({ success: false, error: 'Failed to update availability' }, { status: 500 });
  }
}

// DELETE - Delete availability slot
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slotId = searchParams.get('slotId');
    
    if (!slotId) {
      return NextResponse.json({ success: false, error: 'Slot ID required' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    const { error } = await supabase
      .from('tour_availability')
      .delete()
      .eq('id', slotId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting availability:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete availability' }, { status: 500 });
  }
}
