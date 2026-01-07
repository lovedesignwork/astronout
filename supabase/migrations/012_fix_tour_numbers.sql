-- =====================================================
-- FIX TOUR NUMBERS - Ensure all tours have tour_number
-- =====================================================

-- First, ensure the tour_number column exists
ALTER TABLE tours ADD COLUMN IF NOT EXISTS tour_number TEXT;

-- Create unique index on tour_number if not exists
CREATE UNIQUE INDEX IF NOT EXISTS idx_tours_tour_number ON tours(tour_number) WHERE tour_number IS NOT NULL;

-- =====================================================
-- FUNCTION TO GENERATE NEXT TOUR NUMBER
-- =====================================================
CREATE OR REPLACE FUNCTION generate_next_tour_number()
RETURNS TEXT AS $$
DECLARE
  max_number INTEGER;
  next_number TEXT;
BEGIN
  -- Get the maximum existing tour number (extract numeric part)
  SELECT COALESCE(MAX(CAST(NULLIF(regexp_replace(tour_number, '[^0-9]', '', 'g'), '') AS INTEGER)), 0)
  INTO max_number
  FROM tours
  WHERE tour_number IS NOT NULL;
  
  -- Increment and format with leading zeros (001, 002, etc.)
  -- Use 4 digits for better scalability
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
  -- Only assign if tour_number is not already set
  IF NEW.tour_number IS NULL THEN
    NEW.tour_number := generate_next_tour_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_assign_tour_number ON tours;

CREATE TRIGGER trigger_assign_tour_number
  BEFORE INSERT ON tours
  FOR EACH ROW
  EXECUTE FUNCTION assign_tour_number();

-- =====================================================
-- BACKFILL EXISTING TOURS WITH TOUR NUMBERS
-- =====================================================
-- Assign tour numbers to existing tours based on creation order
DO $$
DECLARE
  tour_record RECORD;
  counter INTEGER;
BEGIN
  -- Get the current max tour number
  SELECT COALESCE(MAX(CAST(NULLIF(regexp_replace(tour_number, '[^0-9]', '', 'g'), '') AS INTEGER)), 0)
  INTO counter
  FROM tours
  WHERE tour_number IS NOT NULL;
  
  -- Assign to tours without tour_number
  FOR tour_record IN 
    SELECT id FROM tours 
    WHERE tour_number IS NULL 
    ORDER BY created_at ASC
  LOOP
    counter := counter + 1;
    UPDATE tours 
    SET tour_number = LPAD(counter::TEXT, 4, '0')
    WHERE id = tour_record.id;
  END LOOP;
END $$;

-- =====================================================
-- COMMENT
-- =====================================================
COMMENT ON COLUMN tours.tour_number IS 'Unique sequential tour identifier (0001, 0002, 0003, etc.)';

