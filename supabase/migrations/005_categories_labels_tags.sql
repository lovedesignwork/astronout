-- =====================================================
-- TOUR CATEGORIES TABLE
-- =====================================================
CREATE TABLE tour_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tour_categories_slug ON tour_categories(slug);
CREATE INDEX idx_tour_categories_order ON tour_categories("order");

-- =====================================================
-- TOUR-CATEGORY JUNCTION TABLE (many-to-many)
-- =====================================================
CREATE TABLE tour_category_assignments (
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  category_id UUID REFERENCES tour_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tour_id, category_id)
);

CREATE INDEX idx_tour_category_assignments_tour ON tour_category_assignments(tour_id);
CREATE INDEX idx_tour_category_assignments_category ON tour_category_assignments(category_id);

-- =====================================================
-- SPECIAL LABELS TABLE (corner badges)
-- =====================================================
CREATE TABLE special_labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  background_color TEXT NOT NULL DEFAULT '#f97316',
  text_color TEXT NOT NULL DEFAULT '#ffffff',
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_special_labels_slug ON special_labels(slug);
CREATE INDEX idx_special_labels_order ON special_labels("order");

-- =====================================================
-- TOUR-SPECIAL LABEL JUNCTION TABLE
-- =====================================================
CREATE TABLE tour_special_label_assignments (
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  label_id UUID REFERENCES special_labels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tour_id, label_id)
);

CREATE INDEX idx_tour_special_label_assignments_tour ON tour_special_label_assignments(tour_id);
CREATE INDEX idx_tour_special_label_assignments_label ON tour_special_label_assignments(label_id);

-- =====================================================
-- ADD TAGS COLUMN TO TOURS TABLE
-- =====================================================
ALTER TABLE tours ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================
CREATE TRIGGER update_tour_categories_updated_at 
  BEFORE UPDATE ON tour_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_special_labels_updated_at 
  BEFORE UPDATE ON special_labels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES FOR CATEGORIES
-- =====================================================
ALTER TABLE tour_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to categories"
  ON tour_categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage categories"
  ON tour_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- RLS POLICIES FOR SPECIAL LABELS
-- =====================================================
ALTER TABLE special_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to special labels"
  ON special_labels FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage special labels"
  ON special_labels FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- RLS POLICIES FOR CATEGORY ASSIGNMENTS
-- =====================================================
ALTER TABLE tour_category_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to category assignments"
  ON tour_category_assignments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage category assignments"
  ON tour_category_assignments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- RLS POLICIES FOR SPECIAL LABEL ASSIGNMENTS
-- =====================================================
ALTER TABLE tour_special_label_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to special label assignments"
  ON tour_special_label_assignments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage special label assignments"
  ON tour_special_label_assignments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);



