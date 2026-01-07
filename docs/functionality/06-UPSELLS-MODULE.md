# 06 - Upsells Module

**Status:** ✅ Complete  
**Dependencies:** 05-Pricing-Engines

---

## Overview

Tour add-on products with three pricing types and live total calculation.

---

## Upsell Pricing Types

| Type | Calculation | Example |
|------|-------------|---------|
| per_person | price × pax total | Photo package |
| per_booking | fixed fee | Private transfer |
| flat | price × quantity | Waterproof pouch |

---

## Data Structure

```typescript
interface Upsell {
  id: string;
  tour_id: string;
  status: 'active' | 'inactive';
  pricing_type: 'per_person' | 'per_booking' | 'flat';
  retail_price: number;
  net_price: number;
  currency: string;
  max_quantity?: number;
}
```

---

## UpsellsBlock Behavior

1. Only renders if block enabled
2. Only shows upsells if main selection is valid (date + pax selected)
3. Displays upsell cards with translated name/description
4. Updates total price live

---

## UpsellCard Component

- Checkbox to select/deselect
- Quantity selector for flat pricing type
- Shows calculated subtotal when selected
- Displays pricing type label

---

## Selection Output

```typescript
interface UpsellSelection {
  upsellId: string;
  title: string;
  pricingType: UpsellPricingType;
  quantity: number;
  unitRetailPrice: number;
  unitNetPrice: number;
  totalRetail: number;
  totalNet: number;
}
```

---

## Key Files

- `components/blocks/UpsellsBlock.tsx`
- `components/upsells/UpsellCard.tsx`
- `lib/contexts/BookingContext.tsx` - Manages upsell state

---

## Acceptance Criteria

- [x] Three pricing types work correctly
- [x] Upsells only shown after main selection
- [x] Total updates live
- [x] Multi-language support
- [x] Quantity limits enforced




