# 04 - Block Rendering Engine

**Status:** ✅ Complete  
**Dependencies:** 02-Database, 03-Multi-Language

---

## Overview

Dynamic block-based page rendering system. Each tour has ordered, translatable blocks that render as React components.

---

## Block Types

| Type | Component | Purpose |
|------|-----------|---------|
| hero | HeroBlock | Full-width header with image |
| highlights | HighlightsBlock | Feature bullets |
| pricing_selector | PricingSelectorBlock | Engine-specific pricing UI |
| availability_selector | AvailabilitySelectorBlock | Date/time picker |
| itinerary | ItineraryBlock | Timeline of activities |
| included_excluded | IncludedExcludedBlock | What's included/not |
| what_to_bring | WhatToBringBlock | Packing list |
| safety_info | SafetyInfoBlock | Safety guidelines |
| map | MapBlock | Location embed |
| reviews | ReviewsBlock | Testimonials |
| upsells | UpsellsBlock | Add-on products |
| terms | TermsBlock | Terms and conditions |

---

## Architecture

### Block Registry (`components/blocks/registry.ts`)
```typescript
export const blockRegistry: Record<string, ComponentType<BlockProps>> = {
  hero: HeroBlock,
  highlights: HighlightsBlock,
  // ...
};
```

### Block Renderer (`components/blocks/BlockRenderer.tsx`)
```tsx
<BlockRenderer blocks={blocks} />
```

- Receives ordered blocks array
- Renders matching component per block_type
- Unknown types render nothing (safe)

---

## Block Data Structure

```typescript
interface TourBlockWithTranslation {
  id: string;
  tour_id: string;
  block_type: BlockType;
  order: number;
  enabled: boolean;
  config: Record<string, unknown>;
  title: string;           // Resolved translation
  content: Record<string, unknown>;  // Resolved translation
}
```

---

## Key Files

- `components/blocks/registry.ts` - Block type mapping
- `components/blocks/BlockRenderer.tsx` - Render orchestrator
- `components/blocks/*.tsx` - Individual block components

---

## Acceptance Criteria

- [x] 12 block types implemented
- [x] Blocks render in order
- [x] Unknown types handled safely
- [x] Translations resolved per block
- [x] All blocks use Container (1225px)




