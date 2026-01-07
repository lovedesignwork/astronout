import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET - Fetch single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { data: category, error } = await supabase
      .from('tour_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch category' }, { status: 500 });
  }
}

// PUT - Update category
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
    if (body.description !== undefined) updateData.description = body.description;
    if (body.order !== undefined) updateData.order = body.order;

    const { data: category, error } = await supabase
      .from('tour_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'A category with this slug already exists' },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();

    // Delete category assignments first (cascade should handle this, but being explicit)
    await supabase
      .from('tour_category_assignments')
      .delete()
      .eq('category_id', id);

    // Delete the category
    const { error } = await supabase
      .from('tour_categories')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
  }
}




