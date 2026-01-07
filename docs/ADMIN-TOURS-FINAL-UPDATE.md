# Admin Tours Page - Final Update

## Overview

The admin tours page has been completely redesigned to **exactly match** the frontend tours page at `http://localhost:3000/en/tours`, with the addition of category filtering and admin-specific features.

## What Changed

### 1. **Exact Frontend Match**

The cards now display **exactly** the same as the public tours page:

#### Card Layout
- ✅ Same grid: `sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- ✅ Same gap: `gap-5`
- ✅ Same aspect ratio: `aspect-[4/3]`
- ✅ Same hover effects: Image scale 110%, shadow increase
- ✅ Same transitions: `duration-300` and `duration-500`

#### Card Content
- ✅ **Category name** with duration (if available)
- ✅ **Hero title** (2-line clamp)
- ✅ **Tags** (up to 3, gray badges)
- ✅ **Price** ("From {amount}")
- ✅ **Rating** (star icon + rating + review count)
- ✅ **Special labels** (colored corner badges)

#### Styling
- ✅ Same colors: `#0033FF` for hover and star
- ✅ Same fonts: Same sizes and weights
- ✅ Same spacing: Same padding and margins
- ✅ Same shadows: `shadow-sm` to `shadow-lg`

### 2. **Category Filtering**

Added a category filter bar above the tours grid:

```
[All Tours (12)] [Beach Tours (5)] [City Tours (3)] [Island Tours (4)]
```

#### Features
- **All Tours** button shows total count
- **Category buttons** show tour count per category
- **Active state**: Black background with white text
- **Inactive state**: Gray background with hover effect
- **Responsive**: Wraps on smaller screens
- **Real-time filtering**: Updates grid instantly

### 3. **Admin-Specific Features**

While matching the frontend design, we kept essential admin features:

#### Status Badge
- Replaces the wishlist button position (top-right)
- Shows: Published (green), Draft (yellow), Archived (gray)
- Semi-transparent with backdrop blur

#### Action Bar
- Bottom section with gray background
- **View button**: Opens public tour page (published only)
- **Duplicate button**: Creates copy of tour
- **More menu**: Status changes and delete

#### Clickable Card
- Entire card links to `/admin/tours/{id}` for editing
- Action buttons use `stopPropagation()` to prevent card click

## Visual Comparison

### Frontend Card (Public)
```
┌──────────────────────┐
│ ╔════════════════╗   │
│ ║   TOUR IMAGE   ║   │  ← Same image
│ ║                ║   │
│ ╚════════════════╝   │
│ [Special Label] ❤️   │  ← Special label + Wishlist
│                      │
│ Beach Tours • 4h     │  ← Category + Duration
│ Amazing Beach Tour   │  ← Title (2 lines)
│ [Tag1] [Tag2] [Tag3] │  ← Tags
│                      │
│ From ฿1,200    ⭐4.5 │  ← Price + Rating
│                (1.2K)│
└──────────────────────┘
```

### Admin Card (Updated)
```
┌──────────────────────┐
│ ╔════════════════╗   │
│ ║   TOUR IMAGE   ║   │  ← Same image
│ ║                ║   │
│ ╚════════════════╝   │
│ [Special Label] 🟢   │  ← Special label + Status
│                      │
│ Beach Tours • 4h     │  ← Category + Duration
│ Amazing Beach Tour   │  ← Title (2 lines)
│ [Tag1] [Tag2] [Tag3] │  ← Tags
│                      │
│ From ฿1,200    ⭐4.5 │  ← Price + Rating
│                (1.2K)│
├──────────────────────┤
│ [View] [⎘] [•••]     │  ← Admin actions
└──────────────────────┘
```

## Implementation Details

### Files Modified

#### 1. `app/admin/tours/TourListClient.tsx`

**New State:**
```typescript
const [filteredTours, setFilteredTours] = useState(initialTours);
const [categories, setCategories] = useState<TourCategory[]>([]);
const [selectedCategory, setSelectedCategory] = useState<string>('all');
```

