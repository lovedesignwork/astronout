# Astronout Platform - Complete Site Map & Routes

**Domain:** astronout.co  
**Tech Stack:** Next.js App Router + TypeScript + Supabase  
**Container Max-Width:** 1225px

---

## PUBLIC ROUTES (No Authentication Required)

### 1. Homepage
- **Route:** `/{lang}`
- **File:** `app/[lang]/page.tsx`
- **Purpose:** Landing page with hero, features, CTA
- **SEO:** Yes
- **Languages:** All 9 supported

### 2. Tours Listing
- **Route:** `/{lang}/tours`
- **File:** `app/[lang]/tours/page.tsx`
- **Purpose:** Browse all published tours
- **SEO:** Yes
- **Languages:** All 9 supported

### 3. Tour Detail
- **Route:** `/{lang}/tours/{slug}`
- **File:** `app/[lang]/tours/[slug]/page.tsx`
- **Purpose:** Tour page with blocks
- **SEO:** Yes (structured data)
- **Languages:** All 9 supported

### 4. Checkout
- **Route:** `/{lang}/checkout`
- **File:** `app/[lang]/checkout/page.tsx`
- **Purpose:** Booking checkout flow
- **SEO:** No (noindex)
- **Languages:** All 9 supported

### 5. Booking Confirmation
- **Route:** `/{lang}/booking/confirmation/{bookingId}`
- **File:** `app/[lang]/booking/confirmation/[bookingId]/page.tsx`
- **Purpose:** Success page after payment
- **SEO:** No (noindex)
- **Languages:** All 9 supported

### 6. Voucher View
- **Route:** `/{lang}/voucher/{bookingId}?token={token}`
- **File:** `app/[lang]/voucher/[bookingId]/page.tsx`
- **Purpose:** Printable voucher
- **SEO:** No (noindex)
- **Security:** Token-based access

### 7. About Page
- **Route:** `/{lang}/about`
- **File:** `app/[lang]/about/page.tsx`
- **Purpose:** Company information
- **SEO:** Yes

### 8. Contact Page
- **Route:** `/{lang}/contact`
- **File:** `app/[lang]/contact/page.tsx`
- **Purpose:** Contact form
- **SEO:** Yes

### 9. Terms & Conditions
- **Route:** `/{lang}/terms`
- **File:** `app/[lang]/terms/page.tsx`
- **Purpose:** Legal terms
- **SEO:** Optional noindex

### 10. Privacy Policy
- **Route:** `/{lang}/privacy`
- **File:** `app/[lang]/privacy/page.tsx`
- **Purpose:** Privacy policy
- **SEO:** Optional noindex

---

## ADMIN ROUTES (Authentication Required)

**Base Path:** `/admin`  
**Auth Method:** Supabase email/password  
**Role Check:** admin_users table

### 11. Admin Login
- **Route:** `/admin/login`
- **File:** `app/admin/login/page.tsx`
- **Public Access:** Yes (login form only)

### 12. Admin Dashboard
- **Route:** `/admin`
- **File:** `app/admin/page.tsx`
- **Widgets:** Stats, profit by tour, recent bookings

### 13. Tours List
- **Route:** `/admin/tours`
- **File:** `app/admin/tours/page.tsx`
- **Features:** List all tours, status badges

### 14. Create Tour
- **Route:** `/admin/tours/new`
- **File:** `app/admin/tours/new/page.tsx`
- **Features:** Slug input, pricing engine selection

### 15. Edit Tour
- **Route:** `/admin/tours/{tourId}`
- **File:** `app/admin/tours/[tourId]/page.tsx`
- **Features:** Tabbed interface

### 16. Block Editor
- **Route:** `/admin/tours/{tourId}/blocks`
- **File:** `app/admin/tours/[tourId]/blocks/page.tsx`
- **Features:** Drag-drop, per-language editing

### 17. Pricing Setup
- **Route:** `/admin/tours/{tourId}/pricing`
- **File:** `app/admin/tours/[tourId]/pricing/page.tsx`
- **Features:** Engine-specific forms

### 18. Availability Manager
- **Route:** `/admin/tours/{tourId}/availability`
- **File:** `app/admin/tours/[tourId]/availability/page.tsx`
- **Features:** Calendar, time slots, capacity

