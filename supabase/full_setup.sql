-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TOURS TABLE
-- =====================================================
CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_number TEXT,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  pricing_engine TEXT NOT NULL CHECK (pricing_engine IN ('flat_per_person', 'adult_child', 'seat_based')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tours_slug ON tours(slug);
CREATE INDEX idx_tours_status ON tours(status);
CREATE UNIQUE INDEX idx_tours_tour_number ON tours(tour_number) WHERE tour_number IS NOT NULL;

-- =====================================================
-- FUNCTION TO GENERATE NEXT TOUR NUMBER
-- =====================================================
CREATE OR REPLACE FUNCTION generate_next_tour_number()
RETURNS TEXT AS $$
DECLARE
  max_number INTEGER;
  next_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(NULLIF(regexp_replace(tour_number, '[^0-9]', '', 'g'), '') AS INTEGER)), 0)
  INTO max_number
  FROM tours
  WHERE tour_number IS NOT NULL;
  
  next_number := LPAD((max_number + 1)::TEXT, 4, '0');
  
  RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER TO AUTO-ASSIGN TOUR NUMBER ON INSERT
-- =====================================================
CREATE OR REPLACE FUNCTION assign_tour_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tour_number IS NULL THEN
    NEW.tour_number := generate_next_tour_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_assign_tour_number
  BEFORE INSERT ON tours
  FOR EACH ROW
  EXECUTE FUNCTION assign_tour_number();

COMMENT ON COLUMN tours.tour_number IS 'Unique sequential tour identifier (0001, 0002, 0003, etc.)';

-- =====================================================
-- TOUR BLOCKS TABLE
-- =====================================================
CREATE TABLE tour_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tour_blocks_tour_id ON tour_blocks(tour_id);
CREATE INDEX idx_tour_blocks_order ON tour_blocks(tour_id, "order");

-- =====================================================
-- TOUR BLOCK TRANSLATIONS TABLE
-- =====================================================
CREATE TABLE tour_block_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_id UUID NOT NULL REFERENCES tour_blocks(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('en', 'zh', 'ru', 'ko', 'ja', 'fr', 'it', 'es', 'id')),
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(block_id, language)
);

CREATE INDEX idx_tour_block_translations_block_id ON tour_block_translations(block_id);
CREATE INDEX idx_tour_block_translations_language ON tour_block_translations(language);

-- =====================================================
-- TOUR PRICING TABLE
-- =====================================================
CREATE TABLE tour_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  config JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tour_id)
);

CREATE INDEX idx_tour_pricing_tour_id ON tour_pricing(tour_id);

-- =====================================================
-- TOUR AVAILABILITY TABLE
-- =====================================================
CREATE TABLE tour_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TEXT DEFAULT '',
  capacity INTEGER NOT NULL DEFAULT 0,
  booked INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_tour_availability_unique ON tour_availability(tour_id, date, COALESCE(time_slot, ''));
CREATE INDEX idx_tour_availability_tour_date ON tour_availability(tour_id, date);
CREATE INDEX idx_tour_availability_enabled ON tour_availability(enabled) WHERE enabled = true;

-- =====================================================
-- UPSELLS TABLE
-- =====================================================
CREATE TABLE upsells (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  pricing_type TEXT NOT NULL DEFAULT 'per_person' CHECK (pricing_type IN ('per_person', 'per_booking', 'flat')),
  retail_price DECIMAL(10, 2) NOT NULL,
  net_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'THB',
  max_quantity INTEGER DEFAULT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_upsells_tour_id ON upsells(tour_id);
CREATE INDEX idx_upsells_status ON upsells(status);

-- =====================================================
-- UPSELL TRANSLATIONS TABLE
-- =====================================================
CREATE TABLE upsell_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  upsell_id UUID NOT NULL REFERENCES upsells(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('en', 'zh', 'ru', 'ko', 'ja', 'fr', 'it', 'es', 'id')),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(upsell_id, language)
);

