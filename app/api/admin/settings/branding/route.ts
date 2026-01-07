import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { revalidateTag } from 'next/cache';

// GET /api/admin/settings/branding - Get branding settings
export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin user
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get branding settings (use maybeSingle to handle case where row doesn't exist)
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'branding')
      .maybeSingle();

    if (error) {
      console.error('Error fetching branding settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: settings?.value || { logo_url: null, favicon_url: null },
    });
  } catch (error) {
    console.error('Error in GET /api/admin/settings/branding:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/settings/branding - Update branding settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin user
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { logo_url, favicon_url } = body;

    // Validate input
    if (logo_url !== null && logo_url !== undefined && typeof logo_url !== 'string') {
      return NextResponse.json({ error: 'Invalid logo_url' }, { status: 400 });
    }

    if (favicon_url !== null && favicon_url !== undefined && typeof favicon_url !== 'string') {
      return NextResponse.json({ error: 'Invalid favicon_url' }, { status: 400 });
    }

    // Upsert branding settings (insert if not exists, update if exists)
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'branding',
        value: { logo_url, favicon_url },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'key',
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating branding settings:', error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    // Revalidate the branding cache so changes appear immediately
    revalidateTag('branding');

    return NextResponse.json({
      success: true,
      data: data.value,
    });
  } catch (error) {
    console.error('Error in PUT /api/admin/settings/branding:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




