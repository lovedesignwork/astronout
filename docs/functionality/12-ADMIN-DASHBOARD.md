# 12 - Admin Dashboard

**Status:** ✅ Complete  
**Dependencies:** 09-Admin-Auth

---

## Overview

Admin dashboard with key metrics, profit tracking, and recent bookings.

---

## Route

`/admin`

---

## Widgets

### Stats Cards (Top Row)
- Total Bookings (this month)
- Revenue (this month)
- Profit (this month)
- Confirmed count + pending count

### Profit by Tour
- List of tours with profit
- Booking count per tour
- Revenue breakdown

### Recent Bookings
- Last 5 bookings
- Reference, customer, amount, status
- Link to booking detail

---

## Data Functions

```typescript
adminGetDashboardStats(startDate, endDate)
// Returns: totalBookings, totalRevenue, totalProfit, confirmedBookings, pendingBookings

adminGetProfitByTour(startDate, endDate)
// Returns: [{ tourId, tourSlug, totalRevenue, totalNet, totalProfit, bookingCount }]

adminListBookings({ limit: 5 })
// Returns: { bookings: [], total: number }
```

---

## Profit Calculation

```
Profit = total_retail - total_net
```

Uses snapshot values from bookings table, not current tour prices.

---

## Key Files

- `app/admin/page.tsx`
- `lib/data/admin.ts`

---

## Acceptance Criteria

- [x] Stats cards display correctly
- [x] Profit by tour list works
- [x] Recent bookings table
- [x] Currency formatting
- [x] Status badges




