# 13 - Profit Engine

**Status:** ✅ Complete  
**Dependencies:** 07-Checkout

---

## Overview

Snapshot-based profit tracking that preserves historical pricing.

---

## Core Principle

**Changing tour prices does NOT affect past booking profits.**

All prices are snapshotted at booking time.

---

## Data Storage

### Booking Items Table

```sql
CREATE TABLE booking_items (
  retail_price_snapshot DECIMAL(10, 2) NOT NULL,
  net_price_snapshot DECIMAL(10, 2) NOT NULL,
  subtotal_retail DECIMAL(10, 2) NOT NULL,
  subtotal_net DECIMAL(10, 2) NOT NULL
);
```

### Bookings Table

```sql
CREATE TABLE bookings (
  total_retail DECIMAL(10, 2) NOT NULL,
  total_net DECIMAL(10, 2) NOT NULL
);
```

---

## Profit Calculation

```
Item Profit = subtotal_retail - subtotal_net
Booking Profit = total_retail - total_net
```

---

## Admin Reports

### Profit by Date Range
```typescript
adminGetDashboardStats(startDate, endDate)
// Returns aggregated profit for date range
```

### Profit by Tour
```typescript
adminGetProfitByTour(startDate, endDate)
// Returns profit breakdown per tour
```

### Daily Revenue Chart
```typescript
adminGetDailyRevenue(startDate, endDate)
// Returns daily revenue and profit for charts
```

---

## Snapshot Process

At booking creation:

1. Get current tour pricing
2. Calculate retail and net for each item
3. Store snapshot prices in booking_items
4. Sum totals in bookings table

---

## Key Files

- `lib/data/bookings.ts` - `createBooking()`
- `lib/data/admin.ts` - Profit queries
- `app/admin/page.tsx` - Dashboard display

---

## Acceptance Criteria

- [x] Prices snapshotted at booking
- [x] Profit calculated from snapshots
- [x] Price changes don't affect old bookings
- [x] Admin can view profit reports
- [x] Per-tour profit breakdown




