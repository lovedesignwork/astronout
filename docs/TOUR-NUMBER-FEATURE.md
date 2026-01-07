# Tour Number Feature

## Overview
Each tour now has a unique sequential ID starting from 001 (e.g., 001, 002, 003, etc.) that automatically increments for each new tour created.

## Implementation Details

### Database Changes
- **Migration File**: `supabase/migrations/007_add_tour_number.sql`
- **New Column**: `tour_number` (TEXT) added to the `tours` table
- **Unique Constraint**: Ensures no duplicate tour numbers
- **Auto-increment**: Automatically assigns the next available number when a new tour is created

### Features

#### 1. Automatic Assignment
- When a new tour is created, it automatically receives the next sequential tour number
- The system finds the highest existing tour number and increments it by 1
- Numbers are zero-padded to 3 digits (001, 002, 003, etc.)

#### 2. Backfill for Existing Tours
- The migration automatically assigns tour numbers to all existing tours
- Assignment is based on creation date (oldest tours get lower numbers)

#### 3. Database Functions

**`generate_next_tour_number()`**
- Returns the next available tour number
- Extracts numeric values from existing tour numbers
- Increments the maximum value and formats with leading zeros

**`assign_tour_number()`**
- Trigger function that runs before INSERT on tours table
- Only assigns a tour number if one isn't already provided
- Ensures every new tour gets a unique number

### Frontend Display

#### Admin Tours List (`app/admin/tours/TourListClient.tsx`)
The tour number is displayed on each tour card:
```tsx
{tour.tour_number && (
  <>
    <span className="font-semibold text-gray-700">#{tour.tour_number}</span>
    <span>•</span>
  </>
)}
```

**Location**: Top-left of each tour card, before the category name

**Style**: 
- Bold gray text (#)
- Followed by a bullet separator

#### Tour Edit Page (`app/admin/tours/[id]/TourEditor.tsx`)
The tour number is displayed in the page header:
```tsx
{tour.tour_number && <span className="text-gray-500">#{tour.tour_number} · </span>}
{heroTitle || 'Edit Tour'}
```

**Location**: In the h1 heading, before the tour title

**Style**: 
- Gray text with # prefix
- Followed by a middle dot separator

### Type Definitions

Updated `types/index.ts` to include `tour_number`:
```typescript
export interface Tour {
  id: string;
  tour_number: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  pricing_engine: PricingEngine;
  tags: string[];
  created_at: string;
  updated_at: string;
}
```

## Usage Examples

### Creating a New Tour
When you create a new tour through the admin interface:
1. The tour is inserted into the database
2. The `assign_tour_number()` trigger fires automatically
3. The `generate_next_tour_number()` function calculates the next number
4. The tour receives its unique sequential ID (e.g., "015")

### Viewing Tours
- **Admin List**: Tour numbers appear as "#001", "#002", etc. on each tour card
- **Edit Page**: Tour number appears in the header as "#001 · Tour Title"

### Duplicating Tours
When duplicating a tour, the duplicate receives a new sequential tour number automatically.

## Database Schema

```sql
-- Column definition
ALTER TABLE tours ADD COLUMN IF NOT EXISTS tour_number TEXT;

-- Unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_tours_tour_number 
  ON tours(tour_number) 
  WHERE tour_number IS NOT NULL;

-- Trigger
CREATE TRIGGER trigger_assign_tour_number
  BEFORE INSERT ON tours
  FOR EACH ROW
  EXECUTE FUNCTION assign_tour_number();
```

## Migration Instructions

To apply this feature to an existing database:

1. Run the migration:
```bash
# If using Supabase CLI
supabase db push

# Or apply the SQL directly in Supabase Dashboard
# Copy contents of supabase/migrations/007_add_tour_number.sql
```

2. Verify the migration:
```sql
-- Check that existing tours have numbers
SELECT id, tour_number, slug, created_at 
FROM tours 
ORDER BY tour_number;

-- Check that the trigger is installed
SELECT * FROM pg_trigger WHERE tgname = 'trigger_assign_tour_number';
```

3. Test by creating a new tour through the admin interface

## Benefits

1. **Easy Reference**: Staff can quickly reference tours by number
2. **Sequential Organization**: Tours are numbered in order of creation
3. **Unique Identifier**: Each tour has a human-friendly unique ID
4. **Automatic Management**: No manual intervention needed
5. **Backward Compatible**: Existing tours are automatically assigned numbers

## Future Enhancements

Potential improvements that could be added:

1. **Custom Prefixes**: Allow tour numbers like "PKT-001", "ISL-002" for different categories
2. **Search by Number**: Add search functionality to find tours by their number
3. **Sorting**: Add ability to sort tours by tour number in the admin interface
4. **Display on Frontend**: Show tour numbers on customer-facing pages
5. **Booking References**: Include tour numbers in booking references

## Technical Notes

- Tour numbers are stored as TEXT to allow for future flexibility (e.g., prefixes, custom formats)
- The current implementation uses 3-digit zero-padded numbers (001-999)
- The system can handle more than 999 tours (will continue as 1000, 1001, etc.)
- Tour numbers are immutable once assigned (not reassigned if a tour is deleted)
- The unique index ensures database-level integrity



