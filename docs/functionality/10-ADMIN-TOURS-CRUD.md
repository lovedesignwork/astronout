# 10 - Admin Tours CRUD

**Status:** ✅ Complete  
**Dependencies:** 09-Admin-Auth

---

## Overview

Tour management in admin panel with create, edit, and status controls.

---

## Routes

- `/admin/tours` - List all tours
- `/admin/tours/new` - Create new tour
- `/admin/tours/{tourId}` - Edit tour (tabbed)
- `/admin/tours/{tourId}/blocks` - Block editor
- `/admin/tours/{tourId}/pricing` - Pricing setup
- `/admin/tours/{tourId}/availability` - Availability manager
- `/admin/tours/{tourId}/upsells` - Upsells manager
- `/admin/tours/{tourId}/seo` - SEO settings

---

## Tours List

| Column | Content |
|--------|---------|
| Tour | Slug name |
| Pricing Engine | flat/adult_child/seat_based |
| Status | draft/published/archived |
| Created | Date |
| Actions | Edit link |

---

## Create Tour

1. Enter URL slug (lowercase, hyphens)
2. Select pricing engine
3. Submit creates draft tour
4. Redirect to edit page

---

## Tour Status Flow

```
draft → published → archived
         ↓
      draft (unpublish)
```

---

## API Endpoints

```
POST /api/admin/tours - Create tour
GET /api/admin/tours - List tours
PUT /api/admin/tours/{id} - Update tour
DELETE /api/admin/tours/{id} - Delete tour
```

---

## Key Files

- `app/admin/tours/page.tsx`
- `app/admin/tours/new/page.tsx`
- `app/admin/tours/[tourId]/page.tsx`
- `app/api/admin/tours/route.ts`
- `lib/data/admin.ts`

---

## Acceptance Criteria

- [x] List all tours (including drafts)
- [x] Create new tour
- [x] Edit tour details
- [x] Status badges display correctly
- [x] Delete tour (with confirmation)





