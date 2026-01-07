# Site Branding Integration Guide

## Overview

This guide shows how the site branding (logo and favicon) has been integrated into the application and how it works.

## ✅ What's Already Integrated

### 1. Header Logo
**File:** `app/[lang]/layout.tsx` and `components/layout/Header.tsx`

The header now displays:
- **Custom logo** if uploaded via admin settings
- **Default branding** (ASTRONOUT with icon) if no logo is set

```typescript
// Layout fetches branding settings
const branding = await getBrandingSettings();

// Passes logo URL to Header component
<Header logoUrl={branding.logo_url} />

// Header displays logo or fallback
{logoUrl ? (
  <img src={logoUrl} alt="ASTRONOUT" className="h-10 w-auto" />
) : (
  // Default branding
)}
```

### 2. Favicon
**File:** `app/[lang]/layout.tsx`

The favicon is automatically applied to all pages:

```typescript
const branding = await getBrandingSettings();

<head>
  {branding.favicon_url && (
    <>
      <link rel="icon" href={branding.favicon_url} />
      <link rel="shortcut icon" href={branding.favicon_url} />
      <link rel="apple-touch-icon" href={branding.favicon_url} />
    </>
  )}
</head>
```

## 🎯 How It Works

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Admin uploads logo/favicon via Settings page         │
│    (/admin/settings)                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. BrandingUploader component handles file upload       │
│    - Validates file type and size                       │
│    - Uploads via /api/admin/upload                      │
│    - Returns mock URL (bucket not configured)           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Settings saved to database via API                   │
│    PUT /api/admin/settings/branding                     │
│    - Stores logo_url and favicon_url in site_settings   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Frontend fetches branding on page load               │
│    - Layout calls getBrandingSettings()                 │
│    - Returns logo_url and favicon_url                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Branding applied to page                             │
│    - Logo passed to Header component                    │
│    - Favicon added to <head>                            │
│    - Visible to all users                               │
└─────────────────────────────────────────────────────────┘
```

## 📁 Modified Files

### 1. `app/[lang]/layout.tsx`
**Changes:**
- Import `getBrandingSettings` helper
- Fetch branding settings on server
- Add favicon links to `<head>`
- Pass `logoUrl` to Header component

**Before:**
```typescript
<Header />
```

**After:**
```typescript
const branding = await getBrandingSettings();

<head>
  {branding.favicon_url && (
    <link rel="icon" href={branding.favicon_url} />
  )}
</head>
<Header logoUrl={branding.logo_url} />
```

### 2. `components/layout/Header.tsx`
**Changes:**
- Accept optional `logoUrl` prop
- Display custom logo if provided
- Fall back to default branding if not

**Before:**
```typescript
export function Header() {
  // Always showed default ASTRONOUT branding
}
```

**After:**
```typescript
interface HeaderProps {
  logoUrl?: string | null;
}

export function Header({ logoUrl }: HeaderProps = {}) {
  // Shows custom logo or default branding
}
```

## 🚀 Testing the Integration

### Step 1: Upload Branding
1. Go to `/admin/login` and log in
2. Navigate to `/admin/settings`
3. Upload a logo and favicon
4. Click "Save Branding"
5. Wait for success message

### Step 2: Verify Display
1. Open the homepage (`/en` or any language)
2. Check the header - your logo should appear
3. Check the browser tab - your favicon should appear
4. Test on different pages to ensure consistency

### Step 3: Test Fallback
1. Go back to `/admin/settings`
2. Remove the logo (click Remove button)
3. Save settings
4. Refresh homepage
5. Default ASTRONOUT branding should appear

## 🎨 Customization

### Adjust Logo Size

In `components/layout/Header.tsx`:

```typescript
<img 
  src={logoUrl} 
  alt="ASTRONOUT" 
  className="h-10 w-auto object-contain"  // Change h-10 to adjust height