CREATE INDEX idx_upsell_translations_upsell_id ON upsell_translations(upsell_id);

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT UNIQUE NOT NULL,
  tour_id UUID NOT NULL REFERENCES tours(id),
  availability_id UUID REFERENCES tour_availability(id),
  booking_date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_nationality TEXT,
  total_retail DECIMAL(10, 2) NOT NULL,
  total_net DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'THB',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'pending_payment', 'confirmed', 'cancelled', 'completed')),
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'zh', 'ru', 'ko', 'ja', 'fr', 'it', 'es', 'id')),
  voucher_token TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_reference ON bookings(reference);
CREATE INDEX idx_bookings_tour_id ON bookings(tour_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX idx_bookings_customer_email ON bookings(customer_email);

-- =====================================================
-- BOOKING ITEMS TABLE
-- =====================================================
CREATE TABLE booking_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('tour', 'upsell')),
  item_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  retail_price_snapshot DECIMAL(10, 2) NOT NULL,
  net_price_snapshot DECIMAL(10, 2) NOT NULL,
  subtotal_retail DECIMAL(10, 2) NOT NULL,
  subtotal_net DECIMAL(10, 2) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_booking_items_booking_id ON booking_items(booking_id);
CREATE INDEX idx_booking_items_item_type ON booking_items(item_type);

-- =====================================================
-- ADMIN USERS TABLE
-- =====================================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'operator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON admin_users(email);

-- =====================================================
-- SEO ENTITIES TABLE
-- =====================================================
CREATE TABLE seo_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('tour', 'page', 'category')),
  entity_id UUID,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entity_type, slug)
);

CREATE INDEX idx_seo_entities_entity_type ON seo_entities(entity_type);
CREATE INDEX idx_seo_entities_entity_id ON seo_entities(entity_id);

-- =====================================================
-- SEO TRANSLATIONS TABLE
-- =====================================================
CREATE TABLE seo_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seo_entity_id UUID NOT NULL REFERENCES seo_entities(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('en', 'zh', 'ru', 'ko', 'ja', 'fr', 'it', 'es', 'id')),
  meta_title TEXT,
  meta_description TEXT,
  focus_keyword TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  canonical_url_override TEXT,
  noindex BOOLEAN NOT NULL DEFAULT false,
  nofollow BOOLEAN NOT NULL DEFAULT false,
  structured_data_override_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(seo_entity_id, language)
);

CREATE INDEX idx_seo_translations_seo_entity_id ON seo_translations(seo_entity_id);
CREATE INDEX idx_seo_translations_language ON seo_translations(language);

-- =====================================================
-- REDIRECTS TABLE
-- =====================================================
CREATE TABLE redirects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_path TEXT UNIQUE NOT NULL,
  to_path TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301 CHECK (status_code IN (301, 302, 307, 308)),
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_redirects_from_path ON redirects(from_path) WHERE enabled = true;

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_tours_updated_at 
  BEFORE UPDATE ON tours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_blocks_updated_at 
  BEFORE UPDATE ON tour_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_block_translations_updated_at 
  BEFORE UPDATE ON tour_block_translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_pricing_updated_at 
  BEFORE UPDATE ON tour_pricing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_availability_updated_at 
  BEFORE UPDATE ON tour_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_upsells_updated_at 
  BEFORE UPDATE ON upsells
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_upsell_translations_updated_at 
  BEFORE UPDATE ON upsell_translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at 
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_entities_updated_at 
  BEFORE UPDATE ON seo_entities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_translations_updated_at 
  BEFORE UPDATE ON seo_translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_redirects_updated_at 
  BEFORE UPDATE ON redirects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_block_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE upsells ENABLE ROW LEVEL SECURITY;
ALTER TABLE upsell_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTION: CHECK IF USER IS ADMIN
-- =====================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TOURS - Public can read published, Admin full access
-- =====================================================
CREATE POLICY "Public can read published tours"
  ON tours FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins have full access to tours"
  ON tours FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- TOUR BLOCKS - Public can read enabled blocks of published tours
-- =====================================================
CREATE POLICY "Public can read enabled tour blocks"
  ON tour_blocks FOR SELECT
  USING (
    enabled = true AND
    EXISTS (
      SELECT 1 FROM tours
      WHERE tours.id = tour_blocks.tour_id
      AND tours.status = 'published'
    )
  );

CREATE POLICY "Admins have full access to tour blocks"
  ON tour_blocks FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- TOUR BLOCK TRANSLATIONS - Public can read translations of enabled blocks
