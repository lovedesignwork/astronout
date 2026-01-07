# Admin Tours Page - Card View with Thumbnails

## Overview

The admin tours page has been updated to display tours in a card grid layout with thumbnails, similar to the public tours page. Each card is clickable and navigates to the tour editor.

## What Changed

### Before
- Table view with text-only rows
- Small icon placeholder instead of tour image
- Actions in dropdown menu
- Limited visual information

### After
- Card grid layout (responsive: 1-4 columns)
- Large thumbnail images from hero block
- Status badge overlay on image
- Edit icon indicator on hover
- Clickable card area navigates to editor
- Action buttons at bottom of card
- Price and metadata displayed
- Similar look and feel to public tours page

## Features

### Visual Layout
```
┌─────────────────────────────────────────────────────────┐
│  Tours                                    [+ New Tour]   │
│  12 total tours                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │ [IMAGE]  │  │ [IMAGE]  │  │ [IMAGE]  │  │ [IMAGE]  ││
│  │ Status   │  │ Status   │  │ Status   │  │ Status   ││
│  │   [Edit] │  │   [Edit] │  │   [Edit] │  │   [Edit] ││
│  │          │  │          │  │          │  │          │││
│  │ Title    │  │ Title    │  │ Title    │  │ Title    │││
│  │ Slug     │  │ Slug     │  │ Slug     │  │ Slug     │││
│  │ Price    │  │ Price    │  │ Price    │  │ Price    │││
│  │ [Actions]│  │ [Actions]│  │ [Actions]│  │ [Actions]│││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘││
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Card Components

#### 1. **Image Section**
- **Aspect Ratio:** 4:3 (same as public tours)
- **Image Source:** Hero block `imageUrl` from config
- **Fallback:** `/placeholder-tour.jpg` if no image
- **Hover Effect:** Image scales to 110% on hover
- **Overlay Elements:**
  - Status badge (top-left): Published/Draft/Archived
  - Edit icon (top-right): White circle with edit icon

#### 2. **Content Section**
- **Slug & Pricing Engine:** Small gray text with badge
- **Hero Title:** Bold, 2-line clamp, changes color on hover
- **Tour ID:** Truncated ID for reference
- **Price:** "From {price}" if pricing exists
- **Created Date:** Formatted date

#### 3. **Action Bar**
- **Background:** Light gray with border-top
- **View Button:** Only shown for published tours
- **Duplicate Button:** Copy icon, shows spinner when duplicating
- **More Menu:** Dropdown with:
  - Publish (if not published)
  - Unpublish (if not draft)
  - Archive (if not archived)
  - Delete (red, at bottom)

### Interactions

#### Click to Edit
- **Entire card is clickable** via `Link` wrapper
- Navigates to `/admin/tours/{tour.id}`
- Opens tour editor page
- Hover effect: shadow increases, title changes color

#### Action Buttons
- All buttons use `stopPropagation()` to prevent card click
- Duplicate button shows loading spinner
- More menu opens upward (bottom-full positioning)
- Status changes show confirmation dialog

### Responsive Grid

```css
grid-cols-1           /* Mobile: 1 column */
sm:grid-cols-2        /* Small: 2 columns */
lg:grid-cols-3        /* Large: 3 columns */
xl:grid-cols-4        /* Extra Large: 4 columns */
gap-5                 /* 1.25rem spacing */
```

## Technical Implementation

### Files Modified

#### 1. `app/admin/tours/TourListClient.tsx`

**Added Imports:**
```typescript
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
```

**New Helper Functions:**
```typescript
// Get hero image from tour blocks
getHeroImage(tour: Tour): string

// Get hero title from tour blocks  
getHeroTitle(tour: Tour): string

