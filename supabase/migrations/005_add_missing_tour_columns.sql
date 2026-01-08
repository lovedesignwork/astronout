-- =====================================================
-- FIX: Add missing columns to tours table
-- Run this migration if you're seeing errors like:
-- "Could not find the 'additional_photos' column of 'tours' in the schema cache"
-- =====================================================

-- Image-related columns
ALTER TABLE tours ADD COLUMN IF NOT EXISTS hero_background_image TEXT;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS featured_images JSONB DEFAULT '[]';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS main_media JSONB DEFAULT '[]';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS additional_photos JSONB DEFAULT '[]';

-- Video columns
ALTER TABLE tours ADD COLUMN IF NOT EXISTS video_embed_code TEXT;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS video_section_title TEXT DEFAULT 'Video';

-- Google Reviews columns
ALTER TABLE tours ADD COLUMN IF NOT EXISTS google_reviews JSONB DEFAULT '[]';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS google_rating DECIMAL(2,1);
ALTER TABLE tours ADD COLUMN IF NOT EXISTS google_review_count INTEGER;

-- Itinerary columns
ALTER TABLE tours ADD COLUMN IF NOT EXISTS itinerary_title TEXT DEFAULT 'Itinerary';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS itinerary_images JSONB DEFAULT '[]';

-- Section toggle columns (enable/disable sections on tour page)
ALTER TABLE tours ADD COLUMN IF NOT EXISTS description_enabled BOOLEAN DEFAULT true;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS images_enabled BOOLEAN DEFAULT true;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS packages_enabled BOOLEAN DEFAULT true;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS itinerary_enabled BOOLEAN DEFAULT true;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS video_enabled BOOLEAN DEFAULT false;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS google_reviews_enabled BOOLEAN DEFAULT true;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS safety_info_enabled BOOLEAN DEFAULT true;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS need_help_enabled BOOLEAN DEFAULT true;

-- Tags column for custom tour labels
ALTER TABLE tours ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';

-- =====================================================
-- Verify columns were added
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Migration completed. Verifying columns...';
  
  -- Check if all columns exist
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'tours' 
    AND column_name IN (
      'hero_background_image', 'featured_images', 'main_media', 
      'additional_photos', 'video_embed_code', 'video_section_title',
      'google_reviews', 'google_rating', 'google_review_count',
      'itinerary_title', 'itinerary_images', 'description_enabled',
      'images_enabled', 'packages_enabled', 'itinerary_enabled',
      'video_enabled', 'google_reviews_enabled', 'safety_info_enabled',
      'need_help_enabled', 'tags'
    )
  ) THEN
    RAISE NOTICE 'All columns verified successfully!';
  END IF;
END $$;

