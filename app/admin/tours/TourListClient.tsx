'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Tour, TourCategory, SpecialLabel } from '@/types';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { formatCurrency } from '@/lib/utils';

interface TourListClientProps {
  initialTours: any[];
}

type SortOption = 'default' | 'a-z' | 'z-a' | 'price-low' | 'price-high' | 'newest' | 'oldest';

export function TourListClient({ initialTours }: TourListClientProps) {
  const router = useRouter();
  const [tours, setTours] = useState(initialTours);
  const [filteredTours, setFilteredTours] = useState(initialTours);
  const [categories, setCategories] = useState<TourCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [statusTarget, setStatusTarget] = useState<{ tour: any; newStatus: string } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter and sort tours when category or sort option changes
  useEffect(() => {
    let filtered = tours;
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = tours.filter(tour => 
        tour.categories?.some((cat: TourCategory) => cat.id === selectedCategory)
      );
    }
    
    // Apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case 'a-z':
        sorted.sort((a, b) => {
          const titleA = getHeroTitle(a).toLowerCase();
          const titleB = getHeroTitle(b).toLowerCase();
          return titleA.localeCompare(titleB);
        });
        break;
      case 'z-a':
        sorted.sort((a, b) => {
          const titleA = getHeroTitle(a).toLowerCase();
          const titleB = getHeroTitle(b).toLowerCase();
          return titleB.localeCompare(titleA);
        });
        break;
      case 'price-low':
        sorted.sort((a, b) => {
          const priceA = getMinPrice(a).price;
          const priceB = getMinPrice(b).price;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        sorted.sort((a, b) => {
          const priceA = getMinPrice(a).price;
          const priceB = getMinPrice(b).price;
          return priceB - priceA;
        });
        break;
      case 'newest':
        sorted.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        break;
      case 'oldest':
        sorted.sort((a, b) => {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
        break;
      default:
        // Keep original order
        break;
    }
    
    setFilteredTours(sorted);
  }, [selectedCategory, sortBy, tours]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDeleteClick = (tour: Tour) => {
    setDeleteTarget(tour);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/tours/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setTours(tours.filter(t => t.id !== deleteTarget.id));
        setDeleteTarget(null);
        router.refresh();
      } else {
        setError(data.error || 'Failed to delete tour');
      }
    } catch (err) {
      setError('An error occurred while deleting');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = (tour: Tour, newStatus: string) => {
    setStatusTarget({ tour, newStatus });
  };

  const handleStatusConfirm = async () => {
    if (!statusTarget) return;

    setIsUpdatingStatus(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/tours/${statusTarget.tour.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusTarget.newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setTours(tours.map(t => 
          t.id === statusTarget.tour.id 
            ? { ...t, status: statusTarget.newStatus as Tour['status'] }
            : t
        ));
        setStatusTarget(null);
        router.refresh();
      } else {
        setError(data.error || 'Failed to update status');
      }
    } catch (err) {
      setError('An error occurred while updating');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publish';
      case 'draft': return 'Unpublish';
      case 'archived': return 'Archive';
      default: return status;
    }
  };

  const getStatusMessage = (tour: Tour, newStatus: string) => {
    switch (newStatus) {
      case 'published':
        return `Are you sure you want to publish "${tour.slug}"? It will become visible to customers.`;
      case 'draft':
        return `Are you sure you want to unpublish "${tour.slug}"? It will no longer be visible to customers.`;
      case 'archived':
        return `Are you sure you want to archive "${tour.slug}"? It will be hidden from the tours list.`;
      default:
        return `Change status of "${tour.slug}" to ${newStatus}?`;
    }
  };

  // Get hero image from tour blocks
  const getHeroImage = (tour: any): string => {
    const heroBlock = tour.blocks?.find((block: any) => block.block_type === 'hero');
    const imageUrl = heroBlock?.config?.imageUrl;
    return imageUrl || '/placeholder-tour.jpg';
  };

  // Get hero title from tour blocks
  const getHeroTitle = (tour: any): string => {
    const heroBlock = tour.blocks?.find((block: any) => block.block_type === 'hero');
    const translation = heroBlock?.translations?.find((t: any) => t.language === 'en');
    return translation?.title || tour.slug;
  };

  // Get hero content (duration, rating, etc.)
  const getHeroContent = (tour: any) => {
    const heroBlock = tour.blocks?.find((block: any) => block.block_type === 'hero');
    return heroBlock?.config || {};
  };

  // Get minimum price from pricing
  const getMinPrice = (tour: any): { price: number; currency: string } => {
    const pricing = tour.pricing;
    if (!pricing) return { price: 0, currency: 'THB' };
    
    const currency = pricing.currency || 'THB';
    
    if (pricing.type === 'flat_per_person') {
      return { price: pricing.retail_price, currency };
    }
    
    if (pricing.type === 'adult_child') {
      return { price: Math.min(pricing.adult_retail_price, pricing.child_retail_price), currency };
    }
    
    if (pricing.type === 'seat_based' && pricing.seats?.length > 0) {
      const minSeatPrice = Math.min(...pricing.seats.map((s: any) => s.retail_price));
      return { price: minSeatPrice, currency };
    }
    
    return { price: 0, currency };
  };

  // Generate mock rating data based on tour id for consistency (same as frontend)
  const getMockRating = (tourId: string) => {
    const hash = tourId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = 4.0 + (hash % 10) / 10;
    const reviewCount = 500 + (hash % 15000);
    return { rating: Math.round(rating * 10) / 10, reviewCount };
  };

  const handleDuplicate = async (tour: any) => {
    setDuplicatingId(tour.id);
    setError('');
    
    try {
      const response = await fetch(`/api/admin/tours/${tour.id}/duplicate`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success && data.tour) {
        setSuccessMessage(`Tour "${tour.slug}" duplicated successfully`);
        setTimeout(() => setSuccessMessage(''), 3000);
        router.refresh();
      } else {
        setError(data.error || 'Failed to duplicate tour');
      }
    } catch {
      setError('An error occurred while duplicating');
    } finally {
      setDuplicatingId(null);
    }
  };

  if (filteredTours.length === 0 && selectedCategory !== 'all') {
    return (
      <>
        {/* Filters Section */}
        <div className="mb-6 space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Tours ({tours.length})
            </button>
            {categories.map((category) => {
              const count = tours.filter(tour => 
                tour.categories?.some((cat: TourCategory) => cat.id === category.id)
              ).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSortBy('a-z')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  sortBy === 'a-z'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                A → Z
              </button>
              <button
                onClick={() => setSortBy('z-a')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  sortBy === 'z-a'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Z → A
              </button>
              <button
                onClick={() => setSortBy('price-low')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  sortBy === 'price-low'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Price: Low → High
              </button>
              <button
                onClick={() => setSortBy('price-high')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  sortBy === 'price-high'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Price: High → Low
              </button>
              <button
                onClick={() => setSortBy('newest')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  sortBy === 'newest'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Newest First
              </button>
              <button
                onClick={() => setSortBy('oldest')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  sortBy === 'oldest'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Oldest First
              </button>
              {sortBy !== 'default' && (
                <button
                  onClick={() => setSortBy('default')}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Clear Sort
                </button>
              )}
            </div>
          </div>
        </div>

        {/* No tours in this category */}
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No tours in this category</h3>
          <p className="mt-2 text-gray-500">Try selecting a different category.</p>
        </div>
      </>
    );
  }

  if (tours.length === 0) {
    return (
      <div className="rounded-xl bg-white p-12 text-center shadow-sm">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No tours yet</h3>
        <p className="mt-2 text-gray-500">Get started by creating your first tour.</p>
        <Link
          href="/admin/tours/new"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Tour
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button 
            onClick={() => setError('')}
            className="ml-2 font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {/* Filters Section */}
      <div className="mb-6 space-y-4">
        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Tours ({tours.length})
          </button>
          {categories.map((category) => {
            const count = tours.filter(tour => 
              tour.categories?.some((cat: TourCategory) => cat.id === category.id)
            ).length;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSortBy('a-z')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                sortBy === 'a-z'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              A → Z
            </button>
            <button
              onClick={() => setSortBy('z-a')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                sortBy === 'z-a'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Z → A
            </button>
            <button
              onClick={() => setSortBy('price-low')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                sortBy === 'price-low'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Price: Low → High
            </button>
            <button
              onClick={() => setSortBy('price-high')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                sortBy === 'price-high'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Price: High → Low
            </button>
            <button
              onClick={() => setSortBy('newest')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                sortBy === 'newest'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Newest First
            </button>
            <button
              onClick={() => setSortBy('oldest')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                sortBy === 'oldest'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Oldest First
            </button>
            {sortBy !== 'default' && (
              <button
                onClick={() => setSortBy('default')}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Clear Sort
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tours Grid - Auto-fill with max card width matching frontend */}
      <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(min(290px,100%),1fr))]">
        {filteredTours.map((tour) => {
          const imageUrl = getHeroImage(tour);
          const heroTitle = getHeroTitle(tour);
          const heroContent = getHeroContent(tour);
          const { price: minPrice, currency } = getMinPrice(tour);
          const { rating, reviewCount } = heroContent?.rating 
            ? { rating: heroContent.rating, reviewCount: heroContent.reviewCount || 0 }
            : getMockRating(tour.id);
          const duration = heroContent?.duration;
          
          const categories = (tour.categories || []) as TourCategory[];
          const specialLabels = (tour.specialLabels || []) as SpecialLabel[];
          const tags = (tour.tags || []) as string[];
          
          const categoryName = categories.length > 0 ? categories[0].name : 'Tours';
          const primaryLabel = specialLabels.length > 0 ? specialLabels[0] : null;

          return (
            <div
              key={tour.id}
              className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
            >
              {/* Clickable Card Area - Goes to Edit Page */}
              <Link href={`/admin/tours/${tour.tour_number || tour.id}`}>
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={heroTitle}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                  
                  {/* Special Label Corner Badge (same as frontend) */}
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

                  {/* Status Dot - Top Right (instead of wishlist) */}
                  <div className="absolute right-2 top-2 z-10">
                    <div
                      className={`h-3 w-3 rounded-full shadow-md ${
                        tour.status === 'published'
                          ? 'bg-green-500'
                          : tour.status === 'draft'
                          ? 'bg-gray-400'
                          : 'bg-red-500'
                      }`}
                      title={tour.status.charAt(0).toUpperCase() + tour.status.slice(1)}
                    />
                  </div>
                </div>

                {/* Content - EXACT MATCH to frontend */}
                <div className="flex flex-1 flex-col p-4">
                  {/* Tour Number / Category / Duration */}
                  <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                    {tour.tour_number && (
                      <>
                        <span className="font-semibold text-gray-700">#{tour.tour_number}</span>
                        <span>•</span>
                      </>
                    )}
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
                    {heroTitle}
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

                  {/* Price and Rating Row - EXACT MATCH to frontend */}
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

              {/* Admin Action Buttons - Bottom of Card */}
              <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
                <div className="flex items-center justify-between gap-2">
                  {/* View on site */}
                  {tour.status === 'published' && (
                    <a
                      href={`/en/tours/${tour.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-white hover:text-blue-600 transition-colors"
                      title="View on site"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                      View
                    </a>
                  )}

                  <div className="flex items-center gap-1 ml-auto">
                    {/* Duplicate */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDuplicate(tour);
                      }}
                      disabled={duplicatingId === tour.id}
                      className="rounded-lg p-1.5 text-gray-500 hover:bg-white hover:text-gray-700 disabled:opacity-50 transition-colors"
                      title="Duplicate tour"
                    >
                      {duplicatingId === tour.id ? (
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                        </svg>
                      )}
                    </button>

                    {/* More Actions Dropdown */}
                    <div className="relative group/menu">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-white hover:text-gray-700 transition-colors"
                        title="More actions"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                        </svg>
                      </button>
                      <div className="absolute right-0 bottom-full z-20 mb-1 hidden w-40 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 group-hover/menu:block">
                        {tour.status !== 'published' && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleStatusChange(tour, 'published');
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Publish
                          </button>
                        )}
                        {tour.status !== 'draft' && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleStatusChange(tour, 'draft');
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                            </svg>
                            Unpublish
                          </button>
                        )}
                        {tour.status !== 'archived' && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleStatusChange(tour, 'archived');
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                            Archive
                          </button>
                        )}
                        <hr className="my-1" />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteClick(tour);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Tour"
        message={`Are you sure you want to delete "${deleteTarget?.slug}"? This action cannot be undone. All blocks, availability, and upsells will be permanently removed.`}
        confirmText="Yes, Delete Tour"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Status Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleStatusConfirm}
        title={`${getStatusLabel(statusTarget?.newStatus || '')} Tour`}
        message={statusTarget ? getStatusMessage(statusTarget.tour, statusTarget.newStatus) : ''}
        confirmText={`Yes, ${getStatusLabel(statusTarget?.newStatus || '')}`}
        cancelText="Cancel"
        variant={statusTarget?.newStatus === 'archived' ? 'warning' : 'info'}
        isLoading={isUpdatingStatus}
      />
    </>
  );
}

