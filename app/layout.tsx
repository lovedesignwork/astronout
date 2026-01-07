import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Astronout - Tour Booking Platform',
    template: '%s | Astronout',
  },
  description: 'Book unforgettable tour experiences with Astronout',
  keywords: ['tours', 'travel', 'booking', 'Phuket', 'Thailand'],
  authors: [{ name: 'Astronout' }],
  creator: 'Astronout',
  publisher: 'Astronout',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Astronout',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
