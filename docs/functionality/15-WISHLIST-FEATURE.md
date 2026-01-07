# Wishlist Feature for Non-Logged-In Users

## Overview

The wishlist feature allows users to save their favorite tours for later viewing without requiring authentication. All wishlist data is stored locally in the browser's localStorage, making it accessible across sessions on the same device.

## Architecture

### 1. Context Provider (`lib/contexts/WishlistContext.tsx`)

The `WishlistProvider` manages the global wishlist state using React Context API:

- **State Management**: Maintains an array of wishlist items
- **Local Storage Persistence**: Automatically saves and loads wishlist from localStorage
- **Hydration**: Ensures proper client-side hydration to avoid SSR mismatches

#### Key Functions:

```typescript
addToWishlist(item): void           // Add a tour to wishlist
removeFromWishlist(tourId): void    // Remove a tour from wishlist
isInWishlist(tourId): boolean       // Check if tour is in wishlist
clearWishlist(): void               // Clear entire wishlist
wishlistCount: number               // Current number of items
```

#### Data Structure:

```typescript
interface WishlistItem {
  tourId: string;
  tourSlug: string;
  tourTitle: string;
  imageUrl?: string;
  minPrice?: number;
  currency?: string;
  addedAt: string;  // ISO timestamp
}
```

### 2. Wishlist Button Component (`components/tour/WishlistButton.tsx`)

A reusable button component with three variants:

- **`icon-only`**: Floating heart icon (used on tour cards)
- **`compact`**: Small button with icon and text (used on tour detail pages)
- **`default`**: Full-size button with border (for other uses)

#### Features:

- Visual feedback with filled/unfilled heart icon
- Toast notification on add/remove
- Prevents event propagation when used inside links
- Responsive hover states

### 3. Wishlist Page (`app/[lang]/wishlist/page.tsx`)

A dedicated page to view all saved tours:

- **Grid Layout**: Displays tours in a responsive 4-column grid
- **Empty State**: Friendly message when wishlist is empty
- **Quick Actions**: Remove individual items or clear all
- **Navigation**: Links back to tour details and tours listing

### 4. Integration Points

#### Header Navigation (`components/layout/Header.tsx`)

- Heart icon with badge showing wishlist count
- Badge displays count up to 9, then shows "9+"
- Hover effect matching site theme

#### Tours Listing Page (`app/[lang]/tours/page.tsx`)

- Wishlist button on top-right corner of each tour card
- Floating design with backdrop blur
- Doesn't interfere with card click navigation

#### Tour Detail Page (`app/[lang]/tours/[slug]/TourPageClient.tsx`)

- Compact wishlist button next to tour title
- Includes tour pricing information
- Styled to stand out against hero background

## User Flow

1. **Adding to Wishlist**:
   - User clicks heart icon on tour card or detail page
   - Item is added to localStorage
   - Toast notification confirms action
   - Header badge updates immediately

2. **Viewing Wishlist**:
   - User clicks heart icon in header
   - Navigates to `/[lang]/wishlist`
   - Sees all saved tours in grid layout

3. **Removing from Wishlist**:
   - Click X button on wishlist page, or
   - Click filled heart icon on any tour card/page
   - Item removed from localStorage
   - UI updates immediately

4. **Clearing Wishlist**:
   - Click "Clear All" button on wishlist page
   - Confirmation dialog prevents accidental clearing
   - All items removed at once

## Technical Details

### Local Storage

- **Key**: `astronout_wishlist`
- **Format**: JSON array of WishlistItem objects
- **Size Limit**: Browser-dependent (typically 5-10MB)
- **Persistence**: Survives page reloads and browser restarts
- **Privacy**: Data never leaves the user's device

### Performance Considerations

- Wishlist state is memoized to prevent unnecessary re-renders
- localStorage operations are wrapped in try-catch for error handling
- Hydration check prevents SSR/client mismatch warnings
- Callbacks use `useCallback` to maintain referential equality

### Accessibility

- All buttons have proper `aria-label` attributes
- Keyboard navigation fully supported
- Focus states clearly visible
- Color contrast meets WCAG AA standards

## Styling

### Toast Notifications

Custom CSS animation for smooth appearance:

```css
@keyframes fade-in-down {
  0% {
    opacity: 0;
    transform: translate(-50%, -10px);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
```

### Color Scheme

- **Active State**: Red (#ef4444) for favorited items
- **Inactive State**: Gray (#4b5563) with hover to red
- **Background**: White with backdrop blur for floating buttons

## Future Enhancements

Potential improvements for logged-in users:

1. **Sync with Database**: Store wishlist in user profile
2. **Cross-Device Sync**: Access wishlist from any device
3. **Email Reminders**: Notify users about saved tours
4. **Price Alerts**: Alert when saved tour prices drop
5. **Share Wishlist**: Share wishlist with friends/family
6. **Export/Import**: Backup wishlist data

## Browser Compatibility

- **Modern Browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **localStorage**: Required (available in all modern browsers)
- **Fallback**: Feature gracefully degrades if localStorage unavailable

## Testing Checklist

- [ ] Add tour to wishlist from listing page
- [ ] Add tour to wishlist from detail page
- [ ] Remove tour from wishlist (multiple methods)
- [ ] Clear entire wishlist
- [ ] Verify persistence after page reload
- [ ] Check badge count updates correctly
- [ ] Test empty state display
- [ ] Verify toast notifications appear
- [ ] Test responsive layout on mobile
- [ ] Verify accessibility with keyboard navigation
- [ ] Test with localStorage disabled
- [ ] Check multiple language support

## Notes

- This implementation is designed for non-authenticated users
- Data is stored locally and not shared between devices
- Users should be informed that wishlist is device-specific
- Consider adding a notice about data persistence in the UI




