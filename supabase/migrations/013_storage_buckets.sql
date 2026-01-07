-- =====================================================
-- STORAGE POLICIES FOR ASTRONOUT PLATFORM
-- =====================================================
-- 
-- IMPORTANT: You must create the bucket manually via Supabase Dashboard!
-- 
-- Steps:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click "New bucket"
-- 3. Name: astronout
-- 4. Check "Public bucket"
-- 5. Click "Create bucket"
-- 6. Then run this SQL to set up the policies
--
-- =====================================================

-- =====================================================
-- STORAGE POLICIES (Run AFTER creating bucket in Dashboard)
-- =====================================================

-- Policy: Anyone can view public files
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'astronout');

-- Policy: Authenticated admin users can upload files
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'astronout'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  )
);

-- Policy: Authenticated admin users can update their files
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'astronout'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  )
);

-- Policy: Authenticated admin users can delete files
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'astronout'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  )
);

-- =====================================================
-- FOLDER STRUCTURE (Documentation)
-- =====================================================
-- The bucket uses the following folder structure:
--
-- astronout/
-- ├── tours/
-- │   ├── {tour_id}/
-- │   │   ├── hero/          -- Hero/main images
-- │   │   ├── gallery/       -- Additional photos
-- │   │   ├── itinerary/     -- Itinerary images
-- │   │   └── packages/      -- Package images
-- ├── categories/            -- Category icons/images
-- ├── labels/                -- Special label images
-- ├── site/                  -- Site-wide images (logo, favicon, etc.)
-- ├── pages/                 -- Static page images
-- └── temp/                  -- Temporary uploads (cleaned up periodically)
-- =====================================================

