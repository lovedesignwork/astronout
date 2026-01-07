-- =====================================================
-- SITE SETTINGS TABLE
-- =====================================================
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_site_settings_key ON site_settings(key);

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES
  ('branding', '{"logo_url": null, "favicon_url": null}'::jsonb),
  ('general', '{"site_name": "Tour Booking", "site_description": "Book amazing tours and experiences"}'::jsonb),
  ('contact', '{"email": "", "phone": "", "address": ""}'::jsonb);

-- RLS Policies for site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to site settings
CREATE POLICY "Allow public read access to site_settings"
  ON site_settings
  FOR SELECT
  USING (true);

-- Only admin users can update site settings
CREATE POLICY "Allow admin users to update site_settings"
  ON site_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Only admin users can insert site settings
CREATE POLICY "Allow admin users to insert site_settings"
  ON site_settings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );



