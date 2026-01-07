-- =====================================================
-- STRIPE PAYMENT SETTINGS
-- =====================================================

-- Create site_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- Insert stripe payment settings into site_settings
INSERT INTO site_settings (key, value) VALUES
  ('stripe', '{
    "mode": "test",
    "test_publishable_key": "",
    "test_secret_key": "",
    "live_publishable_key": "",
    "live_secret_key": "",
    "webhook_secret": "",
    "payment_methods": {
      "card": true,
      "google_pay": true,
      "apple_pay": true,
      "promptpay": true
    }
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Add stripe_payment_intent_id column to bookings table for tracking
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Add index for payment intent lookups
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_payment_intent_id 
ON bookings(stripe_payment_intent_id) 
WHERE stripe_payment_intent_id IS NOT NULL;

COMMENT ON COLUMN bookings.stripe_payment_intent_id IS 'Stripe PaymentIntent ID for tracking payment status';
