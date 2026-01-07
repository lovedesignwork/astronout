# 14 - SEO Module

**Status:** ✅ Complete  
**Dependencies:** 02-Database, 03-Multi-Language

---

## Overview

Comprehensive SEO system with sitemap, robots.txt, hreflang tags, and structured data.

---

## Features

### Dynamic Sitemap (`/sitemap.xml`)
- All published tours (all languages)
- Static pages (home, tours, about, contact)
- Last modified dates
- Priority settings

### Robots.txt (`/robots.txt`)
- Allow: /
- Disallow: /admin, /checkout, /voucher, /api
- Sitemap reference

### Hreflang Tags
Generated via Next.js `generateMetadata()`:
```tsx
alternates: {
  languages: {
    en: '/en/tours/slug',
    zh: '/zh/tours/slug',
    // ... all 9 languages
  }
}
```

### OpenGraph & Twitter Cards
```tsx
openGraph: {
  title,
  description,
  images,
  locale,
}
```

---

## SEO Database Tables

### seo_entities
- Links to tours/pages
- Entity type + slug

### seo_translations
- Per-language SEO fields
- meta_title, meta_description
- focus_keyword
- og_title, og_description, og_image_url
- noindex, nofollow flags
- structured_data_override_json

### redirects
- from_path, to_path
- status_code (301/302)
- enabled flag

---

## Structured Data (JSON-LD)

Tour pages include TouristTrip schema:
- name, description, image
- offers (price, currency, availability)
- provider
- areaServed

---

## Admin SEO Tab

Route: `/admin/tours/{tourId}/seo`

Features:
- Language tabs
- Meta title/description fields
- Focus keyword
- SERP preview
- Social preview
- noindex/nofollow toggles

---

## Key Files

- `app/sitemap.ts`
- `app/robots.ts`
- `app/[lang]/tours/[slug]/page.tsx` - generateMetadata()
- `app/admin/tours/[tourId]/seo/page.tsx`

---

## Acceptance Criteria

- [x] Sitemap generates correctly
- [x] Robots.txt blocks admin
- [x] Hreflang tags present
- [x] Meta tags per language
- [x] OpenGraph tags work





