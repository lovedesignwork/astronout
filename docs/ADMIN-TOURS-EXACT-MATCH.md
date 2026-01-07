# Admin Tours - Exact Frontend Match

## Side-by-Side Comparison

### Frontend Card (`/en/tours`)
```
┌────────────────────────────────────┐
│ ╔══════════════════════════════╗  │
│ ║                              ║  │
│ ║      TOUR IMAGE              ║  │  ← aspect-[4/3]
│ ║                              ║  │
│ ╚══════════════════════════════╝  │
│ [Best Seller]              ❤️     │  ← Special label + Wishlist
│                                    │
│ Beach Tours • 4h                   │  ← Category + Duration
│                                    │
│ Amazing Sunset Beach Tour          │  ← Title (line-clamp-2)
│ Experience the beauty...           │
│                                    │
│ [Snorkeling] [Sunset] [Beach]      │  ← Tags (max 3)
│                                    │
│ From ฿1,200            ⭐ 4.5     │  ← Price + Rating
│                        (1,234)     │
└────────────────────────────────────┘
```

### Admin Card (`/admin/tours`) - **NOW MATCHES!**
```
┌────────────────────────────────────┐
│ ╔══════════════════════════════╗  │
│ ║                              ║  │
│ ║      TOUR IMAGE              ║  │  ← aspect-[4/3] ✅
│ ║                              ║  │
│ ╚══════════════════════════════╝  │
│ [Best Seller]         [published] │  ← Special label + Status
│                                    │
│ Beach Tours • 4h                   │  ← Category + Duration ✅
│                                    │
│ Amazing Sunset Beach Tour          │  ← Title (line-clamp-2) ✅
│ Experience the beauty...           │
│                                    │
│ [Snorkeling] [Sunset] [Beach]      │  ← Tags (max 3) ✅
│                                    │
│ From ฿1,200            ⭐ 4.5     │  ← Price + Rating ✅
│                        (1,234)     │
├────────────────────────────────────┤
│ [View] [Duplicate] [More ▼]        │  ← Admin actions
└────────────────────────────────────┘
```

## Exact Matches

### 1. Grid Layout
```css
/* Frontend */
grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

/* Admin - EXACT MATCH ✅ */
grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
```

### 2. Card Container
```css
/* Frontend */
group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg

/* Admin - EXACT MATCH ✅ */
group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg
```

### 3. Image Container
```css
/* Frontend */
relative aspect-[4/3] overflow-hidden

/* Admin - EXACT MATCH ✅ */
relative aspect-[4/3] overflow-hidden
```

### 4. Image Element
```tsx
/* Frontend */
<Image
  src={imageUrl}
  alt={tour.heroTitle}
  fill
  className="object-cover transition-transform duration-500 group-hover:scale-110"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
/>

/* Admin - EXACT MATCH ✅ */
<Image
  src={imageUrl}
  alt={heroTitle}
  fill
  className="object-cover transition-transform duration-500 group-hover:scale-110"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
/>
```

### 5. Special Label Badge
```tsx
/* Frontend */
{primaryLabel && (
  <div
    className="absolute left-2 top-2 px-3 py-1 text-xs font-semibold shadow-sm z-10 rounded-lg"
    style={{
      backgroundColor: primaryLabel.background_color,
      color: primaryLabel.text_color,
    }}
  >
    {primaryLabel.name}
  </div>
)}

/* Admin - EXACT MATCH ✅ */
{primaryLabel && (
  <div
    className="absolute left-2 top-2 px-3 py-1 text-xs font-semibold shadow-sm z-10 rounded-lg"
    style={{
      backgroundColor: primaryLabel.background_color,
      color: primaryLabel.text_color,
    }}
  >
    {primaryLabel.name}
  </div>
)}
```

### 6. Content Padding
```css
/* Frontend */
flex flex-1 flex-col p-4

/* Admin - EXACT MATCH ✅ */
flex flex-1 flex-col p-4
```

### 7. Category / Duration
```tsx
/* Frontend */
<div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
  <span className="font-medium">{categoryName}</span>
  {duration && (
    <>
      <span>•</span>
      <span className="flex items-center gap-1">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {duration}
      </span>
    </>
  )}
</div>

/* Admin - EXACT MATCH ✅ */
<div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
  <span className="font-medium">{categoryName}</span>
  {duration && (
    <>
      <span>•</span>
      <span className="flex items-center gap-1">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {duration}
      </span>
    </>
  )}
</div>
```