// Get minimum price from pricing config
getMinPrice(tour: Tour): { price: number; currency: string }
```

**UI Changes:**
- Replaced `<table>` with grid layout
- Replaced rows with card components
- Added `Image` component for thumbnails
- Added status badges and edit icons
- Reorganized action buttons

#### 2. `lib/data/admin.ts`

**Updated Function:**
```typescript
export async function adminListTours(): Promise<any[]>
```

**Changes:**
- Added `.select()` with joins for `blocks` and `pricing`
- Fetches `tour_blocks` with translations
- Fetches `tour_pricing` with config
- Transforms data to flatten pricing config
- Returns tours with nested data

**Query:**
```typescript
.select(`
  *,
  blocks:tour_blocks(
    id,
    block_type,
    order,
    enabled,
    config,
    translations:tour_block_translations(
      id,
      language,
      title,
      content
    )
  ),
  pricing:tour_pricing(
    id,
    config
  )
`)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Page loads: app/admin/tours/page.tsx                 │
│    - Calls adminListTours()                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Data fetch: lib/data/admin.ts                        │
│    - Queries tours with blocks and pricing              │
│    - Joins tour_blocks with translations                │
│    - Joins tour_pricing with config                     │
│    - Transforms and returns data                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Client component: TourListClient.tsx                 │
│    - Receives tours with nested data                    │
│    - Extracts hero image from blocks                    │
│    - Extracts hero title from translations              │
│    - Calculates minimum price from pricing              │
│    - Renders card grid                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. User clicks card                                      │
│    - Navigates to /admin/tours/{id}                     │
│    - Opens tour editor                                  │
└─────────────────────────────────────────────────────────┘
```

## Styling Details

### Status Badge Colors
```typescript
published: 'bg-green-500 text-white'
draft:     'bg-yellow-500 text-white'
archived:  'bg-gray-500 text-white'
```

### Card Hover Effects
- **Shadow:** `shadow-sm` → `shadow-lg`
- **Image:** `scale-100` → `scale-110`
- **Title:** `text-gray-900` → `text-blue-600`
- **Duration:** `300ms` transition

### Action Bar
- **Background:** `bg-gray-50`
- **Border:** `border-t border-gray-100`
- **Buttons:** Hover changes to white background
- **Icons:** 3.5-4px size

## User Experience

### Benefits
1. **Visual Recognition:** Easy to identify tours by thumbnail
2. **Quick Access:** Click anywhere on card to edit
3. **Status at a Glance:** Color-coded badges
4. **Consistent UI:** Matches public tours page
5. **Better Scanning:** Grid layout easier to scan than table
6. **More Information:** Price and metadata visible

### Workflow
1. Admin navigates to `/admin/tours`
2. Sees grid of tour cards with thumbnails
3. Identifies tour by image and title
4. Clicks card to edit
5. Redirected to tour editor

### Actions Available
- **Click Card:** Edit tour
- **View Button:** Open public tour page (new tab)
- **Duplicate Button:** Create copy of tour
- **More Menu:**
  - Change status (Publish/Unpublish/Archive)
  - Delete tour

## Edge Cases Handled

### No Hero Image
- Falls back to `/placeholder-tour.jpg`
- Card still displays correctly

### No Pricing
- Shows "No pricing" text instead of price
- Card layout remains intact

### No Hero Title
- Falls back to tour slug
- Ensures card always has a title

### Empty State
- Shows centered message with icon
- "No tours yet" with create button
- Same as before, unchanged

## Performance Considerations

### Image Loading
- Uses Next.js `Image` component
- Automatic optimization
- Lazy loading by default
- Responsive sizes attribute

### Data Fetching
- Single query with joins
- Fetches all needed data at once
- No N+1 query problem
- Server-side rendering

### Client-Side State
- Minimal re-renders
- Event handlers use stopPropagation
- Loading states for async actions

## Future Enhancements

### Possible Improvements
1. **Filters:** Filter by status, pricing engine
2. **Search:** Search by slug or title
3. **Sorting:** Sort by date, price, name
4. **Bulk Actions:** Select multiple tours
5. **View Toggle:** Switch between grid and table view
6. **Pagination:** Load more as you scroll
7. **Quick Edit:** Edit basic info without leaving page

## Testing Checklist

- [ ] Cards display correctly with images
- [ ] Clicking card navigates to editor
- [ ] Status badges show correct colors
- [ ] Action buttons work without triggering card click
- [ ] Duplicate button shows loading state
- [ ] More menu opens and closes correctly
- [ ] Status change dialogs appear
- [ ] Delete confirmation works
- [ ] Responsive grid adjusts to screen size
- [ ] Images load and scale on hover
- [ ] Fallback images work when no hero image
- [ ] Price displays correctly for all pricing types
- [ ] Empty state shows when no tours

## Summary

The admin tours page now provides a much better visual experience with:
- ✅ Card grid layout matching public tours page
- ✅ Large thumbnail images from hero blocks
- ✅ Clickable cards that navigate to editor
- ✅ Status badges and edit icons
- ✅ Price and metadata display
- ✅ Action buttons for common tasks
- ✅ Responsive design (1-4 columns)
- ✅ Hover effects and transitions
- ✅ Proper data fetching with joins
- ✅ Edge case handling

This makes it much easier for admins to manage tours visually and quickly access the editor.




