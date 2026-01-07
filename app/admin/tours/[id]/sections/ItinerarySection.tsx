'use client';

import { useState } from 'react';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { AITranslateButton } from '@/components/admin/AITranslateButton';

interface ItinerarySectionProps {
  tourId: string;
  enabled: boolean;
  title: string;
  images: string[];
  onUpdate: (data: { itinerary_enabled?: boolean; itinerary_title?: string; itinerary_images?: string[] }) => void;
  onMessage: (type: 'success' | 'error', text: string) => void;
}

export function ItinerarySection({
  tourId,
  enabled,
  title: initialTitle,
  images: initialImages,
  onUpdate,
  onMessage,
}: ItinerarySectionProps) {
  const [title, setTitle] = useState(initialTitle);
  const [images, setImages] = useState(initialImages);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (newEnabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itinerary_enabled: newEnabled }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdate({ itinerary_enabled: newEnabled });
      }
    } catch {
      onMessage('error', 'Failed to update');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itinerary_title: title,
          itinerary_images: images,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdate({ itinerary_title: title, itinerary_images: images });
        onMessage('success', 'Itinerary saved');
      } else {
        onMessage('error', data.error || 'Failed to save');
      }
    } catch {
      onMessage('error', 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Itinerary</h2>
          <p className="mt-1 text-sm text-gray-500">Itinerary map, brochure, or poster images</p>
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

      <div className="space-y-5">
        {/* Section Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Section Title
            </label>
            <AITranslateButton
              sourceText={title}
              tourId={tourId}
              size="sm"
              label="Translate"
              disabled={!title.trim()}
              onTranslationsComplete={() => {
                onMessage('success', 'Title translated to all languages');
              }}
            />
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 transition-colors focus:border-gray-400 focus:outline-none"
            placeholder="Itinerary, Brochure, Route Map..."
          />
          <p className="mt-1 text-xs text-gray-400">
            You can rename this section to "Brochure", "Route Map", "Poster", etc.
          </p>
        </div>

        {/* Images */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Images
          </label>
          <ImageUploader
            value={images}
            onChange={setImages}
            maxFiles={10}
            folder={`tours/${tourId}/itinerary`}
          />
          <p className="mt-2 text-xs text-gray-400">
            Upload one or more images. Multiple images will display as a slider.
          </p>
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
                Save Itinerary
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
