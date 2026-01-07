import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET - Fetch single special label
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { data: label, error } = await supabase
      .from('special_labels')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }

    return NextResponse.json({ success: true, label });
  } catch (error) {
    console.error('Error fetching label:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch label' }, { status: 500 });
  }
}

// PUT - Update special label
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createAdminClient();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug.toLowerCase().replace(/\s+/g, '-');
    if (body.background_color !== undefined) updateData.background_color = body.background_color;
    if (body.text_color !== undefined) updateData.text_color = body.text_color;
    if (body.order !== undefined) updateData.order = body.order;

    const { data: label, error } = await supabase
      .from('special_labels')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'A label with this slug already exists' },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, label });
  } catch (error) {
    console.error('Error updating label:', error);
    return NextResponse.json({ success: false, error: 'Failed to update label' }, { status: 500 });
  }
}

// DELETE - Delete special label
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();

    // Delete label assignments first (cascade should handle this, but being explicit)
    await supabase
      .from('tour_special_label_assignments')
      .delete()
      .eq('label_id', id);

    // Delete the label
    const { error } = await supabase
      .from('special_labels')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting label:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete label' }, { status: 500 });
  }
}



