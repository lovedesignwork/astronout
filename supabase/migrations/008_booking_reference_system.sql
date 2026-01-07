-- =====================================================
-- BOOKING REFERENCE SYSTEM
-- Format: AST-237551 (running number starting from 237551)
-- =====================================================

-- =====================================================
-- CREATE SEQUENCE FOR BOOKING NUMBERS
-- =====================================================
-- Start from 237551 as specified
CREATE SEQUENCE IF NOT EXISTS booking_number_seq START WITH 237551;

-- =====================================================
-- FUNCTION TO GENERATE BOOKING REFERENCE
-- =====================================================
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
  next_number BIGINT;
  reference TEXT;
BEGIN
  -- Get next value from sequence
  next_number := nextval('booking_number_seq');
  
  -- Format as AST-XXXXXX
  reference := 'AST-' || next_number::TEXT;
  
  RETURN reference;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER TO AUTO-ASSIGN BOOKING REFERENCE ON INSERT
-- =====================================================
CREATE OR REPLACE FUNCTION assign_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  -- Only assign if reference is not already set
  IF NEW.reference IS NULL OR NEW.reference = '' THEN
    NEW.reference := generate_booking_reference();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_assign_booking_reference ON bookings;

-- Create new trigger
CREATE TRIGGER trigger_assign_booking_reference
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION assign_booking_reference();

-- =====================================================
-- BACKFILL EXISTING BOOKINGS WITH NEW REFERENCES
-- =====================================================
-- Update existing bookings to use the new format
-- This preserves the order by using the existing created_at timestamp
DO $$
DECLARE
  booking_record RECORD;
  new_reference TEXT;
BEGIN
  FOR booking_record IN 
    SELECT id, reference, created_at 
    FROM bookings 
    ORDER BY created_at ASC
  LOOP
    -- Generate new reference using the sequence
    new_reference := generate_booking_reference();
    
    -- Update the booking
    UPDATE bookings 
    SET reference = new_reference
    WHERE id = booking_record.id;
    
    -- Log the change (optional, for tracking)
    RAISE NOTICE 'Updated booking % from % to %', 
      booking_record.id, 
      booking_record.reference, 
      new_reference;
  END LOOP;
END $$;

-- =====================================================
-- HELPER FUNCTION TO GET CURRENT BOOKING NUMBER
-- =====================================================
CREATE OR REPLACE FUNCTION get_current_booking_number()
RETURNS BIGINT AS $$
DECLARE
  current_val BIGINT;
BEGIN
  SELECT last_value INTO current_val FROM booking_number_seq;
  RETURN current_val;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- HELPER FUNCTION TO GET NEXT BOOKING NUMBER (PREVIEW)
-- =====================================================
CREATE OR REPLACE FUNCTION preview_next_booking_number()
RETURNS TEXT AS $$
DECLARE
  next_val BIGINT;
BEGIN
  SELECT last_value + 1 INTO next_val FROM booking_number_seq;
  RETURN 'AST-' || next_val::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON SEQUENCE booking_number_seq IS 'Sequential booking numbers starting from 237551';
COMMENT ON FUNCTION generate_booking_reference() IS 'Generates booking reference in format AST-XXXXXX';
COMMENT ON FUNCTION assign_booking_reference() IS 'Trigger function to auto-assign booking reference';
COMMENT ON FUNCTION get_current_booking_number() IS 'Returns the current booking number from sequence';
COMMENT ON FUNCTION preview_next_booking_number() IS 'Preview the next booking reference without incrementing';

-- =====================================================
-- VERIFY INSTALLATION
-- =====================================================
-- Check current sequence value
SELECT 'Current booking number: ' || get_current_booking_number() AS status;

-- Preview next booking reference
SELECT 'Next booking will be: ' || preview_next_booking_number() AS next_booking;



