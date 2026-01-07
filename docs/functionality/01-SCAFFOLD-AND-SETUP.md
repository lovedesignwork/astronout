# 01 - Scaffold and Setup

**Status:** ✅ Complete  
**Dependencies:** None

---

## Overview

Initial Next.js project setup with TypeScript, Tailwind CSS, Supabase integration, and base layout system.

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** Vercel
- **Package Manager:** npm

---

## Installation

```bash
npx create-next-app@latest . --typescript --tailwind --app
npm install @supabase/supabase-js @supabase/ssr zod clsx tailwind-merge
npm install @dnd-kit/core @dnd-kit/sortable @stripe/stripe-js date-fns @heroicons/react recharts
```

---

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_DOMAIN=
```

---

## Key Files

- `lib/env.ts` - Zod validation for environment variables
- `lib/utils.ts` - Utility functions (cn, formatCurrency, etc.)
- `lib/supabase/client.ts` - Browser Supabase client
- `lib/supabase/server.ts` - Server Supabase client
- `components/layout/Container.tsx` - 1225px max-width container
- `components/layout/Header.tsx` - Site header with navigation
- `components/layout/Footer.tsx` - Site footer

---

## Container Component

All public pages use the Container component:

```tsx
<Container className="py-12">
  <YourContent />
</Container>
```

CSS: `max-width: 1225px; width: 100%; margin: 0 auto; padding: 16px/24px`

---

## Acceptance Criteria

- [x] App boots without errors
- [x] Tailwind CSS working
- [x] Supabase clients configured
- [x] Environment variables validated
- [x] Container component enforces 1225px
- [x] Header and Footer render correctly




