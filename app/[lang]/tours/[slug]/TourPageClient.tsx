'use client';

import { useEffect } from 'react';
import { BookingProvider, useBookingContext } from '@/lib/contexts/BookingContext';
import { Container } from '@/components/layout/Container';
import { TourGallery } from '@/components/tour/TourGallery';
import { BookingForm } from '@/components/tour/BookingForm';
import { TourDescription } from '@/components/tour/TourDescription';
import { TourInfoSidebar } from '@/components/tour/TourInfoSidebar';
import { WishlistButton } from '@/components/tour/WishlistButton';
import type {
  Tour,
  TourBlockWithTranslation,
  TourPricing,
  UpsellWithTranslation,
  TourAvailability,
  Language,
  TourCategory,
  SpecialLabel,
  PricingConfig,
} from '@/types';

interface TourPageClientProps {
  tour: Tour;
  blocks: TourBlockWithTranslation[];
  pricing: TourPricing | null;
  upsells: UpsellWithTranslation[];
  availability: TourAvailability[];
  language: Language;
  categories?: TourCategory[];
  specialLabels?: SpecialLabel[];
}

interface HeroContent {
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  location?: string;
  duration?: string;
  badges?: string[];
}

interface IncludedExcludedContent {
  included?: string[];
  excluded?: string[];
}

function TourPageContent({
  tour,
  blocks,
  pricing,
  upsells,
  availability,
  language,
  categories = [],
  specialLabels = [],
}: TourPageClientProps) {
  const { setTourData, setAvailability } = useBookingContext();

  useEffect(() => {
    setTourData(tour, pricing, upsells);
    setAvailability(availability);
  }, [tour, pricing, upsells, availability, setTourData, setAvailability]);

  // Get hero block data
  const heroBlock = blocks.find((b) => b.block_type === 'hero');
  const heroContent = heroBlock?.content as HeroContent | undefined;
  const title = heroBlock?.title || tour.slug;

  // Get images from hero content
  const images = heroContent?.images || (heroContent?.imageUrl ? [heroContent.imageUrl] : []);
  
  // Add some placeholder images if we only have one
  const galleryImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
  ];

  // Check if upsells block is enabled (blocks are already filtered by enabled=true in the query)
  const hasUpsellsBlock = blocks.some((b) => b.block_type === 'upsells');

  // Get specific blocks for sidebar
  const highlightsBlock = blocks.find((b) => b.block_type === 'highlights');
  const includedExcludedBlock = blocks.find((b) => b.block_type === 'included_excluded');
  const includedExcludedContent = includedExcludedBlock?.content as IncludedExcludedContent | undefined;
  const safetyInfoBlock = blocks.find((b) => b.block_type === 'safety_info');
  const termsBlock = blocks.find((b) => b.block_type === 'terms');

  // Get the first image for the hero background
  const heroBackgroundImage = galleryImages[0] || '';

  // Calculate minimum price for wishlist
  const getMinPrice = (pricingConfig: TourPricing | null): { price: number; currency: string } => {
    if (!pricingConfig) return { price: 0, currency: 'THB' };
    
    const config = pricingConfig.config as PricingConfig;
    const currency = config.currency || 'THB';
    
    if (config.type === 'flat_per_person') {
      return { price: config.retail_price, currency };
    }
    
    if (config.type === 'adult_child') {
      return { price: Math.min(config.adult_retail_price, config.child_retail_price), currency };
    }
    
    if (config.type === 'seat_based' && config.seats?.length > 0) {
      const minSeatPrice = Math.min(...config.seats.map(s => s.retail_price));
      return { price: minSeatPrice, currency };
    }
    
    return { price: 0, currency };
  };

  const { price: minPrice, currency } = getMinPrice(pricing);

  return (
    <div className="relative bg-gray-50 pb-12">
      {/* Background Image - Extends from top to middle of gallery */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[530px] justify-center overflow-hidden md:h-[580px] lg:h-[620px]">
        {heroBackgroundImage && (
          <div 
            className="h-full w-full max-w-[2000px] bg-cover bg-top bg-no-repeat"
            style={{ backgroundImage: `url(${heroBackgroundImage})` }}
          />
        )}
        
        {/* Left fade overlay */}
        <div className="absolute inset-y-0 left-0 w-[200px] bg-gradient-to-r from-gray-50 to-transparent" />
        
        {/* Right fade overlay */}
        <div className="absolute inset-y-0 right-0 w-[200px] bg-gradient-to-l from-gray-50 to-transparent" />
        
        {/* Bottom gradient overlay - fades to gray-50 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 via-50% to-gray-50" />
      </div>
      
      {/* Hero Content */}
      <div className="relative">
        <Container>
          <div className="flex min-h-[350px] flex-col justify-end pb-10 pt-16">
            {/* Category Breadcrumb */}
            {categories.length > 0 && (
              <div className="mb-2 text-sm text-white/80">
                {categories.map((cat, idx) => (
                  <span key={cat.id}>
                    {idx > 0 && ' • '}
                    {cat.name}
                  </span>
                ))}
              </div>
            )}
            
            {/* Title and Wishlist Button Row */}
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white drop-shadow-lg md:text-5xl">{title}</h1>
                {heroContent?.subtitle && (
                  <p className="mt-3 max-w-2xl text-xl text-white/90 drop-shadow-md">{heroContent.subtitle}</p>
                )}
              </div>
              
              {/* Wishlist Button */}
              <div className="flex-shrink-0">
                <WishlistButton
                  tourId={tour.id}
                  tourSlug={tour.slug}
                  tourTitle={title}
                  imageUrl={heroBackgroundImage}
                  minPrice={minPrice}
                  currency={currency}
                  variant="compact"
                  className="shadow-lg"
                />
              </div>
            </div>
            
            {/* Duration */}
            {heroContent?.duration && (
              <div className="mt-4 flex items-center gap-2 text-sm text-white/90">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{heroContent.duration}</span>
              </div>
            )}
          </div>
        </Container>
      </div>

      <Container>
        {/* Image Gallery */}
        <div className="relative">
          <TourGallery images={galleryImages} title={title} />
        </div>

        {/* Two Column Layout - Booking on Left, Info on Right */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Left Column - Tour Description + Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tour Description - Separate Container */}
            {(heroContent?.description || heroContent?.subtitle) && (
              <TourDescription
                description={heroContent?.subtitle || ''}
                longDescription={heroContent?.description}
              />
            )}
            
            {/* Booking Form */}
            <BookingForm
              pricing={pricing}
              availability={availability}
              upsells={hasUpsellsBlock ? upsells : []}
              language={language}
              tourName={title}
              tourDescription={heroContent?.subtitle}
              includedItems={includedExcludedContent?.included}
            />
          </div>

          {/* Right Column - Tour Info Sidebar (NOT sticky) */}
          <div className="lg:col-span-1">
            <TourInfoSidebar
              highlightsBlock={highlightsBlock}
              includedExcludedBlock={includedExcludedBlock}
              safetyInfoBlock={safetyInfoBlock}
              termsBlock={termsBlock}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}

export function TourPageClient(props: TourPageClientProps) {
  return (
    <BookingProvider>
      <TourPageContent {...props} />
    </BookingProvider>
  );
}
