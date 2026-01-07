'use client';

import { useWishlist } from '@/lib/contexts/WishlistContext';
import { Container } from '@/components/layout/Container';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { useParams } from 'next/navigation';
import { Language } from '@/types';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const params = useParams();
  const lang = (params?.lang as Language) || 'en';

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="mt-2 text-gray-600">Save your favorite tours for later</p>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center rounded-lg bg-white py-20 shadow-sm">
            <svg
              className="h-20 w-20 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Your wishlist is empty
            </h2>
            <p className="mt-2 text-gray-500">
              Start adding tours to your wishlist to save them for later
            </p>
            <Link
              href={`/${lang}/tours`}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Explore Tours
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="mt-2 text-gray-600">
              {wishlist.length} {wishlist.length === 1 ? 'tour' : 'tours'} saved
            </p>
          </div>
          {wishlist.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear your entire wishlist?')) {
                  clearWishlist();
                }
              }}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Wishlist Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlist.map((item) => (
            <div
              key={item.tourId}
              className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
            >
              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeFromWishlist(item.tourId);
                }}
                className="absolute right-2 top-2 z-10 flex items-center justify-center rounded-full bg-white/90 p-2 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-white hover:scale-110"
                aria-label="Remove from wishlist"
              >
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              <Link href={`/${lang}/tours/${item.tourSlug}`}>
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.tourTitle}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                      <svg
                        className="h-16 w-16 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  {/* Title */}
                  <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#0033FF]">
                    {item.tourTitle}
                  </h3>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Price */}
                  {item.minPrice && item.minPrice > 0 && (
                    <div className="mt-3 flex items-center gap-1">
                      <span className="text-xs text-gray-500">From</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(item.minPrice, item.currency || 'THB')}
                      </span>
                    </div>
                  )}

                  {/* View Details Button */}
                  <button className="mt-3 w-full rounded-lg bg-gray-900 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800">
                    View Details
                  </button>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <Link
            href={`/${lang}/tours`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Continue Exploring Tours
          </Link>
        </div>
      </Container>
    </div>
  );
}




