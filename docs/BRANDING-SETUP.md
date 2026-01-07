# Site Branding Setup Guide

## Quick Start

### 1. Run Database Migration

First, apply the site settings migration to create the necessary database table:

```sql
-- Run this in your Supabase SQL Editor
-- File: supabase/migrations/006_site_settings.sql
```

Or if using Supabase CLI:

```bash
supabase db push
```

### 2. Access Admin Settings

1. Log in to the admin panel at `/admin/login`
2. Navigate to Settings at `/admin/settings`
3. Scroll to the "Site Branding" section

### 3. Upload Logo and Favicon

**Upload Logo:**
- Click on the logo upload area
- Select your logo image (recommended: 200x60px)
- Max size: 2MB
- Formats: PNG, JPG, WebP, GIF

**Upload Favicon:**
- Click on the favicon upload area
- Select your favicon image (recommended: 32x32px or 64x64px)
- Max size: 500KB
- Formats: PNG, JPG, WebP, ICO

**Save Changes:**
- Click the "Save Branding" button
- Wait for success confirmation

## Current Status: Mock Implementation

⚠️ **Important**: The current implementation uses **mock URLs** because the Supabase Storage bucket is not yet configured.

### What This Means:
- Files are uploaded through the `/api/admin/upload` endpoint
- URLs are generated but not stored in actual cloud storage
- This is for development and testing purposes
- Settings are saved to the database correctly

### To Enable Real Storage:

1. **Create Supabase Storage Bucket:**
   ```sql
   -- In Supabase Dashboard > Storage
   -- Create a new bucket named 'site-assets'
   -- Set it to public
   ```

2. **Configure Storage Policies:**
   ```sql
   -- Allow public read access
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'site-assets');

   -- Allow admin upload
   CREATE POLICY "Admin Upload"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'site-assets' AND
     auth.uid() IN (SELECT id FROM admin_users)
   );
   ```

3. **Update Upload API:**
   - Modify `/app/api/admin/upload/route.ts`
   - Implement actual Supabase Storage upload
   - Return real storage URLs

## Using Branding in Your App

### In Server Components

```typescript
import { getBrandingSettings } from '@/lib/data/settings';

export default async function MyComponent() {
  const branding = await getBrandingSettings();
  
  return (
    <div>
      {branding.logo_url && (
        <img src={branding.logo_url} alt="Logo" />
      )}
    </div>
  );
}
```

### In the Header

Update your header component to use the logo:

```typescript
// components/layout/Header.tsx
import { getBrandingSettings } from '@/lib/data/settings';

export async function Header() {
  const branding = await getBrandingSettings();
  
  return (
    <header>
      <nav>
        {branding.logo_url ? (
          <img 
            src={branding.logo_url} 
            alt="Site Logo"
            className="h-12 w-auto"
          />
        ) : (
          <span className="text-xl font-bold">Tour Booking</span>
        )}
      </nav>
    </header>
  );
}
```

### In Root Layout for Favicon

Update your root layout to use the favicon:

```typescript
// app/layout.tsx
import { getBrandingSettings } from '@/lib/data/settings';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const branding = await getBrandingSettings();
  
  return (
    <html lang="en">
      <head>
        {branding.favicon_url && (
          <>
            <link rel="icon" href={branding.favicon_url} />
            <link rel="shortcut icon" href={branding.favicon_url} />
            <link rel="apple-touch-icon" href={branding.favicon_url} />
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## API Reference

### Get Branding Settings
```
GET /api/admin/settings/branding
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logo_url": "https://example.com/logo.png",
    "favicon_url": "https://example.com/favicon.png"
  }
}
```

### Update Branding Settings
```
PUT /api/admin/settings/branding
```

**Request:**
```json
{
  "logo_url": "https://example.com/logo.png",
  "favicon_url": "https://example.com/favicon.png"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logo_url": "https://example.com/logo.png",
    "favicon_url": "https://example.com/favicon.png"
  }
}
```

## Troubleshooting

### Logo/Favicon Not Showing
1. Check if the settings were saved successfully
2. Verify the URLs in the database
3. Check browser console for errors
4. Clear browser cache

### Upload Fails
1. Check file size (logo: 2MB max, favicon: 500KB max)
2. Verify file format (images only)
3. Check admin authentication
4. Review server logs

### Database Error
1. Ensure migration was run successfully
2. Check if `site_settings` table exists
3. Verify RLS policies are in place
4. Check admin user permissions

## Best Practices

### Logo
- Use PNG with transparent background
- Recommended size: 200x60px (or maintain 3:1 aspect ratio)
- Keep file size under 100KB for fast loading
- Use high-resolution for retina displays (2x)

### Favicon
- Use square image (1:1 aspect ratio)
- Recommended sizes: 32x32px or 64x64px
- Keep it simple and recognizable at small sizes
- Consider using ICO format for best compatibility

### File Naming
- Use descriptive names: `company-logo.png`, `site-favicon.png`
- Avoid spaces and special characters
- Use lowercase for consistency

## Next Steps

1. ✅ Run database migration
2. ✅ Upload logo and favicon through admin panel
3. ⬜ Configure Supabase Storage bucket (when ready)
4. ⬜ Update header component to use logo
5. ⬜ Update root layout to use favicon
6. ⬜ Test on different devices and browsers

## Support

For more details, see the full documentation:
- [Site Branding Module](./functionality/16-SITE-BRANDING.md)
- [Admin Dashboard](./functionality/12-ADMIN-DASHBOARD.md)



