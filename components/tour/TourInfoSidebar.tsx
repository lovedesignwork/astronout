'use client';

import React, { useState, useEffect } from 'react';
import type { TourBlockWithTranslation } from '@/types';

interface TourInfoSidebarProps {
  highlightsBlock?: TourBlockWithTranslation;
  includedExcludedBlock?: TourBlockWithTranslation;
  safetyInfoBlock?: TourBlockWithTranslation;
  termsBlock?: TourBlockWithTranslation;
  // New props for additional sidebar sections
  itineraryImage?: string;
  videoEmbed?: string; // YouTube or Vimeo embed URL
  googleRating?: {
    rating: number;
    reviewCount: number;
    reviews?: {
      author: string;
      rating: number;
      text: string;
      date: string;
      avatarUrl?: string;
    }[];
  };
}

interface HighlightsContent {
  highlights?: string[];
}

interface IncludedExcludedContent {
  included?: string[];
  excluded?: string[];
}

interface SafetyInfoContent {
  guidelines?: string[];
  restrictions?: string[];
}

interface TermsContent {
  cancellation_policy?: string;
  refund_policy?: string;
}

// Mockup data for demonstration
const MOCKUP_ITINERARY_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80';
const MOCKUP_VIDEO_EMBED = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
const MOCKUP_GOOGLE_RATING = {
  rating: 4.8,
  reviewCount: 324,
  reviews: [
    {
      author: 'John D.',
      rating: 5,
      text: 'Amazing experience! The guides were professional and the views were breathtaking. Highly recommend!',
      date: '2 weeks ago',
      avatarUrl: 'https://ui-avatars.com/api/?name=John+D&background=random',
    },
    {
      author: 'Sarah M.',
      rating: 5,
      text: 'Best adventure activity in Phuket! The safety equipment was top-notch and staff were very friendly.',
      date: '1 month ago',
      avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+M&background=random',
    },
    {
      author: 'Mike T.',
      rating: 4,
      text: 'Great fun for the whole family. Kids loved it! Would definitely do it again.',
      date: '1 month ago',
      avatarUrl: 'https://ui-avatars.com/api/?name=Mike+T&background=random',
    },
    {
      author: 'Emma L.',
      rating: 5,
      text: 'Unforgettable adventure! The zipline course was thrilling and the jungle views were spectacular.',
      date: '2 months ago',
      avatarUrl: 'https://ui-avatars.com/api/?name=Emma+L&background=random',
    },
    {
      author: 'David K.',
      rating: 5,
      text: 'Perfect day out! Professional staff, amazing scenery, and well-organized tour. 10/10!',
      date: '2 months ago',
      avatarUrl: 'https://ui-avatars.com/api/?name=David+K&background=random',
    },
    {
      author: 'Lisa W.',
      rating: 4,
      text: 'Such a fun experience! The guides made everyone feel safe and comfortable throughout.',
      date: '3 months ago',
      avatarUrl: 'https://ui-avatars.com/api/?name=Lisa+W&background=random',
    },
    {
      author: 'James R.',
      rating: 5,
      text: 'Bucket list item checked! The adrenaline rush was incredible. Must-do in Phuket!',
      date: '3 months ago',
      avatarUrl: 'https://ui-avatars.com/api/?name=James+R&background=random',
    },
    {
      author: 'Anna P.',
      rating: 5,
      text: 'Exceeded all expectations! Beautiful location, friendly team, and so much fun.',
      date: '4 months ago',
      avatarUrl: 'https://ui-avatars.com/api/?name=Anna+P&background=random',
    },
    {
      author: 'Chris B.',
      rating: 4,
      text: 'Great value for money. The whole experience was well worth it. Highly recommended!',
      date: '4 months ago',
      avatarUrl: 'https://ui-avatars.com/api/?name=Chris+B&background=random',
    },
  ],
};

