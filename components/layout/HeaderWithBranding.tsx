import { getBrandingSettings } from '@/lib/data/settings';
import { Header } from './Header';

/**
 * Server Component wrapper for Header that fetches branding settings
 * This allows us to pass logo URL to the client Header component
 */
export async function HeaderWithBranding() {
  const branding = await getBrandingSettings();
  
  return <Header logoUrl={branding.logo_url} />;
}