-- =====================================================
CREATE POLICY "Public can read tour block translations"
  ON tour_block_translations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tour_blocks
      JOIN tours ON tours.id = tour_blocks.tour_id
      WHERE tour_blocks.id = tour_block_translations.block_id
      AND tour_blocks.enabled = true
      AND tours.status = 'published'
    )
  );

CREATE POLICY "Admins have full access to tour block translations"
  ON tour_block_translations FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- TOUR PRICING - Public can read pricing of published tours
-- =====================================================
CREATE POLICY "Public can read tour pricing"
  ON tour_pricing FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tours
      WHERE tours.id = tour_pricing.tour_id
      AND tours.status = 'published'
    )
  );

CREATE POLICY "Admins have full access to tour pricing"
  ON tour_pricing FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- TOUR AVAILABILITY - Public can read enabled availability
-- =====================================================
CREATE POLICY "Public can read enabled tour availability"
  ON tour_availability FOR SELECT
  USING (
    enabled = true AND
    EXISTS (
      SELECT 1 FROM tours
      WHERE tours.id = tour_availability.tour_id
      AND tours.status = 'published'
    )
  );

CREATE POLICY "Admins have full access to tour availability"
  ON tour_availability FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- UPSELLS - Public can read active upsells of published tours
-- =====================================================
CREATE POLICY "Public can read active upsells"
  ON upsells FOR SELECT
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM tours
      WHERE tours.id = upsells.tour_id
      AND tours.status = 'published'
    )
  );

CREATE POLICY "Admins have full access to upsells"
  ON upsells FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- UPSELL TRANSLATIONS - Public can read translations of active upsells
-- =====================================================
CREATE POLICY "Public can read upsell translations"
  ON upsell_translations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM upsells
      JOIN tours ON tours.id = upsells.tour_id
      WHERE upsells.id = upsell_translations.upsell_id
      AND upsells.status = 'active'
      AND tours.status = 'published'
    )
  );

CREATE POLICY "Admins have full access to upsell translations"
  ON upsell_translations FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- BOOKINGS - Public can CREATE only, Admin can read/update
-- =====================================================
CREATE POLICY "Public can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read all bookings"
  ON bookings FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update bookings"
  ON bookings FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete bookings"
  ON bookings FOR DELETE
  USING (is_admin());

-- =====================================================
-- BOOKING ITEMS - Public can CREATE only, Admin can read
-- =====================================================
CREATE POLICY "Public can create booking items"
  ON booking_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read all booking items"
  ON booking_items FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update booking items"
  ON booking_items FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete booking items"
  ON booking_items FOR DELETE
  USING (is_admin());

-- =====================================================
-- ADMIN USERS - Admin only
-- =====================================================
CREATE POLICY "Admins have full access to admin users"
  ON admin_users FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Allow users to read their own admin record
CREATE POLICY "Users can read own admin record"
  ON admin_users FOR SELECT
  USING (id = auth.uid());

-- =====================================================
-- SEO ENTITIES - Public can read, Admin full access
-- =====================================================
CREATE POLICY "Public can read seo entities"
  ON seo_entities FOR SELECT
  USING (true);

CREATE POLICY "Admins have full access to seo entities"
  ON seo_entities FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- SEO TRANSLATIONS - Public can read, Admin full access
-- =====================================================
CREATE POLICY "Public can read seo translations"
  ON seo_translations FOR SELECT
  USING (true);

CREATE POLICY "Admins have full access to seo translations"
  ON seo_translations FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- REDIRECTS - Public can read enabled, Admin full access
-- =====================================================
CREATE POLICY "Public can read enabled redirects"
  ON redirects FOR SELECT
  USING (enabled = true);

CREATE POLICY "Admins have full access to redirects"
  ON redirects FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- SEED DATA FOR ASTRONOUT PLATFORM
-- =====================================================

-- Tour 1: Phuket Zipline Adventure (flat_per_person)
INSERT INTO tours (id, tour_number, slug, status, pricing_engine) VALUES
  ('11111111-1111-1111-1111-111111111111', '0001', 'phuket-zipline-adventure', 'published', 'flat_per_person');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('11111111-1111-1111-1111-111111111111', '{
    "type": "flat_per_person",
    "retail_price": 1800,
    "net_price": 1400,
    "currency": "THB",
    "min_pax": 1,
    "max_pax": 10
  }');

