import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// Verify admin authentication
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

// GET - Get single translation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { data: translation, error } = await supabase
      .from('ui_translations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!translation) {
      return NextResponse.json({ success: false, error: 'Translation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, translation });
  } catch (error) {
    console.error('Error fetching translation:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch translation' }, { status: 500 });
  }
}

// PUT - Update single translation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    // Remove id from body to prevent updating it
    const { id: _, ...updates } = body;

    const supabase = await createAdminClient();

    const { data: translation, error } = await supabase
      .from('ui_translations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, translation });
  } catch (error) {
    console.error('Error updating translation:', error);
    return NextResponse.json({ success: false, error: 'Failed to update translation' }, { status: 500 });
  }
}

// DELETE - Delete translation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createAdminClient();

    const { error } = await supabase
      .from('ui_translations')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting translation:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete translation' }, { status: 500 });
  }
}