// Google Reviews Slider Component
function GoogleReviewsSlider({ 
  googleRating, 
  renderStars,
  currentReviewIndex,
  setCurrentReviewIndex,
}: { 
  googleRating: {
    rating: number;
    reviewCount: number;
    reviews?: { author: string; rating: number; text: string; date: string; avatarUrl?: string }[];
  };
  renderStars: (rating: number, size?: 'sm' | 'md') => React.JSX.Element;
  currentReviewIndex: number;
  setCurrentReviewIndex: (index: number | ((prev: number) => number)) => void;
}) {
  // Limit to maximum 9 reviews
  const reviews = googleRating.reviews?.slice(0, 9) || [];
  const totalReviews = reviews.length;

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (totalReviews <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev: number) => (prev + 1) % totalReviews);
    }, 5000);

    return () => clearInterval(interval);
  }, [totalReviews, setCurrentReviewIndex]);

  const currentReview = reviews[currentReviewIndex];

  const goToReview = (index: number) => {
    setCurrentReviewIndex(index);
  };

  const goToPrevious = () => {
    setCurrentReviewIndex((prev: number) => (prev - 1 + totalReviews) % totalReviews);
  };

  const goToNext = () => {
    setCurrentReviewIndex((prev: number) => (prev + 1) % totalReviews);
  };

  if (!googleRating) return null;

  return (
    <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: 'rgba(184, 228, 255, 1)', border: 'none' }}>
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold" style={{ fontSize: '18px', color: 'rgba(51, 51, 51, 1)' }}>
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google Reviews
      </h3>
      
      {/* Overall Rating */}
      <div className="mb-4 flex items-center gap-4 rounded-xl bg-gray-50 p-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900">{googleRating.rating}</div>
          <div className="mt-1">{renderStars(googleRating.rating)}</div>
        </div>
        <div className="border-l border-gray-200 pl-4">
          <div className="text-sm text-gray-600">Based on</div>
          <div className="text-lg font-semibold text-gray-900">{googleRating.reviewCount} reviews</div>
        </div>
      </div>

      {/* Single Review Slider */}
      {currentReview && (
        <div className="relative">
          {/* Review Card */}
          <div className="min-h-[140px] rounded-xl border border-gray-100 bg-neutral-50 p-4" style={{ backgroundColor: '#fafafa' }}>
            <div className="flex items-start gap-3">
              {currentReview.avatarUrl ? (
                <img
                  src={currentReview.avatarUrl}
                  alt={currentReview.author}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                  {currentReview.author.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">{currentReview.author}</span>
                  <span className="text-xs text-gray-400">{currentReview.date}</span>
                </div>
                <div className="mt-1">{renderStars(currentReview.rating, 'sm')}</div>
                <p className="mt-2 h-[5.5rem] text-sm leading-relaxed text-gray-600 line-clamp-4">{currentReview.text}</p>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          {totalReviews > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute -left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200 bg-white shadow-md transition-all hover:bg-gray-50 hover:shadow-lg"
              >
                <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute -right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200 bg-white shadow-md transition-all hover:bg-gray-50 hover:shadow-lg"
              >
                <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}

      {/* Dot Indicators */}
      {totalReviews > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => goToReview(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentReviewIndex 
                  ? 'w-6 bg-[#008EE6]' 
                  : 'w-2 bg-white hover:bg-gray-100'
              }`}
            />
          ))}
        </div>
      )}

    </div>
  );
}

export function TourInfoSidebar({
  highlightsBlock,
  includedExcludedBlock,
  safetyInfoBlock,
  termsBlock,
  itineraryImage,
  videoEmbed,
  googleRating,
}: TourInfoSidebarProps) {
  const [expandedTerms, setExpandedTerms] = useState<string | null>(null);
  const [isImageLightboxOpen, setIsImageLightboxOpen] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Handle image download
  const handleDownloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'itinerary-map.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback: open in new tab
      window.open(imageUrl, '_blank');
    }
  };

  const highlightsContent = highlightsBlock?.content as HighlightsContent | undefined;
  const includedExcludedContent = includedExcludedBlock?.content as IncludedExcludedContent | undefined;
  const safetyContent = safetyInfoBlock?.content as SafetyInfoContent | undefined;
  const termsContent = termsBlock?.content as TermsContent | undefined;

  // Use mockup data if props not provided
  const displayItineraryImage = itineraryImage || MOCKUP_ITINERARY_IMAGE;
  const displayVideoEmbed = videoEmbed || MOCKUP_VIDEO_EMBED;
  const displayGoogleRating = googleRating || MOCKUP_GOOGLE_RATING;

  // Helper function to render star rating
  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className={`${starSize} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className={`${starSize} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="halfGrad">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path fill="url(#halfGrad)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className={`${starSize} text-gray-300`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tour Highlights */}
      {highlightsBlock && highlightsContent?.highlights && highlightsContent.highlights.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <svg className="h-5 w-5" style={{ color: '#0033FF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Tour Highlights
          </h3>
          <div className="grid gap-3">
            {highlightsContent.highlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-3 rounded-lg p-3" style={{ backgroundColor: '#e6f0ff' }}>
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: '#0033FF' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Itinerary Image */}
      {displayItineraryImage && (
        <>
          <div className="rounded-2xl p-6" style={{ border: 'none', backgroundColor: 'rgba(214, 239, 255, 1)', boxShadow: 'none' }}>
            <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900" style={{ fontSize: '17px' }}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(51, 51, 51, 1)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Itinerary Map
            </h3>
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={displayItineraryImage}
                alt="Tour Itinerary"
                className="w-full cursor-pointer object-cover transition-all duration-300 max-h-[200px] hover:opacity-90"
                onClick={() => setIsImageLightboxOpen(true)}
              />
              <button
                onClick={() => setIsImageLightboxOpen(true)}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/80"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                View Full
              </button>
            </div>
          </div>

          {/* Image Lightbox Modal */}
          {isImageLightboxOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
              onClick={() => setIsImageLightboxOpen(false)}
            >
              {/* Close button */}
              <button
                className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                onClick={() => setIsImageLightboxOpen(false)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Download button */}
              <button
                className="absolute right-4 top-16 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadImage(displayItineraryImage);
                }}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>

              {/* Image container */}
              <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
                <img
                  src={displayItineraryImage}
                  alt="Tour Itinerary"
                  className="max-h-[90vh] w-auto rounded-lg object-contain"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Video Embed */}
      {displayVideoEmbed && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="rounded-t-2xl px-4 py-2.5" style={{ backgroundColor: 'rgba(214, 239, 255, 1)', color: 'rgba(16, 24, 40, 1)', border: '0px none rgba(0, 0, 0, 0)', boxShadow: 'none' }}>
            <h3 className="flex items-center gap-2 text-base font-bold" style={{ fontSize: '15px' }}>
              <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Watch Video
            </h3>
          </div>
          <div className="relative aspect-video w-full bg-gray-100">
            <iframe
              src={displayVideoEmbed}
              title="Tour Video"
              className="absolute inset-0 h-full w-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Google Rating */}
      <GoogleReviewsSlider 
        googleRating={displayGoogleRating} 
        renderStars={renderStars}
        currentReviewIndex={currentReviewIndex}
        setCurrentReviewIndex={setCurrentReviewIndex}
      />

      {/* Safety Information */}
      {safetyInfoBlock && (safetyContent?.guidelines?.length || safetyContent?.restrictions?.length) && (
        <div className="rounded-2xl border-2 border-gray-300 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Safety Information
          </h3>
          
          <div className="space-y-4">
            {/* Guidelines */}
            {safetyContent?.guidelines && safetyContent.guidelines.length > 0 && (
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="mb-2 text-sm font-semibold text-blue-700">Safety Guidelines</div>
                <ul className="space-y-2">
                  {safetyContent.guidelines.map((guideline, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                      {guideline}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Restrictions */}
            {safetyContent?.restrictions && safetyContent.restrictions.length > 0 && (
              <div className="rounded-lg bg-amber-50 p-4">
                <div className="mb-2 text-sm font-semibold text-amber-700">Restrictions</div>
                <ul className="space-y-2">
                  {safetyContent.restrictions.map((restriction, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-amber-800">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {restriction}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Terms & Conditions */}
      {termsBlock && (termsContent?.cancellation_policy || termsContent?.refund_policy) && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Terms & Conditions</h3>
          
          <div className="space-y-3">
            {/* Cancellation Policy */}
            {termsContent?.cancellation_policy && (
              <div className="rounded-lg border border-gray-200">
                <button
                  onClick={() => setExpandedTerms(expandedTerms === 'cancellation' ? null : 'cancellation')}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <span className="text-sm font-medium text-gray-900">Cancellation Policy</span>
                  <svg
                    className={`h-5 w-5 text-gray-400 transition-transform ${expandedTerms === 'cancellation' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedTerms === 'cancellation' && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-2">
                    <p className="text-sm text-gray-600">{termsContent.cancellation_policy}</p>
                  </div>
                )}
              </div>
            )}

            {/* Refund Policy */}
            {termsContent?.refund_policy && (
              <div className="rounded-lg border border-gray-200">
                <button
                  onClick={() => setExpandedTerms(expandedTerms === 'refund' ? null : 'refund')}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <span className="text-sm font-medium text-gray-900">Refund Policy</span>
                  <svg
                    className={`h-5 w-5 text-gray-400 transition-transform ${expandedTerms === 'refund' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedTerms === 'refund' && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-2">
                    <p className="text-sm text-gray-600">{termsContent.refund_policy}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Need Help Card */}
      <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'rgba(214, 239, 255, 1)' }}>
        <h3 className="mb-2 text-lg font-bold" style={{ color: 'rgb(64, 64, 64)' }}>Need Help?</h3>
        <p className="mb-4 text-base" style={{ color: 'rgb(64, 64, 64)' }}>
          Our team is available 24/7 to assist you with your booking.
        </p>
        <div className="space-y-2">
          <a
            href="tel:+66123456789"
            className="flex items-center gap-2 text-sm font-medium hover:underline"
            style={{ color: 'rgb(64, 64, 64)' }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            +66 123 456 789
          </a>
          <a
            href="mailto:hello@astronout.co"
            className="flex items-center gap-2 text-sm font-medium hover:underline"
            style={{ color: 'rgb(64, 64, 64)' }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            hello@astronout.co
          </a>
        </div>
      </div>
    </div>
  );
}

