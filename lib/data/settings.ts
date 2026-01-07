import { createPublicClient, createClient } from '@/lib/supabase/server';
import type { StripeSettings, StripePaymentMethods } from '@/types';

export interface BrandingSettings {
  logo_url: string | null;
  favicon_url: string | null;
}

export interface GeneralSettings {
  site_name: string;
  site_description: string;
}

export interface ContactSettings {
  email: string;
  phone: string;
  address: string;
}

export type { StripeSettings, StripePaymentMethods };

/**
 * Get branding settings (logo and favicon)
 * Uses public client to support static generation
 */
export async function getBrandingSettings(): Promise<BrandingSettings> {
  const defaultSettings = { logo_url: null, favicon_url: null };
  
  try {
    const supabase = createPublicClient();
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'branding')
      .maybeSingle(); // Use maybeSingle to not throw error if no row found

    if (error) {
      // Silently return defaults if table doesn't exist (PGRST205)
      if (error.code === 'PGRST205' || error.code === '42P01') {
        return defaultSettings;
      }
      console.error('Error fetching branding settings:', error);
      return defaultSettings;
    }

    return data?.value as BrandingSettings || defaultSettings;
  } catch (error) {
    console.error('Error in getBrandingSettings:', error);
    return defaultSettings;
  }
}

/**
 * Get general site settings
 * Uses public client to support static generation
 */
export async function getGeneralSettings(): Promise<GeneralSettings> {
  const defaultSettings = { site_name: 'Tour Booking', site_description: 'Book amazing tours and experiences' };
  
  try {
    const supabase = createPublicClient();
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'general')
      .maybeSingle(); // Use maybeSingle to not throw error if no row found

    if (error) {
      // Silently return defaults if table doesn't exist (PGRST205)
      if (error.code === 'PGRST205' || error.code === '42P01') {
        return defaultSettings;
      }
      console.error('Error fetching general settings:', error);
      return defaultSettings;
    }

    return data?.value as GeneralSettings || defaultSettings;
  } catch (error) {
    console.error('Error in getGeneralSettings:', error);
    return defaultSettings;
  }
}

/**
 * Get contact settings
 * Uses public client to support static generation
 */
export async function getContactSettings(): Promise<ContactSettings> {
  const defaultSettings = { email: '', phone: '', address: '' };
  
  try {
    const supabase = createPublicClient();
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'contact')
      .maybeSingle(); // Use maybeSingle to not throw error if no row found

    if (error) {
      // Silently return defaults if table doesn't exist (PGRST205)
      if (error.code === 'PGRST205' || error.code === '42P01') {
        return defaultSettings;
      }
      console.error('Error fetching contact settings:', error);
      return defaultSettings;
    }

    return data?.value as ContactSettings || defaultSettings;
  } catch (error) {
    console.error('Error in getContactSettings:', error);
    return defaultSettings;
  }
}

/**
 * Get all site settings at once
 */
export async function getAllSiteSettings() {
  const [branding, general, contact] = await Promise.all([
    getBrandingSettings(),
    getGeneralSettings(),
    getContactSettings(),
  ]);

  return {
    branding,
    general,
    contact,
  };
}

/**
 * Get Stripe payment settings
 * Uses public client to support static generation
 */
export async function getStripeSettings(): Promise<StripeSettings> {
  const defaultSettings: StripeSettings = {
    mode: 'test',
    test_publishable_key: '',
    test_secret_key: '',
    live_publishable_key: '',
    live_secret_key: '',
    webhook_secret: '',
    payment_methods: {
      card: true,
      google_pay: true,
      apple_pay: true,
      promptpay: true,
    },
  };

  try {
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'stripe')
      .maybeSingle();

    if (error) {
      // Silently return defaults if table doesn't exist
      if (error.code === 'PGRST205' || error.code === '42P01') {
        return defaultSettings;
      }
      console.error('Error fetching stripe settings:', error);
      return defaultSettings;
    }

    return (data?.value as StripeSettings) || defaultSettings;
  } catch (error) {
    console.error('Error in getStripeSettings:', error);
    return defaultSettings;
  }
}

/**
 * Get the active Stripe keys based on current mode
 */
export async function getActiveStripeKeys(): Promise<{
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  paymentMethods: StripePaymentMethods;
  mode: 'test' | 'live';
} | null> {
  const settings = await getStripeSettings();

  const publishableKey =
    settings.mode === 'live'
      ? settings.live_publishable_key
      : settings.test_publishable_key;

  const secretKey =
    settings.mode === 'live'
      ? settings.live_secret_key
      : settings.test_secret_key;

  // Fall back to environment variables if settings are not configured
  const finalPublishableKey =
    publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  const finalSecretKey =
    secretKey || process.env.STRIPE_SECRET_KEY || '';
  const finalWebhookSecret =
    settings.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET || '';

  if (!finalPublishableKey || !finalSecretKey) {
    return null;
  }

  return {
    publishableKey: finalPublishableKey,
    secretKey: finalSecretKey,
    webhookSecret: finalWebhookSecret,
    paymentMethods: settings.payment_methods,
    mode: settings.mode,
  };
}

