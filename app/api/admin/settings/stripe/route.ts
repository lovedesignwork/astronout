import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getStripeSettings } from '@/lib/data/settings';
import type { StripeSettings } from '@/types';

/**
 * GET /api/admin/settings/stripe
 * Fetch Stripe payment settings
 */
export async function GET() {
  try {
    const settings = await getStripeSettings();

    // Mask secret keys for security (only show last 4 characters)
    const maskedSettings = {
      ...settings,
      test_secret_key: settings.test_secret_key
        ? `sk_test_...${settings.test_secret_key.slice(-4)}`
        : '',
      live_secret_key: settings.live_secret_key
        ? `sk_live_...${settings.live_secret_key.slice(-4)}`
        : '',
      webhook_secret: settings.webhook_secret
        ? `whsec_...${settings.webhook_secret.slice(-4)}`
        : '',
    };

    return NextResponse.json({
      success: true,
      data: maskedSettings,
    });
  } catch (error) {
    console.error('Error fetching stripe settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings/stripe
 * Update Stripe payment settings
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createAdminClient();

    // Get current settings to preserve unchanged secret keys
    const currentSettings = await getStripeSettings();

    // Build updated settings, preserving masked keys if not changed
    const updatedSettings: StripeSettings = {
      mode: body.mode || currentSettings.mode,
      test_publishable_key:
        body.test_publishable_key ?? currentSettings.test_publishable_key,
      test_secret_key: body.test_secret_key?.startsWith('sk_test_...')
        ? currentSettings.test_secret_key
        : body.test_secret_key ?? currentSettings.test_secret_key,
      live_publishable_key:
        body.live_publishable_key ?? currentSettings.live_publishable_key,
      live_secret_key: body.live_secret_key?.startsWith('sk_live_...')
        ? currentSettings.live_secret_key
        : body.live_secret_key ?? currentSettings.live_secret_key,
      webhook_secret: body.webhook_secret?.startsWith('whsec_...')
        ? currentSettings.webhook_secret
        : body.webhook_secret ?? currentSettings.webhook_secret,
      payment_methods: {
        card: body.payment_methods?.card ?? currentSettings.payment_methods.card,
        google_pay:
          body.payment_methods?.google_pay ??
          currentSettings.payment_methods.google_pay,
        apple_pay:
          body.payment_methods?.apple_pay ??
          currentSettings.payment_methods.apple_pay,
        promptpay:
          body.payment_methods?.promptpay ??
          currentSettings.payment_methods.promptpay,
      },
    };

    // Validate keys format if provided
    if (
      updatedSettings.test_publishable_key &&
      !updatedSettings.test_publishable_key.startsWith('pk_test_')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Test publishable key must start with pk_test_',
        },
        { status: 400 }
      );
    }

    if (
      updatedSettings.live_publishable_key &&
      !updatedSettings.live_publishable_key.startsWith('pk_live_')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Live publishable key must start with pk_live_',
        },
        { status: 400 }
      );
    }

    if (
      updatedSettings.test_secret_key &&
      !updatedSettings.test_secret_key.startsWith('sk_test_')
    ) {
      return NextResponse.json(
        { success: false, error: 'Test secret key must start with sk_test_' },
        { status: 400 }
      );
    }

    if (
      updatedSettings.live_secret_key &&
      !updatedSettings.live_secret_key.startsWith('sk_live_')
    ) {
      return NextResponse.json(
        { success: false, error: 'Live secret key must start with sk_live_' },
        { status: 400 }
      );
    }

    // Upsert settings
    const { error } = await supabase.from('site_settings').upsert(
      {
        key: 'stripe',
        value: updatedSettings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

    if (error) {
      console.error('Error saving stripe settings:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Stripe settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating stripe settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}


