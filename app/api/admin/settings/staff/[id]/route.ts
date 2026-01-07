import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

// PUT /api/admin/settings/staff/[id] - Update a staff user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();
    const body = await request.json();

    const { role } = body;

    // Validate role
    if (role && !['admin', 'operator'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin or operator' },
        { status: 400 }
      );
    }

    // Update admin_users entry
    const updateData: Record<string, unknown> = {};
    if (role) updateData.role = role;

    const { data, error } = await supabase
      .from('admin_users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Staff user not found' }, { status: 404 });
      }
      console.error('Error updating staff user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ staff: data });
  } catch (error) {
    console.error('Error in PUT /api/admin/settings/staff/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/settings/staff/[id] - Delete a staff user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    // Get current user to prevent self-deletion
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.id === id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Delete from admin_users (this should cascade or be handled)
    const { error } = await adminSupabase
      .from('admin_users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting staff user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Note: In production, you'd also need to delete the auth.users entry
    // using Supabase Admin API

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/settings/staff/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}





