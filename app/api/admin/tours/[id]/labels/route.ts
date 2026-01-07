import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Helper to resolve tour ID from UUID or tour_number
async function resolveTourId(supabase: Awaited<ReturnType<typeof createAdminClient>>, idOrNumber: string): Promise<string | null> {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);
  
  if (isUUID) {
    return idOrNumber;
  }
  
  const { data: tour } = await supabase
    .from('tours')
    .select('id')
    .eq('tour_number', idOrNumber)
    .single();
  
  return tour?.id || null;
}

// GET - Get special labels assigned to a tour
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

    const { data: assignments, error } = await supabase
      .from('tour_special_label_assignments')
      .select(`
        label_id,
        special_labels (*)
      `)
      .eq('tour_id', tourId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const labels = assignments?.map(a => a.special_labels).filter(Boolean) || [];

    return NextResponse.json({ success: true, labels });
  } catch (error) {
    console.error('Error fetching tour labels:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch labels' }, { status: 500 });
  }
}

// PUT - Update special label assignments for a tour
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idOrNumber } = await params;
    const body = await request.json();
    const { labelIds } = body;

    if (!Array.isArray(labelIds)) {
      return NextResponse.json(
        { success: false, error: 'labelIds must be an array' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Resolve tour ID from UUID or tour_number
    const tourId = await resolveTourId(supabase, idOrNumber);
    if (!tourId) {
      return NextResponse.json({ success: false, error: 'Tour not found' }, { status: 404 });
    }

    // Delete existing assignments
    await supabase
      .from('tour_special_label_assignments')
      .delete()
      .eq('tour_id', tourId);

    // Insert new assignments
    if (labelIds.length > 0) {
      const assignments = labelIds.map((labelId: string) => ({
        tour_id: tourId,
        label_id: labelId,
      }));

      const { error: insertError } = await supabase
        .from('tour_special_label_assignments')
        .insert(assignments);

      if (insertError) {
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
      }
    }

    // Fetch updated labels
    const { data: updatedAssignments } = await supabase
      .from('tour_special_label_assignments')
      .select(`
        label_id,
        special_labels (*)
      `)
      .eq('tour_id', tourId);

    const labels = updatedAssignments?.map(a => a.special_labels).filter(Boolean) || [];

    return NextResponse.json({ success: true, labels });
  } catch (error) {
    console.error('Error updating tour labels:', error);
    return NextResponse.json({ success: false, error: 'Failed to update labels' }, { status: 500 });
  }
}



