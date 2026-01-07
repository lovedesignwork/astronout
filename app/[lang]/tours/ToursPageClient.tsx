'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { Language, PricingConfig, SpecialLabel } from '@/types';
import { WishlistButton } from '@/components/tour/WishlistButton';

interface Tour {
  id: string;
  slug: string;
  heroTitle: string;
  heroContent?: {
    imageUrl?: string;
    duration?: string;
    rating?: number;
    reviewCount?: number;
  };
  pricing: PricingConfig | null;
  categories?: { name: string }[];
  specialLabels?: SpecialLabel[];
  tags?: string[];
}

interface ToursPageClientProps {
  tours: Tour[];
  language: Language;
}

// Generate mock rating data based on tour id for consistency
function getMockRating(tourId: string) {
  const hash = tourId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rating = 4.0 + (hash % 10) / 10; // Rating between 4.0 and 4.9
  const reviewCount = 500 + (hash % 15000); // Reviews between 500 and 15500
  return { rating: Math.round(rating * 10) / 10, reviewCount };
}

// Extract minimum price from pricing config
function getMinPrice(pricing: PricingConfig | null): { price: number; currency: string } {
  if (!pricing) return { price: 0, currency: 'THB' };
  
  const currency = pricing.currency || 'THB';
  
  if (pricing.type === 'flat_per_person') {
    return { price: pricing.retail_price, currency };
  }
  
  if (pricing.type === 'adult_child') {
    return { price: Math.min(pricing.adult_retail_price, pricing.child_retail_price), currency };
  }
  
  if (pricing.type === 'seat_based' && pricing.seats?.length > 0) {
    const minSeatPrice = Math.min(...pricing.seats.map(s => s.retail_price));
    return { price: minSeatPrice, currency };
  }
  
  return { price: 0, currency };
}

export function ToursPageClient({ tours, language }: ToursPageClientProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tours.map((tour) => {
        const imageUrl = tour.heroContent?.imageUrl || '/placeholder-tour.jpg';
        const { price: minPrice, currency } = getMinPrice(tour.pricing);
        const { rating, reviewCount } = tour.heroContent?.rating 
          ? { rating: tour.heroContent.rating, reviewCount: tour.heroContent.reviewCount || 0 }
          : getMockRating(tour.id);
        const duration = tour.heroContent?.duration;
        
        const categories = (tour.categories || []) as { name: string }[];
        const specialLabels = (tour.specialLabels || []) as SpecialLabel[];
        const tags = (tour.tags || []) as string[];
        
        const categoryName = categories.length > 0 ? categories[0].name : 'Tours';
        const primaryLabel = specialLabels.length > 0 ? specialLabels[0] : null;

        return (
          <div
            key={tour.id}
            className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
          >
            <Link href={`/${language}/tours/${tour.slug}`}>
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={tour.heroTitle}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                
                {/* Special Label Corner Badge */}
                {primaryLabel && (
                  <div
                    className="absolute left-2 top-2 px-3 py-1 text-xs font-semibold shadow-sm z-10 rounded-lg"
                    style={{
                      backgroundColor: primaryLabel.background_color,
                      color: primaryLabel.text_color,
                    }}
                  >
                    {primaryLabel.name}
                  </div>
                )}

                {/* Wishlist Button - Top Right */}
                <div className="absolute right-2 top-2 z-10">
                  <WishlistButton
                    tourId={tour.id}
                    tourSlug={tour.slug}
                    tourTitle={tour.heroTitle}
                    imageUrl={imageUrl}
                    minPrice={minPrice}
                    currency={currency}
                    variant="icon-only"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-4">
                {/* Category / Duration */}
                <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-medium">{categoryName}</span>
                  {duration && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {duration}
                      </span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 transition-colors tour-card-title group-hover:text-[#0033FF]">
                  {tour.heroTitle}
                </h3>

                {/* Tags (Regular Labels) */}
                {tags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Spacer to push price to bottom */}
                <div className="flex-1" />

                {/* Price and Rating Row */}
                <div className="flex items-center justify-between">
                  {/* Price */}
                  {minPrice > 0 ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">From</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(minPrice, currency)}
                      </span>
                    </div>
                  ) : (
                    <div />
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-1 text-xs">
                    <svg className="h-3.5 w-3.5 fill-current" style={{ color: '#0033FF' }} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
                    <span className="text-gray-400">({reviewCount.toLocaleString()})</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}