**New Functions:**
```typescript
fetchCategories()           // Fetch all categories from API
getMockRating(tourId)       // Generate consistent mock ratings
getHeroContent(tour)        // Get hero block config (duration, etc.)
```

**New Effects:**
```typescript
useEffect(() => {
  fetchCategories();
}, []);

useEffect(() => {
  // Filter tours by selected category
  if (selectedCategory === 'all') {
    setFilteredTours(tours);
  } else {
    const filtered = tours.filter(tour => 
      tour.categories?.some(cat => cat.id === selectedCategory)
    );
    setFilteredTours(filtered);
  }
}, [selectedCategory, tours]);
```

**Card Structure:**
```tsx
<div className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
  <Link href={`/admin/tours/${tour.id}`}>
    {/* Image with special label and status */}
    <div className="relative aspect-[4/3] overflow-hidden">
      <Image src={imageUrl} alt={heroTitle} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
      {primaryLabel && <div style={{ backgroundColor, color }}>...</div>}
      <div className="status-badge">...</div>
    </div>
    
    {/* Content - EXACT match to frontend */}
    <div className="flex flex-1 flex-col p-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
        <span className="font-medium">{categoryName}</span>
        {duration && <><span>•</span><span>⏰ {duration}</span></>}
      </div>
      <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 transition-colors tour-card-title group-hover:text-[#0033FF]">
        {heroTitle}
      </h3>
      {tags.length > 0 && <div className="mb-2 flex flex-wrap gap-1.5">...</div>}
      <div className="flex-1" />
      <div className="flex items-center justify-between">
        <div>From {formatCurrency(minPrice, currency)}</div>
        <div>⭐{rating.toFixed(1)} ({reviewCount.toLocaleString()})</div>
      </div>
    </div>
  </Link>
  
  {/* Admin actions */}
  <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">...</div>
</div>
```

#### 2. `lib/data/admin.ts`

**Updated `adminListTours()`:**
```typescript
export async function adminListTours(): Promise<any[]> {
  // 1. Fetch tours with blocks and pricing
  const { data: tours } = await supabase
    .from('tours')
    .select(`
      *,
      blocks:tour_blocks(...),
      pricing:tour_pricing(...)
    `);

  // 2. Fetch categories for all tours
  const { data: categoryAssignments } = await supabase
    .from('tour_category_assignments')
    .select(`tour_id, tour_categories (*)`)
    .in('tour_id', tourIds);

  // 3. Fetch special labels for all tours
  const { data: labelAssignments } = await supabase
    .from('tour_special_label_assignments')
    .select(`tour_id, tour_special_labels (*)`)
    .in('tour_id', tourIds);

  // 4. Create maps and transform data
  return tours.map(tour => ({
    ...tour,
    blocks: tour.blocks || [],
    pricing: tour.pricing?.[0]?.config || null,
    categories: categoriesByTourId.get(tour.id) || [],
    specialLabels: labelsByTourId.get(tour.id) || [],
  }));
}
```

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Page loads: /admin/tours                             │
│    - Calls adminListTours()                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Fetch tour data with joins                           │
│    - Tours with blocks and pricing                      │
│    - Categories via tour_category_assignments           │
│    - Special labels via tour_special_label_assignments  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Client component mounts                              │
│    - Receives tours with nested data                    │
│    - Fetches all categories for filter                  │
│    - Sets up filter state                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. User interacts                                        │
│    - Clicks category filter → Updates filteredTours    │
│    - Clicks card → Navigates to editor                 │
│    - Clicks action button → Performs action            │
└─────────────────────────────────────────────────────────┘
```

## Category Filter Logic

```typescript
// When category changes
useEffect(() => {
  if (selectedCategory === 'all') {
    setFilteredTours(tours);
  } else {
    const filtered = tours.filter(tour => 
      tour.categories?.some(cat => cat.id === selectedCategory)
    );
    setFilteredTours(filtered);
  }
}, [selectedCategory, tours]);
```

## Features Comparison

| Feature | Frontend | Admin (Updated) |
|---------|----------|-----------------|
| **Grid Layout** | ✅ 1-4 columns | ✅ 1-4 columns (same) |
| **Card Width** | ✅ Equal width | ✅ Equal width (same) |
| **Image** | ✅ Hero image | ✅ Hero image (same) |
| **Special Label** | ✅ Corner badge | ✅ Corner badge (same) |
| **Category** | ✅ Displayed | ✅ Displayed (same) |
| **Duration** | ✅ With icon | ✅ With icon (same) |
| **Title** | ✅ 2-line clamp | ✅ 2-line clamp (same) |
| **Tags** | ✅ Up to 3 | ✅ Up to 3 (same) |
| **Price** | ✅ "From {amount}" | ✅ "From {amount}" (same) |
| **Rating** | ✅ Star + count | ✅ Star + count (same) |
| **Hover Color** | ✅ #0033FF | ✅ #0033FF (same) |
| **Wishlist Button** | ✅ Top-right | ❌ Replaced with status |
| **Status Badge** | ❌ Not shown | ✅ Top-right |
| **Action Bar** | ❌ Not shown | ✅ Bottom bar |
| **Category Filter** | ❌ Not shown | ✅ Above grid |
| **Click Action** | View tour details | Edit tour |

## Responsive Behavior

### Desktop (1920px)
```
[Filter Bar: All | Category 1 | Category 2 | Category 3]

