# 07 - Checkout Flow

**Status:** ✅ Complete  
**Dependencies:** 06-Upsells

---

## Overview

Single-page checkout with customer details, order summary, and Stripe-ready payment structure.

---

## Route

`/{lang}/checkout`

---

## Page Sections

### 1. Customer Details Form
- Full Name (required)
- Email Address (required)
- Phone Number (optional)
- Nationality (optional)

### 2. Order Summary
- Tour name and date
- Price breakdown (adults, children, seats)
- Upsells list
- Grand total

### 3. Payment Section
- Stripe Elements placeholder
- Ready for integration

### 4. Terms Acceptance
- Checkbox for terms & conditions
- Link to terms page

---

## Booking Creation

```typescript
POST /api/bookings/create

{
  tourId: string;
  availabilityId?: string;
  bookingDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerNationality?: string;
  language: Language;
  selection: BookingSelection;
}
```

Response:
```json
{
  "success": true,
  "booking": {
    "id": "uuid",
    "reference": "AST-XXXXX-XXXX",
    "status": "pending_payment"
  }
}
```

---

## Confirmation Page

Route: `/{lang}/booking/confirmation/{bookingId}`

Displays:
- Success message
- Booking reference
- Tour details
- Customer info
- Download voucher button
- Browse more tours link

---

## Key Files

- `app/[lang]/checkout/page.tsx`
- `app/[lang]/booking/confirmation/[bookingId]/page.tsx`
- `app/api/bookings/create/route.ts`

---

## Acceptance Criteria

- [x] Single-page checkout flow
- [x] Form validation
- [x] Booking created in database
- [x] Snapshot pricing stored
- [x] Confirmation page shows details




