'use client';

import Link from 'next/link';
import { Container } from './Container';
import { CategoriesSubHeader } from './CategoriesSubHeader';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useWishlist } from '@/lib/contexts/WishlistContext';

interface HeaderProps {
  logoUrl?: string | null;
}

export function Header({ logoUrl }: HeaderProps = {}) {
  const { language } = useLanguage();
  const { wishlistCount } = useWishlist();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
      <div className="border-b border-gray-100">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href={`/${language}`} className="flex items-center gap-2">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="ASTRONOUT" 
                className="h-10 w-auto object-contain"
              />
            ) : (
              <>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg shadow-md" style={{ background: 'linear-gradient(to bottom right, #0033FF, #0029cc)' }}>
                  <span className="text-lg font-bold text-white">A</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900">
                  ASTRONOUT
                </span>
              </>
            )}
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href={`/${language}/tours`}
              className="text-sm transition-colors"
              style={{ fontWeight: 400, color: 'rgb(55, 65, 81)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#0033FF'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(55, 65, 81)'}
            >
              Tours
            </Link>
            <Link
              href={`/${language}/about`}
              className="text-sm transition-colors"
              style={{ fontWeight: 400, color: 'rgb(55, 65, 81)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#0033FF'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(55, 65, 81)'}
            >
              About
            </Link>
            <Link
              href={`/${language}/contact`}
              className="text-sm transition-colors"
              style={{ fontWeight: 400, color: 'rgb(55, 65, 81)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#0033FF'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(55, 65, 81)'}
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {/* Wishlist Icon */}
            <Link
              href={`/${language}/wishlist`}
              className="relative text-gray-600 transition-colors hover:text-[#0033FF]"
              aria-label="Wishlist"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0033FF] text-xs font-semibold text-white">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            <LanguageSwitcher />
            <Link
              href={`/${language}/tours`}
              className="hidden rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md sm:block"
              style={{ backgroundColor: '#0033FF' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0029cc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0033FF'}
            >
              Book Now
            </Link>
          </div>
        </div>
      </Container>
      </div>
      <CategoriesSubHeader />
    </header>
  );
}

