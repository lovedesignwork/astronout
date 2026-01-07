# 08 - Voucher Generator

**Status:** ✅ Complete  
**Dependencies:** 07-Checkout

---

## Overview

HTML voucher view with print styling for PDF export.

---

## Route

`/{lang}/voucher/{bookingId}?token={secureToken}`

---

## Security

- Requires valid voucher token
- Token generated at booking creation
- No authentication required (public with token)

---

## Voucher Content

### Header
- Astronout logo and name
- Booking reference (large)

### Booking Status
- Green badge for confirmed

### Tour Details
- Tour name
- Date and time
- Number of guests

### Add-ons
- List of selected upsells with quantities

### Customer Details
- Name
- Email
- Phone (if provided)
- Nationality (if provided)

### Payment Summary
- Total paid amount

### Footer
- Present voucher notice
- Contact email
- Generation date

---

## Print Styling

```css
@media print {
  .no-print { display: none; }
  header, footer, nav { display: none; }
  body { background: white; }
}
```

---

## Key Files

- `app/[lang]/voucher/[bookingId]/page.tsx`
- `lib/data/bookings.ts` - `getBookingByVoucherToken()`

---

## Acceptance Criteria

- [x] Voucher renders cleanly
- [x] Token-based access
- [x] Print button works
- [x] PDF-ready layout
- [x] 1225px container maintained





