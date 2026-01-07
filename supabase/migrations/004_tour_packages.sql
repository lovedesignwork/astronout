-- =====================================================
-- TOUR PACKAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tour_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  pricing_type TEXT NOT NULL CHECK (pricing_type IN ('per_person', 'adult_child', 'per_seat', 'per_ticket')),
  pricing_config JSONB NOT NULL DEFAULT '{}',
  included_items JSONB DEFAULT '[]',
  calendar_enabled BOOLEAN DEFAULT false,
  calendar_config JSONB DEFAULT '{}',
  pickup_enabled BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tour_packages_tour_id ON tour_packages(tour_id);
CREATE INDEX idx_tour_packages_order ON tour_packages(tour_id, "order");

-- =====================================================
-- PACKAGE UPSELLS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS package_upsells (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL REFERENCES tour_packages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  pricing_type TEXT NOT NULL CHECK (pricing_type IN ('per_booking', 'per_person')),
  price DECIMAL(10,2) NOT NULL,
  "order" INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_package_upsells_package_id ON package_upsells(package_id);

-- =====================================================
-- EXTEND TOURS TABLE
-- =====================================================
ALTER TABLE tours ADD COLUMN IF NOT EXISTS hero_background_image TEXT;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS featured_images JSONB DEFAULT '[]';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS main_media JSONB DEFAULT '[]';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS additional_photos JSONB DEFAULT '[]';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS video_embed_code TEXT;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS video_section_title TEXT DEFAULT 'Video';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS google_reviews JSONB DEFAULT '[]';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS google_rating DECIMAL(2,1);
ALTER TABLE tours ADD COLUMN IF NOT EXISTS google_review_count INTEGER;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS safety_info_enabled BOOLEAN DEFAULT true;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS need_help_enabled BOOLEAN DEFAULT true;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS itinerary_title TEXT DEFAULT 'Itinerary';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS itinerary_images JSONB DEFAULT '[]';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS description_enabled BOOLEAN DEFAULT true;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS images_enabled BOOLEAN DEFAULT true;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS packages_enabled BOOLEAN DEFAULT true;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS itinerary_enabled BOOLEAN DEFAULT true;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS video_enabled BOOLEAN DEFAULT false;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS google_reviews_enabled BOOLEAN DEFAULT true;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_tour_packages_updated_at 
  BEFORE UPDATE ON tour_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_package_upsells_updated_at 
  BEFORE UPDATE ON package_upsells
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES FOR TOUR_PACKAGES
-- =====================================================
ALTER TABLE tour_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to tour_packages" ON tour_packages
  FOR SELECT USING (true);

CREATE POLICY "Allow admin full access to tour_packages" ON tour_packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );

-- =====================================================
-- RLS POLICIES FOR PACKAGE_UPSELLS
-- =====================================================
ALTER TABLE package_upsells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to package_upsells" ON package_upsells
  FOR SELECT USING (true);

CREATE POLICY "Allow admin full access to package_upsells" ON package_upsells
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );





