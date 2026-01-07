import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

// GET /api/admin/settings/staff - List all staff users
export async function GET() {
  try {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching staff:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ staff: data || [] });
  } catch (error) {
    console.error('Error in GET /api/admin/settings/staff:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/settings/staff - Create a new staff user
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();
    const body = await request.json();

    const { email, password, role = 'operator' } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'operator'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin or operator' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await adminSupabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Create auth user using admin API
    // Note: In production, you'd use Supabase Admin API or invite flow
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
      },
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create admin_users entry
    const { data: staffUser, error: staffError } = await adminSupabase
      .from('admin_users')
      .insert({
        id: authData.user.id,
        email,
        role,
      })
      .select()
      .single();

    if (staffError) {
      console.error('Error creating staff user:', staffError);
      // Try to clean up auth user if admin_users insert fails
      return NextResponse.json(
        { error: 'Failed to create staff user record' },
        { status: 500 }
      );
    }

    return NextResponse.json({ staff: staffUser }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/settings/staff:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}





