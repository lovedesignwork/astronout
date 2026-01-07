# 09 - Admin Authentication

**Status:** ✅ Complete  
**Dependencies:** 02-Database

---

## Overview

Supabase email/password authentication for admin panel access.

---

## Routes

- `/admin/login` - Login page (public)
- `/admin/*` - Protected admin routes

---

## Authentication Flow

1. User submits email/password
2. Supabase `signInWithPassword()`
3. Check `admin_users` table for user ID
4. If admin, redirect to dashboard
5. If not admin, sign out and show error

---

## Middleware Protection

```typescript
// middleware.ts
if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
  // Check auth
  // Check admin_users table
  // Redirect to login if unauthorized
}
```

---

## Admin Users Table

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## RLS Helper Function

```sql
CREATE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Key Files

- `app/admin/login/page.tsx`
- `app/admin/layout.tsx`
- `middleware.ts`
- `components/admin/AdminSidebar.tsx`

---

## Acceptance Criteria

- [x] Login form works
- [x] Non-admins rejected
- [x] Protected routes redirect to login
- [x] Logout clears session
- [x] Error messages displayed