-- Blocks for Zipline
INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled, config) VALUES
  ('a1111111-0001-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'hero', 1, true, '{}'),
  ('a1111111-0002-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'highlights', 2, true, '{}'),
  ('a1111111-0003-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'availability_selector', 3, true, '{}'),
  ('a1111111-0004-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'pricing_selector', 4, true, '{}'),
  ('a1111111-0005-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'included_excluded', 5, true, '{}'),
  ('a1111111-0006-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'safety_info', 6, true, '{}'),
  ('a1111111-0007-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'upsells', 7, true, '{}'),
  ('a1111111-0008-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'terms', 8, true, '{}');

-- Translations for Zipline (EN + ZH only for testing fallback)
INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('a1111111-0001-0000-0000-000000000001', 'en', 'Phuket Zipline Adventure', '{"subtitle": "Soar through the jungle canopy on 16 thrilling ziplines", "imageUrl": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200", "location": "Phuket, Thailand", "duration": "4 hours", "rating": 4.8, "reviewCount": 324, "badges": ["Best Seller", "Eco-Friendly"]}'),
  ('a1111111-0001-0000-0000-000000000001', 'zh', 'æ™®å‰å²›ä¸›æž—é£žè·ƒ', '{"subtitle": "åœ¨16æ¡åˆºæ¿€çš„æ»‘ç´¢ä¸Šç©¿è¶Šä¸›æž—æ ‘å† ", "imageUrl": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200", "location": "æ³°å›½æ™®å‰å²›", "duration": "4å°æ—¶", "rating": 4.8, "reviewCount": 324, "badges": ["ç•…é”€", "çŽ¯ä¿"]}'),
  ('a1111111-0002-0000-0000-000000000001', 'en', 'Tour Highlights', '{"items": ["16 exciting zipline platforms", "Professional safety equipment", "Experienced guides", "Beautiful jungle scenery", "Photo opportunities", "Refreshments included"]}'),
  ('a1111111-0002-0000-0000-000000000001', 'zh', 'è¡Œç¨‹äº®ç‚¹', '{"items": ["16ä¸ªåˆºæ¿€çš„æ»‘ç´¢å¹³å°", "ä¸“ä¸šå®‰å…¨è®¾å¤‡", "ç»éªŒä¸°å¯Œçš„å¯¼æ¸¸", "ç¾Žä¸½çš„ä¸›æž—é£Žæ™¯", "æ‹ç…§æœºä¼š", "å«èŒ¶ç‚¹"]}'),
  ('a1111111-0003-0000-0000-000000000001', 'en', 'Select Date', '{}'),
  ('a1111111-0004-0000-0000-000000000001', 'en', 'Select Tickets', '{}'),
  ('a1111111-0005-0000-0000-000000000001', 'en', 'What''s Included', '{"included": ["Hotel pickup & drop-off", "Safety equipment", "Professional guide", "Insurance", "Refreshments"], "excluded": ["Personal expenses", "Tips", "Lunch"]}'),
  ('a1111111-0006-0000-0000-000000000001', 'en', 'Safety Information', '{"items": ["Weight limit: 20-120kg", "Minimum age: 7 years", "Not suitable for pregnant women", "Closed-toe shoes required"], "restrictions": ["Heart conditions", "Back problems", "Fear of heights"]}'),
  ('a1111111-0007-0000-0000-000000000001', 'en', 'Add-ons', '{}'),
  ('a1111111-0008-0000-0000-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation up to 24 hours before the tour. 50% refund for cancellations within 24 hours.", "refundPolicy": "Full refund for cancellations due to weather conditions."}');

-- Availability for Zipline
INSERT INTO tour_availability (tour_id, date, time_slot, capacity, booked, enabled) VALUES
  ('11111111-1111-1111-1111-111111111111', '2026-01-15', '08:00', 20, 5, true),
  ('11111111-1111-1111-1111-111111111111', '2026-01-15', '13:00', 20, 3, true),
  ('11111111-1111-1111-1111-111111111111', '2026-01-16', '08:00', 20, 0, true),
  ('11111111-1111-1111-1111-111111111111', '2026-01-16', '13:00', 20, 0, true),
  ('11111111-1111-1111-1111-111111111111', '2026-01-17', '08:00', 20, 0, true),
  ('11111111-1111-1111-1111-111111111111', '2026-01-17', '13:00', 20, 0, true);

-- Upsells for Zipline
INSERT INTO upsells (id, tour_id, status, pricing_type, retail_price, net_price, currency, "order") VALUES
  ('c1111111-0001-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'active', 'per_booking', 500, 300, 'THB', 1),
  ('c1111111-0002-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'active', 'per_person', 200, 100, 'THB', 2);

INSERT INTO upsell_translations (upsell_id, language, title, description) VALUES
  ('c1111111-0001-0000-0000-000000000001', 'en', 'GoPro Video Package', 'Professional video recording of your zipline experience'),
  ('c1111111-0002-0000-0000-000000000001', 'en', 'Photo Package', 'Digital photos at each platform');

-- =====================================================
-- Tour 2: Phi Phi Islands Boat Tour (adult_child)
-- =====================================================
INSERT INTO tours (id, tour_number, slug, status, pricing_engine) VALUES
  ('22222222-2222-2222-2222-222222222222', '0002', 'phi-phi-islands-boat-tour', 'published', 'adult_child');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('22222222-2222-2222-2222-222222222222', '{
    "type": "adult_child",
    "adult_retail_price": 2500,
    "adult_net_price": 2000,
    "child_retail_price": 1500,
    "child_net_price": 1200,
    "currency": "THB",
    "child_age_max": 11,
    "min_pax": 1,
    "max_pax": 8
  }');

-- Blocks for Phi Phi
INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled, config) VALUES
  ('a2222222-0001-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'hero', 1, true, '{}'),
  ('a2222222-0002-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'highlights', 2, true, '{}'),
  ('a2222222-0003-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'itinerary', 3, true, '{}'),
  ('a2222222-0004-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'availability_selector', 4, true, '{}'),
  ('a2222222-0005-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'pricing_selector', 5, true, '{}'),
  ('a2222222-0006-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'included_excluded', 6, true, '{}'),
  ('a2222222-0007-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'what_to_bring', 7, true, '{}'),
  ('a2222222-0008-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'map', 8, true, '{}'),
  ('a2222222-0009-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'reviews', 9, true, '{}'),
  ('a2222222-0010-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'upsells', 10, true, '{}'),
  ('a2222222-0011-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'terms', 11, true, '{}');

-- Translations for Phi Phi (Full EN)
INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('a2222222-0001-0000-0000-000000000001', 'en', 'Phi Phi Islands Day Tour by Speedboat', '{"subtitle": "Visit Maya Bay, Pileh Lagoon, and more stunning locations", "imageUrl": "https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=1200", "location": "Phi Phi Islands, Thailand", "duration": "Full Day (8 hours)", "rating": 4.9, "reviewCount": 856, "badges": ["Top Rated", "Bestseller"]}'),
  ('a2222222-0002-0000-0000-000000000001', 'en', 'Tour Highlights', '{"items": ["Visit famous Maya Bay", "Snorkeling at Pileh Lagoon", "Monkey Beach visit", "Viking Cave viewing", "Lunch on Phi Phi Don", "Swimming in crystal clear waters"]}'),
  ('a2222222-0003-0000-0000-000000000001', 'en', 'Itinerary', '{"items": [{"time": "07:00", "title": "Hotel Pickup", "description": "Pickup from your hotel in Phuket"}, {"time": "08:30", "title": "Depart from Pier", "description": "Board speedboat and head to Phi Phi Islands"}, {"time": "10:00", "title": "Maya Bay", "description": "Visit the famous beach from The Beach movie"}, {"time": "11:00", "title": "Pileh Lagoon", "description": "Snorkeling in crystal clear waters"}, {"time": "12:30", "title": "Lunch", "description": "Thai buffet lunch on Phi Phi Don"}, {"time": "14:00", "title": "Monkey Beach", "description": "See wild monkeys in their natural habitat"}, {"time": "15:30", "title": "Return", "description": "Head back to Phuket"}, {"time": "17:30", "title": "Hotel Drop-off", "description": "Return to your hotel"}]}'),
  ('a2222222-0004-0000-0000-000000000001', 'en', 'Select Date', '{}'),
  ('a2222222-0005-0000-0000-000000000001', 'en', 'Select Tickets', '{}'),
  ('a2222222-0006-0000-0000-000000000001', 'en', 'What''s Included', '{"included": ["Hotel transfers", "Speedboat ride", "National park fees", "Snorkeling equipment", "Buffet lunch", "Drinking water", "English-speaking guide", "Insurance"], "excluded": ["Personal expenses", "Alcoholic drinks", "Tips"]}'),
  ('a2222222-0007-0000-0000-000000000001', 'en', 'What to Bring', '{"items": ["Swimwear", "Sunscreen", "Towel", "Camera", "Cash for extras", "Sunglasses", "Hat"], "note": "Waterproof bags available for rent at the pier"}'),
  ('a2222222-0008-0000-0000-000000000001', 'en', 'Meeting Point', '{"address": "Rassada Pier, Phuket", "meetingPoint": "We will pick you up from your hotel. Please be ready 15 minutes before pickup time.", "latitude": 7.8804, "longitude": 98.3923}'),
  ('a2222222-0009-0000-0000-000000000001', 'en', 'Reviews', '{"averageRating": 4.9, "totalReviews": 856, "reviews": [{"author": "Sarah M.", "rating": 5, "date": "December 2025", "comment": "Amazing experience! The water was so clear and the crew was fantastic.", "country": "Australia"}, {"author": "John D.", "rating": 5, "date": "December 2025", "comment": "Best day trip in Thailand. Maya Bay was breathtaking!", "country": "USA"}, {"author": "Emma L.", "rating": 4, "date": "November 2025", "comment": "Great tour but quite crowded at some spots.", "country": "UK"}]}'),
  ('a2222222-0010-0000-0000-000000000001', 'en', 'Add-ons', '{}'),
  ('a2222222-0011-0000-0000-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation up to 48 hours before departure. 50% refund for cancellations within 24-48 hours. No refund within 24 hours.", "refundPolicy": "Full refund if tour is cancelled due to weather conditions."}');

-- Availability for Phi Phi
INSERT INTO tour_availability (tour_id, date, time_slot, capacity, booked, enabled) VALUES
  ('22222222-2222-2222-2222-222222222222', '2026-01-15', '07:00', 30, 12, true),
  ('22222222-2222-2222-2222-222222222222', '2026-01-16', '07:00', 30, 8, true),
  ('22222222-2222-2222-2222-222222222222', '2026-01-17', '07:00', 30, 0, true),
  ('22222222-2222-2222-2222-222222222222', '2026-01-18', '07:00', 30, 0, true);

-- Upsells for Phi Phi
INSERT INTO upsells (id, tour_id, status, pricing_type, retail_price, net_price, currency, "order") VALUES
  ('c2222222-0001-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'active', 'per_booking', 800, 500, 'THB', 1),
  ('c2222222-0002-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'active', 'per_person', 300, 150, 'THB', 2),
  ('c2222222-0003-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'active', 'flat', 150, 50, 'THB', 3);

INSERT INTO upsell_translations (upsell_id, language, title, description) VALUES
  ('c2222222-0001-0000-0000-000000000001', 'en', 'Private Speedboat Upgrade', 'Upgrade to a private speedboat for your group'),
  ('c2222222-0002-0000-0000-000000000001', 'en', 'Underwater Camera Rental', 'Waterproof camera to capture your snorkeling moments'),
  ('c2222222-0003-0000-0000-000000000001', 'en', 'Waterproof Phone Pouch', 'Keep your phone safe and dry');

-- =====================================================
-- Tour 3: Siam Cabaret Show (seat_based)
-- =====================================================
INSERT INTO tours (id, tour_number, slug, status, pricing_engine) VALUES
  ('33333333-3333-3333-3333-333333333333', '0003', 'siam-cabaret-show', 'published', 'seat_based');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('33333333-3333-3333-3333-333333333333', '{
    "type": "seat_based",
    "currency": "THB",
    "seats": [
      {"seat_type": "VIP", "retail_price": 1500, "net_price": 1200, "capacity": 50},
      {"seat_type": "Standard", "retail_price": 900, "net_price": 700, "capacity": 150}
    ]
  }');

-- Blocks for Cabaret
INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled, config) VALUES
  ('a3333333-0001-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'hero', 1, true, '{}'),
  ('a3333333-0002-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'highlights', 2, true, '{}'),
  ('a3333333-0003-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'availability_selector', 3, true, '{}'),
  ('a3333333-0004-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'pricing_selector', 4, true, '{}'),
  ('a3333333-0005-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'included_excluded', 5, true, '{}'),
  ('a3333333-0006-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'map', 6, true, '{}'),
  ('a3333333-0007-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'reviews', 7, true, '{}'),
  ('a3333333-0008-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'terms', 8, true, '{}');

-- Translations for Cabaret
INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('a3333333-0001-0000-0000-000000000001', 'en', 'Siam Cabaret Show Phuket', '{"subtitle": "World-famous ladyboy cabaret show with stunning performances", "imageUrl": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200", "location": "Patong Beach, Phuket", "duration": "1.5 hours", "rating": 4.7, "reviewCount": 1243, "badges": ["Entertainment", "Must See"]}'),
  ('a3333333-0002-0000-0000-000000000001', 'en', 'Show Highlights', '{"items": ["Spectacular costumes", "International music performances", "Broadway-style production", "World-class performers", "Photo opportunities after show", "Air-conditioned theater"]}'),
  ('a3333333-0003-0000-0000-000000000001', 'en', 'Select Show Time', '{}'),
  ('a3333333-0004-0000-0000-000000000001', 'en', 'Select Seats', '{}'),
  ('a3333333-0005-0000-0000-000000000001', 'en', 'What''s Included', '{"included": ["Show ticket", "Seat as selected", "Air-conditioned venue"], "excluded": ["Hotel transfers", "Drinks", "Tips for performers"]}'),
  ('a3333333-0006-0000-0000-000000000001', 'en', 'Venue Location', '{"address": "Siam Niramit Theatre, Patong Beach", "meetingPoint": "Please arrive 30 minutes before show time", "latitude": 7.8961, "longitude": 98.2963}'),
  ('a3333333-0007-0000-0000-000000000001', 'en', 'Reviews', '{"averageRating": 4.7, "totalReviews": 1243, "reviews": [{"author": "Michael T.", "rating": 5, "date": "December 2025", "comment": "Incredible show! The costumes and performances were amazing.", "country": "Germany"}, {"author": "Lisa K.", "rating": 5, "date": "December 2025", "comment": "A must-see in Phuket. VIP seats are worth it!", "country": "Canada"}]}'),
  ('a3333333-0008-0000-0000-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation up to 24 hours before the show. No refund within 24 hours.", "refundPolicy": "Full refund if show is cancelled by venue."}');

-- Availability for Cabaret (multiple show times)
INSERT INTO tour_availability (tour_id, date, time_slot, capacity, booked, enabled) VALUES
  ('33333333-3333-3333-3333-333333333333', '2026-01-15', '18:00', 200, 45, true),
  ('33333333-3333-3333-3333-333333333333', '2026-01-15', '20:30', 200, 30, true),
  ('33333333-3333-3333-3333-333333333333', '2026-01-16', '18:00', 200, 20, true),
  ('33333333-3333-3333-3333-333333333333', '2026-01-16', '20:30', 200, 15, true),
  ('33333333-3333-3333-3333-333333333333', '2026-01-17', '18:00', 200, 0, true),
  ('33333333-3333-3333-3333-333333333333', '2026-01-17', '20:30', 200, 0, true);

-- Upsells for Cabaret
INSERT INTO upsells (id, tour_id, status, pricing_type, retail_price, net_price, currency, "order") VALUES
  ('c3333333-0001-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'active', 'per_booking', 600, 400, 'THB', 1),
  ('c3333333-0002-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'active', 'per_person', 250, 150, 'THB', 2);

INSERT INTO upsell_translations (upsell_id, language, title, description) VALUES
  ('c3333333-0001-0000-0000-000000000001', 'en', 'Hotel Transfer', 'Round-trip transfer from your hotel'),
  ('c3333333-0002-0000-0000-000000000001', 'en', 'Photo with Performers', 'Professional photo opportunity with the stars');
