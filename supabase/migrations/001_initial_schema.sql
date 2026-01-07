-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TOURS TABLE
-- =====================================================
CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  pricing_engine TEXT NOT NULL CHECK (pricing_engine IN ('flat_per_person', 'adult_child', 'seat_based')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tours_slug ON tours(slug);
CREATE INDEX idx_tours_status ON tours(status);

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