/>
```

### Add Logo to Footer

In `components/layout/Footer.tsx`:

```typescript
import { getBrandingSettings } from '@/lib/data/settings';

export async function Footer() {
  const branding = await getBrandingSettings();
  
  return (
    <footer>
      {branding.logo_url && (
        <img src={branding.logo_url} alt="Logo" className="h-8" />
      )}
    </footer>
  );
}
```

### Use in Other Components

```typescript
import { getBrandingSettings } from '@/lib/data/settings';

export async function MyComponent() {
  const branding = await getBrandingSettings();
  
  return (
    <div>
      {branding.logo_url && <img src={branding.logo_url} />}
    </div>
  );
}
```

## 🔧 Advanced Usage

### Client-Side Access

If you need branding in a client component:

```typescript
'use client';

import { useEffect, useState } from 'react';

export function ClientComponent() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  useEffect(() => {
    fetch('/api/admin/settings/branding')
      .then(res => res.json())
      .then(data => setLogoUrl(data.data.logo_url));
  }, []);
  
  return logoUrl ? <img src={logoUrl} /> : null;
}
```

### Caching

The branding settings are fetched on each page load. For better performance, consider:

1. **Next.js Cache:**
```typescript
export const revalidate = 3600; // Cache for 1 hour
```

2. **React Cache:**
```typescript
import { cache } from 'react';

export const getBrandingSettings = cache(async () => {
  // ... fetch logic
});
```

### Multiple Logo Variants

Extend the branding settings to support multiple variants:

```typescript
// In database
{
  "logo_url": "https://...",
  "logo_dark_url": "https://...",  // For dark mode
  "logo_mobile_url": "https://...", // For mobile
  "favicon_url": "https://..."
}

// In Header component
<img 
  src={isDarkMode ? branding.logo_dark_url : branding.logo_url} 
  alt="Logo" 
/>
```

## 📊 Performance Considerations

### Current Implementation
- ✅ Server-side rendering (no client-side fetch)
- ✅ Single database query per page load
- ✅ Minimal JavaScript bundle size
- ✅ No layout shift (logo loaded on server)

### Optimization Tips
1. Use Next.js Image component for optimization
2. Add proper caching headers
3. Use CDN for logo/favicon files
4. Implement image optimization pipeline

## 🐛 Troubleshooting

### Logo Not Showing
1. Check if logo was uploaded successfully
2. Verify URL in database: `SELECT * FROM site_settings WHERE key = 'branding'`
3. Check browser console for errors
4. Verify file is accessible (not blocked by CORS)
5. Clear browser cache

### Favicon Not Showing
1. Check if favicon was uploaded successfully
2. Verify URL in database
3. Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
4. Check browser dev tools > Application > Manifest
5. Try hard refresh

### Default Branding Shows Instead
1. Verify logo URL is not null in database
2. Check if `getBrandingSettings()` is being called
3. Verify `logoUrl` prop is passed to Header
4. Check for JavaScript errors in console

## 🎉 Summary

The site branding system is now fully integrated:

✅ **Admin Interface** - Upload and manage logo/favicon  
✅ **Database Storage** - Settings stored securely  
✅ **Frontend Display** - Logo in header, favicon in browser  
✅ **Fallback Support** - Default branding if not set  
✅ **Type Safety** - Full TypeScript support  
✅ **Performance** - Server-side rendering  
✅ **Documentation** - Complete guides available  

## 📚 Related Documentation

- [Site Branding Module](./functionality/16-SITE-BRANDING.md) - Complete technical documentation
- [Branding Setup Guide](./BRANDING-SETUP.md) - Quick setup instructions
- [Implementation Summary](./BRANDING-IMPLEMENTATION-SUMMARY.md) - What was built

## 🔜 Next Steps

1. Test the integration thoroughly
2. Upload production logo and favicon
3. Configure Supabase Storage bucket (when ready)
4. Add logo to Footer component
5. Implement dark mode logo variant
6. Add image optimization