[Card] [Card] [Card] [Card]  ← 4 columns
[Card] [Card] [Card] [Card]
```

### Tablet (768px)
```
[Filter Bar: All | Category 1 | Category 2]
[Category 3]

[Card] [Card] [Card]  ← 3 columns
[Card] [Card] [Card]
```

### Mobile (375px)
```
[Filter Bar: All]
[Category 1] [Category 2]
[Category 3]

[Card]  ← 1 column
[Card]
[Card]
```

## User Experience

### Workflow
1. Admin navigates to `/admin/tours`
2. Sees category filter bar with counts
3. Clicks category to filter (or "All Tours")
4. Sees grid of tour cards matching frontend design
5. Identifies tour by image, title, and details
6. Clicks card to edit
7. Or uses action buttons for quick tasks

### Benefits
- ✅ **Consistent UI**: Same look as public page
- ✅ **Visual Recognition**: Easy to identify tours
- ✅ **Quick Filtering**: Find tours by category
- ✅ **Exact Match**: Same card width and layout
- ✅ **All Details**: Category, duration, tags, rating
- ✅ **Admin Features**: Status, actions, edit access

## Testing Checklist

- [ ] Cards display exactly like frontend
- [ ] Card widths are equal across grid
- [ ] Category filter shows all categories
- [ ] Filter counts are accurate
- [ ] Clicking category filters tours
- [ ] "All Tours" shows all tours
- [ ] Empty category shows message
- [ ] Special labels display with colors
- [ ] Status badges show correct colors
- [ ] Tags display (up to 3)
- [ ] Duration shows with clock icon
- [ ] Rating displays with star
- [ ] Price formats correctly
- [ ] Hover effects work (scale, color, shadow)
- [ ] Clicking card navigates to editor
- [ ] Action buttons work without triggering card click
- [ ] View button opens public page
- [ ] Duplicate button works
- [ ] More menu shows status options
- [ ] Responsive grid adjusts to screen size
- [ ] Filter bar wraps on small screens

## Summary

The admin tours page now provides:

✅ **Exact frontend match** - Cards look identical to public tours page  
✅ **Same card width** - Equal width cards in responsive grid  
✅ **Category filtering** - Filter tours by category with counts  
✅ **All tour details** - Category, duration, tags, price, rating  
✅ **Special labels** - Colored corner badges  
✅ **Status badges** - Published/Draft/Archived indicators  
✅ **Admin actions** - View, duplicate, status change, delete  
✅ **Click to edit** - Entire card navigates to editor  
✅ **Responsive design** - 1-4 columns based on screen size  
✅ **Consistent styling** - Same colors, fonts, spacing as frontend  

This provides a professional, consistent, and user-friendly admin interface that matches the public-facing design while adding essential admin functionality.




