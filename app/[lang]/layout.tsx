import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Outfit } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LanguageProvider } from '@/lib/contexts/LanguageContext';
import { WishlistProvider } from '@/lib/contexts/WishlistContext';
import { VisitorTracker } from '@/components/tracking/VisitorTracker';
import { Language, SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '@/types';
import { getBrandingSettings } from '@/lib/data/settings';

// Configure Outfit font from Google Fonts
// https://fonts.google.com/specimen/Outfit
const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  
  const alternates: Record<string, string> = {};
  SUPPORTED_LANGUAGES.forEach((l) => {
    alternates[l] = `/${l}`;
  });

  return {
    alternates: {
      languages: alternates,
    },
    openGraph: {
      locale: lang,
      alternateLocale: SUPPORTED_LANGUAGES.filter((l) => l !== lang),
    },
  };
}

export default async function LangLayout({ children, params }: LayoutProps) {
  const { lang } = await params;

  // Validate language
  if (!SUPPORTED_LANGUAGES.includes(lang as Language)) {
    notFound();
  }

  const language = lang as Language;
  
  // Fetch branding settings for logo and favicon
  const branding = await getBrandingSettings();

  return (
    <html lang={language} className={outfit.variable}>
      <head>
        {branding.favicon_url && (
          <>
            <link rel="icon" href={branding.favicon_url} />
            <link rel="shortcut icon" href={branding.favicon_url} />
            <link rel="apple-touch-icon" href={branding.favicon_url} />
          </>
        )}
      </head>
      <body className={`${outfit.className} antialiased`}>
        <LanguageProvider initialLang={language}>
          <WishlistProvider>
            <VisitorTracker />
            <div className="flex min-h-screen flex-col">
              <Header logoUrl={branding.logo_url} />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </WishlistProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