### 8. Title
```tsx
/* Frontend */
<h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 transition-colors tour-card-title group-hover:text-[#0033FF]">
  {tour.heroTitle}
</h3>

/* Admin - EXACT MATCH ✅ */
<h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 transition-colors tour-card-title group-hover:text-[#0033FF]">
  {heroTitle}
</h3>
```

### 9. Tags
```tsx
/* Frontend */
{tags.length > 0 && (
  <div className="mb-2 flex flex-wrap gap-1.5">
    {tags.slice(0, 3).map((tag, index) => (
      <span
        key={index}
        className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
      >
        {tag}
      </span>
    ))}
  </div>
)}

/* Admin - EXACT MATCH ✅ */
{tags.length > 0 && (
  <div className="mb-2 flex flex-wrap gap-1.5">
    {tags.slice(0, 3).map((tag, index) => (
      <span
        key={index}
        className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
      >
        {tag}
      </span>
    ))}
  </div>
)}
```

### 10. Price and Rating Row
```tsx
/* Frontend */
<div className="flex items-center justify-between">
  {minPrice > 0 ? (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-500">From</span>
      <span className="text-sm font-bold text-gray-900">
        {formatCurrency(minPrice, currency)}
      </span>
    </div>
  ) : (
    <div />
  )}

  <div className="flex items-center gap-1 text-xs">
    <svg className="h-3.5 w-3.5 fill-current" style={{ color: '#0033FF' }} viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
    <span className="text-gray-400">({reviewCount.toLocaleString()})</span>
  </div>
</div>

/* Admin - EXACT MATCH ✅ */
<div className="flex items-center justify-between">
  {minPrice > 0 ? (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-500">From</span>
      <span className="text-sm font-bold text-gray-900">
        {formatCurrency(minPrice, currency)}
      </span>
    </div>
  ) : (
    <div />
  )}

  <div className="flex items-center gap-1 text-xs">
    <svg className="h-3.5 w-3.5 fill-current" style={{ color: '#0033FF' }} viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
    <span className="text-gray-400">({reviewCount.toLocaleString()})</span>
  </div>
</div>
```

## Only Differences

### 1. Top-Right Corner
```
Frontend: Wishlist button (heart icon)
Admin:    Status badge (Published/Draft/Archived)
```

### 2. Bottom Section
```
Frontend: No action bar
Admin:    Action bar with View/Duplicate/More buttons
```

### 3. Click Behavior
```
Frontend: Links to /en/tours/{slug} (view tour)
Admin:    Links to /admin/tours/{id} (edit tour)
```

### 4. Top of Page
```
Frontend: No filter bar
Admin:    Category filter bar with counts
```

## New Feature: Category Filter

```
┌─────────────────────────────────────────────────────────┐
│ [All Tours (12)] [Beach (5)] [City (3)] [Island (4)]   │  ← Filter bar
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Card] [Card] [Card] [Card]                            │  ← Filtered grid
│  [Card] [Card] [Card] [Card]                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Shows all categories with tour counts
- Active category has black background
- Clicking filters the grid instantly
- "All Tours" shows everything
- Responsive wrapping on mobile

## Summary

### What's Exactly the Same ✅

1. **Grid layout** - Same columns and gap
2. **Card container** - Same styling and transitions
3. **Image aspect ratio** - 4:3 ratio
4. **Image hover effect** - Scale to 110%
5. **Special label badge** - Same position and styling
6. **Category display** - Same format with duration
7. **Title styling** - Same font, size, clamp, hover color
8. **Tags display** - Same badges, max 3
9. **Price format** - "From {amount}"
10. **Rating display** - Star icon + rating + count
11. **Hover color** - #0033FF
12. **Spacing** - Same padding and margins
13. **Shadows** - shadow-sm to shadow-lg
14. **Transitions** - Same durations

### What's Different (Admin-Specific) 🔧

1. **Top-right badge** - Status instead of wishlist
2. **Action bar** - Admin buttons at bottom
3. **Click target** - Edit page instead of view page
4. **Category filter** - Above grid (new feature)

### Result

The admin tours page now provides a **pixel-perfect match** to the frontend design while adding essential admin functionality. Users will see a consistent, professional interface across both public and admin areas.




