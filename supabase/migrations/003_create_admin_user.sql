-- =====================================================
-- CREATE ADMIN USER
-- =====================================================
-- This migration creates the default admin user
-- 
-- IMPORTANT: You must first create the user in Supabase Auth
-- either via Dashboard or the API setup endpoint
--
-- Option 1: Use the API endpoint
--   POST /api/admin/setup with body: { "secret": "astronout-setup-2026" }
--
-- Option 2: Manual setup via Supabase Dashboard
--   1. Go to Authentication > Users > Add User
--   2. Create user with:
--      - Email: admin@astronout.co
--      - Password: Admin123!@#
--   3. Copy the UUID and run the INSERT below
--
-- Default Credentials:
--   Email: admin@astronout.co
--   Password: Admin123!@#
-- =====================================================

-- Uncomment and replace USER_UUID with the actual UUID from auth.users
-- INSERT INTO admin_users (id, email, role)
-- VALUES ('USER_UUID_HERE', 'admin@astronout.co', 'admin')
-- ON CONFLICT (id) DO NOTHING;

-- Helper query to find the user UUID (run after creating auth user):
-- SELECT id, email FROM auth.users WHERE email = 'admin@astronout.co';





