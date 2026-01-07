# 11 - Admin Block Editor

**Status:** ✅ Partial (UI framework ready)  
**Dependencies:** 10-Admin-Tours

---

## Overview

Visual block editor for tour content with drag-drop reordering and per-language editing.

---

## Route

`/admin/tours/{tourId}/blocks`

---

## Features

### Block List
- Display all blocks in order
- Enable/disable toggle per block
- Delete block button
- Add new block button

### Drag-Drop Reordering
- Uses @dnd-kit library
- Updates order in database
- Visual feedback during drag

### Block Content Editor
- Language tabs (9 languages)
- Title field
- Content fields (varies by block type)
- Rich text for descriptions

### Preview Mode
- Opens tour page in new tab
- Shows current block configuration

---

## Block Types Configuration

| Block | Editable Fields |
|-------|-----------------|
| hero | title, subtitle, imageUrl, badges |
| highlights | title, items[] |
| itinerary | title, items[{time, title, description}] |
| included_excluded | included[], excluded[] |
| what_to_bring | items[], note |
| safety_info | items[], warnings[], restrictions[] |
| map | address, meetingPoint, lat/lng |
| reviews | reviews[{author, rating, comment}] |
| terms | sections[], cancellationPolicy |

---

## API Endpoints

```
GET /api/admin/tours/{tourId}/blocks
POST /api/admin/tours/{tourId}/blocks
PUT /api/admin/tours/{tourId}/blocks/{blockId}
DELETE /api/admin/tours/{tourId}/blocks/{blockId}
PUT /api/admin/tours/{tourId}/blocks/reorder
```

---

## Key Files

- `app/admin/tours/[tourId]/blocks/page.tsx`
- `components/admin/BlockEditor.tsx`
- `components/admin/BlockContentForm.tsx`

---

## Acceptance Criteria

- [x] List blocks in order
- [x] Enable/disable blocks
- [ ] Drag-drop reordering (UI ready)
- [ ] Content editing per language (UI ready)
- [x] Add new block




