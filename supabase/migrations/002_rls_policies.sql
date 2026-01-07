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





