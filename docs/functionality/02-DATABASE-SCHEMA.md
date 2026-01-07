# 02 - Database Schema

**Status:** ✅ Complete  
**Dependencies:** 01-Scaffold

---

## Overview

Complete Supabase PostgreSQL schema with RLS policies for the tour booking platform.

---

## Tables

### Core Tables

| Table | Purpose |
|-------|---------|
| `tours` | Main tour records with pricing_engine |
| `tour_blocks` | Ordered content blocks per tour |
| `tour_block_translations` | Multi-language block content |
| `tour_pricing` | Engine-specific pricing config (JSONB) |
| `tour_availability` | Manual date/time/capacity |

### Upsells

| Table | Purpose |
|-------|---------|
| `upsells` | Tour add-on products |
| `upsell_translations` | Multi-language upsell content |

### Bookings

| Table | Purpose |
|-------|---------|
| `bookings` | Customer orders with snapshot totals |
| `booking_items` | Line items (tour + upsells) |

### Admin & SEO

| Table | Purpose |
|-------|---------|
| `admin_users` | Admin authentication |
| `seo_entities` | SEO configuration per entity |
| `seo_translations` | Multi-language SEO fields |
| `redirects` | 301/302 redirect rules |

---

## Pricing Engine Types

```sql
CHECK (pricing_engine IN ('flat_per_person', 'adult_child', 'seat_based'))
```

---

## RLS Policies

### Public Access
- READ: tours, blocks, translations, availability, upsells (published only)
- CREATE: bookings only (no read)

### Admin Access
- Full CRUD on all tables via `is_admin()` function

---

## Migration Files

- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_rls_policies.sql`

---

## Acceptance Criteria

- [x] All tables created with proper indexes
- [x] RLS enabled on all tables
- [x] Public cannot read bookings
- [x] Admin has full access
- [x] Triggers update `updated_at` automatically




