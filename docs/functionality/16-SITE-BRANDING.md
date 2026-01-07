# Site Branding Module

## Overview
The Site Branding module allows administrators to customize the website's visual identity by uploading and managing the site logo and favicon through the admin settings dashboard.

## Features

### 1. Logo Management
- Upload custom website logo
- Preview logo before saving
- Replace or remove existing logo
- Recommended dimensions: 200x60px or similar aspect ratio
- Maximum file size: 2MB
- Supported formats: PNG, JPG, WebP, GIF

### 2. Favicon Management
- Upload custom favicon
- Preview favicon before saving
- Replace or remove existing favicon
- Recommended dimensions: 32x32px or 64x64px
- Maximum file size: 500KB
- Supported formats: PNG, JPG, WebP, ICO

### 3. Storage
- **Mock Implementation**: Currently uses mock URLs (bucket not configured)
- **Future**: Will use Supabase Storage bucket `site-assets`
- Files are organized in the `branding` folder
- Settings stored in `site_settings` table with key `branding`

## Database Schema

### site_settings Table
```sql
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Branding Settings Structure
```json
{
  "logo_url": "https://example.com/logo.png" | null,
  "favicon_url": "https://example.com/favicon.png" | null
}
```

## API Endpoints

### GET /api/admin/settings/branding
Get current branding settings.

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

### PUT /api/admin/settings/branding
Update branding settings.

**Request Body:**
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

## Components

### BrandingUploader
Specialized component for uploading logo and favicon with validation.

**Props:**
```typescript
interface BrandingUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label: string;
  type: 'logo' | 'favicon';
  description?: string;
}
```

**Features:**
- File type validation (images only)
- File size validation (2MB for logo, 500KB for favicon)
- Upload progress indicator
- Preview with hover controls
- Replace and remove actions

## Usage

### Admin Settings Page
Navigate to `/admin/settings` to access the branding settings.

1. **Upload Logo:**
   - Click on the logo upload area
   - Select an image file
   - Wait for upload to complete
   - Click "Save Branding" to persist changes

2. **Upload Favicon:**
   - Click on the favicon upload area
   - Select an image file (preferably square)
   - Wait for upload to complete
   - Click "Save Branding" to persist changes

3. **Replace/Remove:**
   - Hover over existing logo/favicon
   - Click "Replace" to upload a new file
   - Click "Remove" to delete the current file
   - Click "Save Branding" to persist changes

### Fetching Settings in Code

```typescript
import { getBrandingSettings } from '@/lib/data/settings';

// In a Server Component
const branding = await getBrandingSettings();
console.log(branding.logo_url);
console.log(branding.favicon_url);
```

### Using in Header Component
```typescript
import { getBrandingSettings } from '@/lib/data/settings';

export async function Header() {
  const branding = await getBrandingSettings();
  
  return (
    <header>
      {branding.logo_url ? (
        <img src={branding.logo_url} alt="Site Logo" />
      ) : (
        <span>Site Name</span>
      )}
    </header>
  );
}
```

### Using in Layout for Favicon
```typescript
import { getBrandingSettings } from '@/lib/data/settings';

export default async function RootLayout() {
  const branding = await getBrandingSettings();
  
  return (
    <html>
      <head>
        {branding.favicon_url && (
          <link rel="icon" href={branding.favicon_url} />
        )}
      </head>
      <body>...</body>
    </html>
  );
}
```

## File Structure

```
app/
├── admin/
│   └── settings/
│       └── page.tsx                    # Settings page with branding UI
├── api/
│   └── admin/
│       └── settings/
│           └── branding/
│               └── route.ts            # Branding API endpoints
components/
└── admin/
    └── BrandingUploader.tsx            # Branding upload component
lib/
└── data/
    └── settings.ts                     # Settings data helpers
supabase/
└── migrations/
    └── 006_site_settings.sql           # Database migration
```

## Security

### Authentication & Authorization
- All branding endpoints require admin authentication
- Row Level Security (RLS) policies:
  - Public read access to `site_settings`
  - Only admin users can update/insert settings

### File Upload Validation
- File type validation (images only)
- File size limits enforced
- Secure upload through admin API

## Future Enhancements

1. **Supabase Storage Integration**
   - Configure `site-assets` bucket
   - Implement actual file upload to bucket
   - Add CDN support for better performance

2. **Advanced Branding Options**
   - Primary/secondary color customization
   - Font selection
   - Multiple logo variants (light/dark mode)
   - Logo dimensions and positioning

3. **Preview Mode**
   - Live preview of changes before saving
   - Preview on different page types

4. **Image Optimization**
   - Automatic image compression
   - Multiple size variants generation
   - WebP conversion

5. **Favicon Generation**
   - Generate multiple favicon sizes from single upload
   - Generate Apple touch icons
   - Generate Android chrome icons

## Notes

- Current implementation uses mock URLs as bucket is not configured
- Logo and favicon are optional - site will work without them
- Settings are cached for performance
- Changes take effect immediately after saving
- No page refresh required after update




