'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  TourTitleSection,
  ImagesSection,
  DescriptionSection,
  PackagesSection,
  ItinerarySection,
  VideoSection,
  GoogleReviewsSection,
  SafetyInfoSection,
  NeedHelpSection,
} from './sections';
import type { TourWithSettings, TourPackage, MainMedia, GoogleReview } from '@/types';

interface TourEditorProps {
  tourId: string;
  tourNumber?: string;
  initialTour: TourWithSettings | null;
}

interface Message {
  type: 'success' | 'error';
  text: string;
}

type TabId = 'title' | 'images' | 'description' | 'packages' | 'itinerary' | 'video' | 'reviews' | 'safety' | 'help';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'title',
    label: 'Title & Status',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
      </svg>
    ),
  },
  {
    id: 'images',
    label: 'Images',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    id: 'description',
    label: 'Description',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
      </svg>
    ),
  },
  {
    id: 'packages',
    label: 'Packages',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
  {
    id: 'itinerary',
    label: 'Itinerary',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
  },
  {
    id: 'video',
    label: 'Video',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
      </svg>
    ),
  },
  {
    id: 'reviews',
    label: 'Google Reviews',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    id: 'safety',
    label: 'Safety Info',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    id: 'help',
    label: 'Need Help',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
  },
];

export function TourEditor({ tourId, tourNumber, initialTour }: TourEditorProps) {
  const router = useRouter();
  const [tour, setTour] = useState<TourWithSettings | null>(initialTour);
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [safetyItems, setSafetyItems] = useState<string[]>([]);
  const [safetyRestrictions, setSafetyRestrictions] = useState<string[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [message, setMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('title');

  // Fetch tour data
  const fetchTourData = useCallback(async () => {
    try {
      // Fetch tour details
      const tourRes = await fetch(`/api/admin/tours/${tourId}`);
      const tourData = await tourRes.json();

      if (tourData.success && tourData.tour) {
        setTour(tourData.tour);

        // Extract hero block data
        const heroBlock = tourData.tour.blocks?.find(
          (b: { block_type: string }) => b.block_type === 'hero'
        );
        if (heroBlock) {
          setHeroTitle(heroBlock.title || '');
          setHeroSubtitle(heroBlock.content?.subtitle || '');
          setHeroDescription(heroBlock.content?.description || '');
        }

        // Extract safety block data
        const safetyBlock = tourData.tour.blocks?.find(
          (b: { block_type: string }) => b.block_type === 'safety_info'
        );
        if (safetyBlock) {
          setSafetyItems(safetyBlock.content?.items || []);
          setSafetyRestrictions(safetyBlock.content?.restrictions || []);
        }
      }

      // Fetch packages
      const packagesRes = await fetch(`/api/admin/tours/${tourId}/packages`);
      const packagesData = await packagesRes.json();
      if (packagesData.success) {
        setPackages(packagesData.packages || []);
      }
    } catch (error) {
      console.error('Error fetching tour data:', error);
      showMessage('error', 'Failed to load tour data');
    } finally {
      setIsLoading(false);
    }
  }, [tourId]);

  useEffect(() => {
    fetchTourData();
  }, [fetchTourData]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleTourUpdate = (updates: Partial<TourWithSettings>) => {
    if (tour) {
      setTour({ ...tour, ...updates });
    }
  };

  const handleDuplicate = async () => {
    if (!tour) return;
    
    setIsDuplicating(true);
    try {
      const res = await fetch(`/api/admin/tours/${tourId}/duplicate`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success && data.tour) {
        showMessage('success', 'Tour duplicated successfully');
        // Navigate to the new tour
        setTimeout(() => {
          router.push(`/admin/tours/${data.tour.id}`);
        }, 1000);
      } else {
        showMessage('error', data.error || 'Failed to duplicate tour');
      }
    } catch {
      showMessage('error', 'An error occurred while duplicating');
    } finally {
      setIsDuplicating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading tour data...
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="mx-auto max-w-[1300px]">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <h3 className="mt-3 text-lg font-semibold text-red-800">Tour Not Found</h3>
          <p className="mt-1 text-sm text-red-600">The tour you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => router.push('/admin/tours')}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Back to Tours
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'title':
        return (
          <TourTitleSection
            tourId={tourId}
            title={heroTitle}
            slug={tour.slug}
            status={tour.status}
            initialTags={(tour as unknown as { tags?: string[] }).tags || []}
            onUpdate={(data) => {
              if (data.title) setHeroTitle(data.title);
              handleTourUpdate(data);
            }}
            onMessage={showMessage}
          />
        );
      case 'images':
        return (
          <ImagesSection
            tourId={tourId}
            enabled={tour.images_enabled ?? true}
            heroBackgroundImage={tour.hero_background_image}
            featuredImages={tour.featured_images || []}
            mainMedia={(tour.main_media || []) as MainMedia[]}
            additionalPhotos={tour.additional_photos || []}
            onUpdate={handleTourUpdate}
            onMessage={showMessage}
          />
        );
      case 'description':
        return (
          <DescriptionSection
            tourId={tourId}
            enabled={tour.description_enabled ?? true}
            subtitle={heroSubtitle}
            description={heroDescription}
            onUpdate={(data) => {
              if (data.subtitle !== undefined) setHeroSubtitle(data.subtitle);
              if (data.description !== undefined) setHeroDescription(data.description);
              handleTourUpdate(data);
            }}
            onMessage={showMessage}
          />
        );
      case 'packages':
        return (
          <PackagesSection
            tourId={tourId}
            enabled={tour.packages_enabled ?? true}
            packages={packages}
            onUpdate={(data) => {
              if (data.packages) setPackages(data.packages);
              handleTourUpdate(data);
            }}
            onMessage={showMessage}
          />
        );
      case 'itinerary':
        return (
          <ItinerarySection
            tourId={tourId}
            enabled={tour.itinerary_enabled ?? true}
            title={tour.itinerary_title || 'Itinerary'}
            images={tour.itinerary_images || []}
            onUpdate={handleTourUpdate}
            onMessage={showMessage}
          />
        );
      case 'video':
        return (
          <VideoSection
            tourId={tourId}
            enabled={tour.video_enabled ?? false}
            title={tour.video_section_title || 'Video'}
            embedCode={tour.video_embed_code}
            onUpdate={handleTourUpdate}
            onMessage={showMessage}
          />
        );
      case 'reviews':
        return (
          <GoogleReviewsSection
            tourId={tourId}
            enabled={tour.google_reviews_enabled ?? true}
            reviews={(tour.google_reviews || []) as GoogleReview[]}
            rating={tour.google_rating}
            reviewCount={tour.google_review_count}
            onUpdate={handleTourUpdate}
            onMessage={showMessage}
          />
        );
      case 'safety':
        return (
          <SafetyInfoSection
            tourId={tourId}
            enabled={tour.safety_info_enabled ?? true}
            items={safetyItems}
            restrictions={safetyRestrictions}
            onUpdate={(data) => {
              if (data.items) setSafetyItems(data.items);
              if (data.restrictions) setSafetyRestrictions(data.restrictions);
              handleTourUpdate(data);
            }}
            onMessage={showMessage}
          />
        );
      case 'help':
        return (
          <NeedHelpSection
            tourId={tourId}
            enabled={tour.need_help_enabled ?? true}
            onUpdate={handleTourUpdate}
            onMessage={showMessage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-[1300px]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/tours')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {tour.tour_number && <span className="text-gray-500">#{tour.tour_number} · </span>}
              {heroTitle || 'Edit Tour'}
            </h1>
            <p className="text-sm text-gray-500">Configure all tour settings</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Preview Button */}
          <a
            href={`/en/tours/${tour.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Preview
          </a>

          {/* Duplicate Button */}
          <button
            onClick={handleDuplicate}
            disabled={isDuplicating}
            className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {isDuplicating ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Duplicating...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                </svg>
                Duplicate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div
          className={`fixed right-6 top-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
            message.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {message.type === 'success' ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          )}
          {message.text}
        </div>
      )}

      {/* Main Content with Sidebar Tabs */}
      <div className="flex gap-6 rounded-xl border border-gray-200 bg-white">
        {/* Sidebar Navigation */}
        <div className="w-56 shrink-0 border-r border-gray-200 p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              // Get toggle state for badge
              let isEnabled = true;
              switch (tab.id) {
                case 'images': isEnabled = tour.images_enabled ?? true; break;
                case 'description': isEnabled = tour.description_enabled ?? true; break;
                case 'packages': isEnabled = tour.packages_enabled ?? true; break;
                case 'itinerary': isEnabled = tour.itinerary_enabled ?? true; break;
                case 'video': isEnabled = tour.video_enabled ?? false; break;
                case 'reviews': isEnabled = tour.google_reviews_enabled ?? true; break;
                case 'safety': isEnabled = tour.safety_info_enabled ?? true; break;
                case 'help': isEnabled = tour.need_help_enabled ?? true; break;
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-gray-400'}>{tab.icon}</span>
                  <span className="flex-1">{tab.label}</span>
                  {tab.id !== 'title' && (
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isEnabled
                          ? isActive ? 'bg-emerald-400' : 'bg-emerald-500'
                          : isActive ? 'bg-gray-500' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