### 19. Upsells Manager
- **Route:** `/admin/tours/{tourId}/upsells`
- **File:** `app/admin/tours/[tourId]/upsells/page.tsx`
- **Features:** CRUD upsells, translations

### 20. SEO Settings
- **Route:** `/admin/tours/{tourId}/seo`
- **File:** `app/admin/tours/[tourId]/seo/page.tsx`
- **Features:** Yoast-like editor

### 21. Bookings List
- **Route:** `/admin/bookings`
- **File:** `app/admin/bookings/page.tsx`
- **Features:** Filter, search, status

### 22. Booking Detail
- **Route:** `/admin/bookings/{bookingId}`
- **File:** `app/admin/bookings/[bookingId]/page.tsx`
- **Features:** View, status update, voucher

### 23. Analytics
- **Route:** `/admin/analytics`
- **File:** `app/admin/analytics/page.tsx`
- **Features:** Charts, reports

### 24. Settings
- **Route:** `/admin/settings`
- **File:** `app/admin/settings/page.tsx`
- **Features:** Company info, config

### 25. SEO Manager
- **Route:** `/admin/seo`
- **File:** `app/admin/seo/page.tsx`
- **Features:** Global SEO, redirects

### 26. Redirects Manager
- **Route:** `/admin/seo/redirects`
- **File:** `app/admin/seo/redirects/page.tsx`
- **Features:** 301/302 rules

---

## API ROUTES

### 27. Create Booking
- **Route:** `POST /api/bookings/create`
- **Auth:** Public (rate-limited)

### 28. Get Availability
- **Route:** `GET /api/tours/{tourId}/availability`
- **Auth:** Public

### 29. Stripe Webhook
- **Route:** `POST /api/webhooks/stripe`
- **Auth:** Stripe signature

### 30. Admin Tours
- **Route:** `/api/admin/tours`
- **Auth:** Admin only

### 31. Admin Stats
- **Route:** `GET /api/admin/stats`
- **Auth:** Admin only

---

## SYSTEM ROUTES

### 32. Sitemap
- **Route:** `/sitemap.xml`
- **File:** `app/sitemap.ts`

### 33. Robots
- **Route:** `/robots.txt`
- **File:** `app/robots.ts`

---

## ROUTE HIERARCHY

```
/
├── {lang}/
│   ├── (home)
│   ├── tours/
│   │   ├── (listing)
│   │   └── {slug}/
│   ├── checkout/
│   ├── booking/
│   │   └── confirmation/{bookingId}/
│   ├── voucher/{bookingId}/
│   ├── about/
│   ├── contact/
│   ├── terms/
│   └── privacy/
│
├── admin/
│   ├── login/
│   ├── (dashboard)
│   ├── tours/
│   │   ├── (list)
│   │   ├── new/
│   │   └── {tourId}/
│   │       ├── blocks/
│   │       ├── pricing/
│   │       ├── availability/
│   │       ├── upsells/
│   │       └── seo/
│   ├── bookings/
│   │   └── {bookingId}/
│   ├── analytics/
│   ├── settings/
│   └── seo/
│       └── redirects/
│
├── api/
│   ├── bookings/create
│   ├── admin/tours
│   └── webhooks/stripe
│
├── sitemap.xml
└── robots.txt
```

---

## LANGUAGE ROUTING

### URL Structure
```
https://astronout.co/en/tours/phuket-tour
https://astronout.co/zh/tours/phuket-tour
https://astronout.co/ru/tours/phuket-tour
```

### Supported Languages
en, zh, ru, ko, ja, fr, it, es, id

### Hreflang Tags
```html
<link rel="alternate" hreflang="en" href="https://astronout.co/en/..." />
<link rel="alternate" hreflang="zh" href="https://astronout.co/zh/..." />
<link rel="alternate" hreflang="x-default" href="https://astronout.co/en/..." />
```

---

## ROUTE SUMMARY

| Category | Count | Auth |
|----------|-------|------|
| Public Pages | 10 | No |
| Admin Pages | 16 | Yes |
| API Routes | 5 | Mixed |
| System Routes | 2 | No |
| **TOTAL** | **33** | - |

---

## SECURITY NOTES

1. Admin routes protected by middleware + RLS
2. Voucher access requires valid token
3. API routes rate-limited
4. Payment webhooks verify Stripe signature

---

**Last Updated:** 2026-01-01  
**Version:** 1.0




