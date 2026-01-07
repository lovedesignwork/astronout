'use client';

import { useWishlist } from '@/lib/contexts/WishlistContext';
import { useState, useEffect } from 'react';

interface WishlistButtonProps {
  tourId: string;
  tourSlug: string;
  tourTitle: string;
  imageUrl?: string;
  minPrice?: number;
  currency?: string;
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
}

export function WishlistButton({
  tourId,
  tourSlug,
  tourTitle,
  imageUrl,
  minPrice,
  currency,
  variant = 'default',
  className = '',
}: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Check if in wishlist on mount and when wishlist changes
  useEffect(() => {
    setIsFavorited(isInWishlist(tourId));
  }, [tourId, isInWishlist]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavorited) {
      removeFromWishlist(tourId);
      setToastMessage('Removed from wishlist');
    } else {
      addToWishlist({
        tourId,
        tourSlug,
        tourTitle,
        imageUrl,
        minPrice,
        currency,
      });
      setToastMessage('Added to wishlist');
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // Icon-only variant (for tour cards)
  if (variant === 'icon-only') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`group/wishlist flex items-center justify-center transition-all duration-200 hover:scale-110 ${className}`}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg
            className={`h-6 w-6 transition-colors ${
              isFavorited
                ? 'fill-white text-white'
                : 'fill-none text-white'
            }`}
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
        </button>

        {/* Toast notification */}
        {showToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down">
            <div className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
              {toastMessage}
            </div>
          </div>
        )}
      </>
    );
  }

  // Compact variant (for smaller buttons)
  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            isFavorited
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${className}`}
        >
          <svg
            className={`h-4 w-4 ${isFavorited ? 'fill-current' : 'fill-none'}`}
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
          {isFavorited ? 'Saved' : 'Save'}
        </button>

        {showToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down">
            <div className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
              {toastMessage}
            </div>
          </div>
        )}
      </>
    );
  }

  // Default variant (full button)
  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 font-medium transition-all ${
          isFavorited
            ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
        } ${className}`}
      >
        <svg
          className={`h-5 w-5 ${isFavorited ? 'fill-current' : 'fill-none'}`}
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
        {isFavorited ? 'Saved to Wishlist' : 'Add to Wishlist'}
      </button>

      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down">
          <div className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
            {toastMessage}
          </div>
        </div>
      )}
    </>
  );
}

