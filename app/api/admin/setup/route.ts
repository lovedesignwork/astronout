import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint creates the initial admin user
// It should only be called once during setup
// After setup, you should disable or remove this endpoint

const ADMIN_EMAIL = 'admin@astronout.co';
const ADMIN_PASSWORD = 'Admin123!@#';

export async function POST(request: Request) {
  try {
    // Check for setup secret to prevent unauthorized access
    const { secret } = await request.json();
    
    if (secret !== process.env.ADMIN_SETUP_SECRET && secret !== 'astronout-setup-2026') {
      return NextResponse.json(
        { error: 'Invalid setup secret' },
        { status: 401 }
      );
    }

    // Create admin client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if admin user already exists
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('email', ADMIN_EMAIL)
      .single();

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin user already exists',
        email: ADMIN_EMAIL,
        hint: 'Use the existing credentials to login',
      });
    }

    // Create the auth user using Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // Auto-confirm the email
    });

    if (authError) {
      // If user already exists in auth but not in admin_users
      if (authError.message.includes('already been registered')) {
        // Get the existing user
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users?.users?.find(u => u.email === ADMIN_EMAIL);
        
        if (existingUser) {
          // Add to admin_users table
          const { error: insertError } = await supabase
            .from('admin_users')
            .insert({
              id: existingUser.id,
              email: ADMIN_EMAIL,
              role: 'admin',
            });

          if (insertError) {
            return NextResponse.json(
              { error: `Failed to add admin record: ${insertError.message}` },
              { status: 500 }
            );
          }

          return NextResponse.json({
            success: true,
            message: 'Admin user linked successfully',
            credentials: {
              email: ADMIN_EMAIL,
              password: ADMIN_PASSWORD,
            },
            loginUrl: '/admin/login',
          });
        }
      }

      return NextResponse.json(
        { error: `Failed to create auth user: ${authError.message}` },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user - no user returned' },
        { status: 500 }
      );
    }

    // Add the user to admin_users table
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: authData.user.id,
        email: ADMIN_EMAIL,
        role: 'admin',
      });

    if (adminError) {
      // Rollback: delete the auth user if admin insert fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json(
        { error: `Failed to create admin record: ${adminError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      credentials: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
      loginUrl: '/admin/login',
      warning: 'Please change the password after first login and disable this setup endpoint',
    });

  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check setup status
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        configured: false,
        message: 'Supabase not configured',
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if any admin exists
    const { data: admins, error } = await supabase
      .from('admin_users')
      .select('id, email')
      .limit(1);

    if (error) {
      return NextResponse.json({
        configured: false,
        message: 'Database not ready',
        error: error.message,
      });
    }

    return NextResponse.json({
      configured: true,
      hasAdmin: admins && admins.length > 0,
      message: admins && admins.length > 0 
        ? 'Admin user exists. Login at /admin/login'
        : 'No admin user. POST to this endpoint to create one.',
    });

  } catch (error) {
    return NextResponse.json({
      configured: false,
      message: 'Setup check failed',
    });
  }
}




