# 05 - Pricing Engines

**Status:** ✅ Complete  
**Dependencies:** 04-Block-Rendering

---

## Overview

Three pricing engines with normalized output for consistent booking flow.

---

## Engine Types

### 1. Flat Per Person
- Single price for all guests
- Inputs: date, time slot, pax count
- Calculation: `pax × flat_price`

### 2. Adult/Child
- Different prices for adults and children
- Inputs: date, time, adult qty, child qty
- Calculation: `(adults × adult_price) + (children × child_price)`

### 3. Seat Based
- Different seat types (VIP, Standard)
- Inputs: show date, showtime, seat type, quantity
- Calculation: `qty × seat_type_price`

---

## Pricing Config (JSONB)

```typescript
// Flat
{
  type: 'flat_per_person',
  retail_price: 1800,
  net_price: 1400,
  currency: 'THB',
  min_pax: 1,
  max_pax: 10
}

// Adult/Child
{
  type: 'adult_child',
  adult_retail_price: 2500,
  adult_net_price: 2000,
  child_retail_price: 1500,
  child_net_price: 1200,
  currency: 'THB',
  child_age_max: 11
}

// Seat Based
{
  type: 'seat_based',
  currency: 'THB',
  seats: [
    { seat_type: 'VIP', retail_price: 1500, net_price: 1200 },
    { seat_type: 'Standard', retail_price: 900, net_price: 700 }
  ]
}
```

---

## Normalized Output

All engines produce:

```typescript
interface TourSelection {
  tourId: string;
  tourSlug: string;
  tourName: string;
  date: string;
  time?: string;
  pax: { adult?: number; child?: number; total: number };
  seat?: { type: string; qty: number };
  priceBreakdown: PriceBreakdownItem[];
  totalRetail: number;
  totalNet: number;
  currency: string;
}
```

---

## Key Files

- `components/pricing/FlatPricingSelector.tsx`
- `components/pricing/AdultChildPricingSelector.tsx`
- `components/pricing/SeatBasedPricingSelector.tsx`
- `components/pricing/AvailabilityCalendar.tsx`

---

## Acceptance Criteria

- [x] Each engine renders correct UI
- [x] Prices calculate correctly
- [x] Normalized output for all engines
- [x] Availability integration works
- [x] Booking CTA enabled when valid




