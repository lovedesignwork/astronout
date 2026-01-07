'use client';

import { useState, useRef } from 'react';
import { ImageUploader, SingleImageUploader } from '@/components/admin/ImageUploader';
import type { MainMedia } from '@/types';

interface ImagesSectionProps {
  tourId: string;
  enabled: boolean;
  heroBackgroundImage: string | null;
  featuredImages: string[];
  mainMedia: MainMedia[];
  additionalPhotos: string[];
  onUpdate: (data: Partial<{
    images_enabled: boolean;
    hero_background_image: string | null;
    featured_images: string[];
    main_media: MainMedia[];
    additional_photos: string[];
  }>) => void;
  onMessage: (type: 'success' | 'error', text: string) => void;
}

export function ImagesSection({
  tourId,
  enabled,
  heroBackgroundImage,
  featuredImages,
  mainMedia,
  additionalPhotos,
  onUpdate,
  onMessage,
}: ImagesSectionProps) {
  const [localHeroImage, setLocalHeroImage] = useState(heroBackgroundImage);
  const [localFeatured, setLocalFeatured] = useState(featuredImages);
  const [localMainMedia, setLocalMainMedia] = useState<MainMedia[]>(mainMedia);
  const [localAdditional, setLocalAdditional] = useState(additionalPhotos);
  const [isSaving, setIsSaving] = useState(false);
  const [activeMainMediaIndex, setActiveMainMediaIndex] = useState<number | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hero_background_image: localHeroImage,
          featured_images: localFeatured,
          main_media: localMainMedia,
          additional_photos: localAdditional,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdate({
          hero_background_image: localHeroImage,
          featured_images: localFeatured,
          main_media: localMainMedia,
          additional_photos: localAdditional,
        });
        onMessage('success', 'Images saved');
      } else {
        onMessage('error', data.error || 'Failed to save');
      }
    } catch {
      onMessage('error', 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (newEnabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images_enabled: newEnabled }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdate({ images_enabled: newEnabled });
      }
    } catch {
      onMessage('error', 'Failed to update');
    }
  };

  const handleMainMediaChange = (index: number, type: 'image' | 'video', url: string, embedCode?: string) => {
    const updated = [...localMainMedia];
    updated[index] = {
      id: updated[index]?.id || `main-${index}`,
      type,
      url,
      video_embed_code: embedCode,
      order: index,
    };
    setLocalMainMedia(updated);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', `tours/${tourId}/videos`);
    formData.append('bucket', 'tour-media');

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        handleMainMediaChange(index, 'video', data.url);
        onMessage('success', 'Video uploaded');
      } else {
        onMessage('error', data.error || 'Upload failed');
      }
    } catch {
      onMessage('error', 'Upload failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Images</h2>
          <p className="mt-1 text-sm text-gray-500">Background, featured, main media, and additional photos</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{enabled ? 'Enabled' : 'Disabled'}</span>
          <button
            type="button"
            onClick={() => handleToggle(!enabled)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              enabled ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Row 1: Hero Background + Main Thumbnail */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Hero Background Image */}
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start gap-4">
              <SingleImageUploader
                value={localHeroImage}
                onChange={setLocalHeroImage}
                folder={`tours/${tourId}/hero`}
                compact
              />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Page Title Background</h4>
                <p className="mt-1 text-xs text-gray-400">
                  Appears behind the tour title at the top
                </p>
              </div>
            </div>
          </div>

          {/* Main Thumbnail Image */}
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start gap-4">
              <SingleImageUploader
                value={localFeatured[0] || null}
                onChange={(url) => {
                  if (url) {
                    setLocalFeatured([url, ...localFeatured.slice(1)]);
                  } else {
                    setLocalFeatured(localFeatured.slice(1));
                  }
                }}
                folder={`tours/${tourId}/featured`}
                compact
              />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  Main Thumbnail
                  <span className="ml-1 text-red-500">*</span>
                </h4>
                <p className="mt-1 text-xs text-gray-400">
                  Social media & search preview
                </p>
                {!localFeatured[0] && (
                  <p className="mt-1 text-xs text-amber-600">Required</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Thumbnail Images */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Additional Thumbnails</h4>
              <p className="text-xs text-gray-400">Creates slider effect (up to 5)</p>
            </div>
            <span className="text-xs text-gray-400">{localFeatured.slice(1).length}/5</span>
          </div>
          <ImageUploader
            value={localFeatured.slice(1)}
            onChange={(urls) => {
              const mainThumb = localFeatured[0];
              setLocalFeatured(mainThumb ? [mainThumb, ...urls] : urls);
            }}
            maxFiles={5}
            folder={`tours/${tourId}/featured`}
            compact
          />
        </div>

        {/* 4 Main Media Slots */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900">Main Gallery Media</h4>
            <p className="text-xs text-gray-400">4 primary images/videos on tour page</p>
          </div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            {[0, 1, 2, 3].map((index) => {
              const media = localMainMedia[index];
              return (
                <div key={index} className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Slot {index + 1}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMainMediaIndex(index);
                          handleMainMediaChange(index, 'image', '', undefined);
                        }}
                        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                          !media || media.type === 'image'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        Image
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMainMediaIndex(index);
                        }}
                        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                          media?.type === 'video'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        Video
                      </button>
                    </div>
                  </div>

                  {(!media || media.type === 'image') ? (
                    <div className="aspect-[4/3] w-full">
                      {media?.url ? (
                        <div className="group relative h-full w-full overflow-hidden rounded-lg bg-gray-100">
                          <img
                            src={media.url}
                            alt={`Media ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-gray-700 hover:bg-gray-50">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const formData = new FormData();
                                  formData.append('file', file);
                                  formData.append('folder', `tours/${tourId}/main`);
                                  formData.append('bucket', 'tour-media');
                                  try {
                                    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
                                    const data = await res.json();
                                    if (data.success) handleMainMediaChange(index, 'image', data.url);
                                  } catch {}
                                }}
                                className="hidden"
                              />
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                              </svg>
                            </label>
                            <button
                              type="button"
                              onClick={() => handleMainMediaChange(index, 'image', '')}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white transition-colors hover:border-gray-300 hover:bg-gray-50">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append('file', file);
                              formData.append('folder', `tours/${tourId}/main`);
                              formData.append('bucket', 'tour-media');
                              try {
                                const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
                                const data = await res.json();
                                if (data.success) handleMainMediaChange(index, 'image', data.url);
                              } catch {}
                            }}
                            className="hidden"
                          />
                          <svg className="mb-1 h-6 w-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                          <span className="text-xs text-gray-400">Upload</span>
                        </label>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-[4/3] w-full">
                      {media.url ? (
                        <div className="group relative h-full w-full overflow-hidden rounded-lg bg-gray-100">
                          <video src={media.url} className="h-full w-full object-cover" muted />
                          <button
                            type="button"
                            onClick={() => handleMainMediaChange(index, 'video', '')}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </span>
                          </button>
                        </div>
                      ) : (
                        <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white transition-colors hover:border-gray-300 hover:bg-gray-50">
                          <input
                            ref={activeMainMediaIndex === index ? videoInputRef : undefined}
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            onChange={(e) => handleVideoUpload(e, index)}
                            className="hidden"
                          />
                          <svg className="mb-1 h-6 w-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                          <span className="text-xs text-gray-400">Upload</span>
                        </label>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Photos */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Additional Gallery</h4>
              <p className="text-xs text-gray-400">Up to 20 extra photos</p>
            </div>
            <span className="text-xs text-gray-400">{localAdditional.length}/20</span>
          </div>
          <ImageUploader
            value={localAdditional}
            onChange={setLocalAdditional}
            maxFiles={20}
            folder={`tours/${tourId}/additional`}
            compact
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end border-t border-gray-100 pt-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex h-9 items-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Save Images
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
