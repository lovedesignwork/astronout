'use client';

import { useState } from 'react';
import type { TourBlock } from '@/types';

interface BlockWithTranslations extends TourBlock {
  translations: { language: string; title: string; content: Record<string, unknown> }[];
}

interface BlockEditorProps {
  tourId: string;
  block: BlockWithTranslations;
  onUpdate: (block: BlockWithTranslations) => void;
  onMessage: (type: 'success' | 'error', text: string) => void;
}

export function BlockEditor({ tourId, block, onUpdate, onMessage }: BlockEditorProps) {
  const enTrans = block.translations?.find(t => t.language === 'en') || { title: '', content: {} };
  const [title, setTitle] = useState(enTrans.title || '');
  const [content, setContent] = useState<Record<string, unknown>>(enTrans.content || {});
  const [enabled, setEnabled] = useState(block.enabled);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/tours/${tourId}/blocks/${block.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, title, content, language: 'en' }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdate({ ...block, enabled, translations: [{ language: 'en', title, content }] });
        onMessage('success', 'Block saved');
      } else {
        onMessage('error', data.error || 'Failed to save');
      }
    } catch {
      onMessage('error', 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    try {
      await fetch(`/api/admin/tours/${tourId}/blocks/${block.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newEnabled }),
      });
      onUpdate({ ...block, enabled: newEnabled });
    } catch {
      setEnabled(!newEnabled);
    }
  };

  // Render different editors based on block type
  const renderEditor = () => {
    switch (block.block_type) {
      case 'hero':
        return <HeroEditor content={content} onChange={setContent} title={title} onTitleChange={setTitle} />;
      case 'highlights':
        return <ListEditor content={content} onChange={setContent} title={title} onTitleChange={setTitle} field="items" label="Highlights" />;
      case 'included_excluded':
        return <IncludedExcludedEditor content={content} onChange={setContent} title={title} onTitleChange={setTitle} />;
      case 'itinerary':
        return <ItineraryEditor content={content} onChange={setContent} title={title} onTitleChange={setTitle} />;
      case 'what_to_bring':
        return <WhatToBringEditor content={content} onChange={setContent} title={title} onTitleChange={setTitle} />;
      case 'safety_info':
        return <SafetyInfoEditor content={content} onChange={setContent} title={title} onTitleChange={setTitle} />;
      case 'terms':
        return <TermsEditor content={content} onChange={setContent} title={title} onTitleChange={setTitle} />;
      case 'map':
        return <MapEditor content={content} onChange={setContent} title={title} onTitleChange={setTitle} />;
      case 'reviews':
        return <ReviewsEditor content={content} onChange={setContent} title={title} onTitleChange={setTitle} />;
      default:
        return <GenericEditor content={content} onChange={setContent} title={title} onTitleChange={setTitle} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Enable toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200">
        <div className="flex items-center gap-3">
          <div className={`flex size-8 items-center justify-center rounded-lg ${enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
            {enabled ? (
              <svg className="size-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Block Status</p>
            <p className="text-xs text-gray-500">{enabled ? 'Visible on tour page' : 'Hidden from visitors'}</p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      {/* Block-specific editor */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        {renderEditor()}
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="h-9 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 px-4 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-600 disabled:opacity-50 transition-all shadow-sm"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// Hero Block Editor
function HeroEditor({
  content,
  onChange,
  title,
  onTitleChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
  title: string;
  onTitleChange: (t: string) => void;
}) {
  const images = (content.images as string[]) || [];
  // If there's a single imageUrl but no images array, use it as the first image
  const displayImages = images.length > 0 ? images : (content.imageUrl ? [content.imageUrl as string] : []);

  const addImage = () => {
    const newImages = [...displayImages, ''];
    onChange({ ...content, images: newImages, imageUrl: newImages[0] || '' });
  };

  const updateImage = (index: number, url: string) => {
    const newImages = [...displayImages];
    newImages[index] = url;
    onChange({ ...content, images: newImages, imageUrl: newImages[0] || '' });
  };

  const removeImage = (index: number) => {
    const newImages = displayImages.filter((_, i) => i !== index);
    onChange({ ...content, images: newImages, imageUrl: newImages[0] || '' });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Tour Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
          placeholder="Phi Phi Islands Day Tour"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Subtitle</label>
        <input
          type="text"
          value={(content.subtitle as string) || ''}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
          placeholder="Visit Maya Bay, Pileh Lagoon, and more"
        />
      </div>
      
      {/* Photo Gallery */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          Photo Gallery
          <span className="ml-2 text-xs font-normal text-gray-500">First image is the main hero image</span>
        </label>
        <div className="space-y-3">
          {displayImages.map((url, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-1">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateImage(index, e.target.value)}
                    className="flex-1 h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="rounded-md border border-red-200 px-3 py-2 text-red-500 hover:bg-red-50"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {url && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-16 w-24 overflow-hidden rounded bg-gray-100">
                      <img src={url} alt={`Image ${index + 1}`} className="h-full w-full object-cover" />
                    </div>
                    {index === 0 && (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Main Image</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addImage}
          className="mt-3 flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Photo
        </button>
        <p className="mt-2 text-xs text-gray-500">
          Add at least 4 images for the best gallery experience. Supported: JPG, PNG, WebP URLs.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Location</label>
          <input
            type="text"
            value={(content.location as string) || ''}
            onChange={(e) => onChange({ ...content, location: e.target.value })}
            className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
            placeholder="Phuket, Thailand"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Duration</label>
          <input
            type="text"
            value={(content.duration as string) || ''}
            onChange={(e) => onChange({ ...content, duration: e.target.value })}
            className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
            placeholder="8 hours"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Rating</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={(content.rating as number) || ''}
            onChange={(e) => onChange({ ...content, rating: Number(e.target.value) })}
            className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Review Count</label>
          <input
            type="number"
            value={(content.reviewCount as number) || ''}
            onChange={(e) => onChange({ ...content, reviewCount: Number(e.target.value) })}
            className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Badges (comma-separated)</label>
        <input
          type="text"
          value={((content.badges as string[]) || []).join(', ')}
          onChange={(e) => onChange({ ...content, badges: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
          placeholder="Best Seller, Top Rated"
        />
      </div>
    </div>
  );
}

// Generic List Editor (for highlights, what to bring, etc.)
function ListEditor({
  content,
  onChange,
  title,
  onTitleChange,
  field,
  label,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
  title: string;
  onTitleChange: (t: string) => void;
  field: string;
  label: string;
}) {
  const items = (content[field] as string[]) || [];

  const addItem = () => onChange({ ...content, [field]: [...items, ''] });
  const updateItem = (i: number, value: string) => {
    const updated = [...items];
    updated[i] = value;
    onChange({ ...content, [field]: updated });
  };
  const removeItem = (i: number) => onChange({ ...content, [field]: items.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Section Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(i, e.target.value)}
                className="flex-1 h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
              />
              <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 px-2">×</button>
            </div>
          ))}
        </div>
        <button onClick={addItem} className="mt-2 flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700">+ Add item</button>
      </div>
    </div>
  );
}

// Included/Excluded Editor
function IncludedExcludedEditor({
  content,
  onChange,
  title,
  onTitleChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
  title: string;
  onTitleChange: (t: string) => void;
}) {
  const included = (content.included as string[]) || [];
  const excluded = (content.excluded as string[]) || [];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Section Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-green-700">✓ What's Included</label>
          <div className="space-y-2">
            {included.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const updated = [...included];
                    updated[i] = e.target.value;
                    onChange({ ...content, included: updated });
                  }}
                  className="flex-1 h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
                />
                <button onClick={() => onChange({ ...content, included: included.filter((_, idx) => idx !== i) })} className="text-red-500 px-2">×</button>
              </div>
            ))}
          </div>
          <button onClick={() => onChange({ ...content, included: [...included, ''] })} className="mt-2 text-sm text-emerald-600">+ Add</button>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-red-700">✕ Not Included</label>
          <div className="space-y-2">
            {excluded.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const updated = [...excluded];
                    updated[i] = e.target.value;
                    onChange({ ...content, excluded: updated });
                  }}
                  className="flex-1 h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
                />
                <button onClick={() => onChange({ ...content, excluded: excluded.filter((_, idx) => idx !== i) })} className="text-red-500 px-2">×</button>
              </div>
            ))}
          </div>
          <button onClick={() => onChange({ ...content, excluded: [...excluded, ''] })} className="mt-2 text-sm text-emerald-600">+ Add</button>
        </div>
      </div>
    </div>
  );
}

// Itinerary Editor
function ItineraryEditor({
  content,
  onChange,
  title,
  onTitleChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
  title: string;
  onTitleChange: (t: string) => void;
}) {
  const items = (content.items as { time?: string; title: string; description?: string }[]) || [];

  const addItem = () => onChange({ ...content, items: [...items, { title: '', time: '', description: '' }] });
  const updateItem = (i: number, field: string, value: string) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    onChange({ ...content, items: updated });
  };
  const removeItem = (i: number) => onChange({ ...content, items: items.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Section Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
        />
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-md border border-gray-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Stop {i + 1}</span>
              <button onClick={() => removeItem(i)} className="text-red-500 text-sm">Remove</button>
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              <input
                type="text"
                value={item.time || ''}
                onChange={(e) => updateItem(i, 'time', e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="09:00"
              />
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(i, 'title', e.target.value)}
                className="sm:col-span-3 rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Activity title"
              />
            </div>
            <textarea
              value={item.description || ''}
              onChange={(e) => updateItem(i, 'description', e.target.value)}
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Description..."
              rows={2}
            />
          </div>
        ))}
      </div>
      <button onClick={addItem} className="flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700">+ Add itinerary stop</button>
    </div>
  );
}

// What to Bring Editor
function WhatToBringEditor({
  content,
  onChange,
  title,
  onTitleChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
  title: string;
  onTitleChange: (t: string) => void;
}) {
  const items = (content.items as string[]) || [];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Section Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Items to Bring</label>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const updated = [...items];
                  updated[i] = e.target.value;
                  onChange({ ...content, items: updated });
                }}
                className="flex-1 h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
              />
              <button onClick={() => onChange({ ...content, items: items.filter((_, idx) => idx !== i) })} className="text-red-500 px-2">×</button>
            </div>
          ))}
        </div>
        <button onClick={() => onChange({ ...content, items: [...items, ''] })} className="mt-2 text-sm text-emerald-600">+ Add item</button>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Additional Note</label>
        <textarea
          value={(content.note as string) || ''}
          onChange={(e) => onChange({ ...content, note: e.target.value })}
          className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
          rows={2}
          placeholder="Optional note..."
        />
      </div>
    </div>
  );
}

// Safety Info Editor
function SafetyInfoEditor({
  content,
  onChange,
  title,
  onTitleChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
  title: string;
  onTitleChange: (t: string) => void;
}) {
  const items = (content.items as string[]) || [];
  const restrictions = (content.restrictions as string[]) || [];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Section Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-green-700">Safety Guidelines</label>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[i] = e.target.value;
                    onChange({ ...content, items: updated });
                  }}
                  className="flex-1 h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
                />
                <button onClick={() => onChange({ ...content, items: items.filter((_, idx) => idx !== i) })} className="text-red-500 px-2">×</button>
              </div>
            ))}
          </div>
          <button onClick={() => onChange({ ...content, items: [...items, ''] })} className="mt-2 text-sm text-emerald-600">+ Add</button>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-red-700">Restrictions</label>
          <div className="space-y-2">
            {restrictions.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const updated = [...restrictions];
                    updated[i] = e.target.value;
                    onChange({ ...content, restrictions: updated });
                  }}
                  className="flex-1 h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
                />
                <button onClick={() => onChange({ ...content, restrictions: restrictions.filter((_, idx) => idx !== i) })} className="text-red-500 px-2">×</button>
              </div>
            ))}
          </div>
          <button onClick={() => onChange({ ...content, restrictions: [...restrictions, ''] })} className="mt-2 text-sm text-emerald-600">+ Add</button>
        </div>
      </div>
    </div>
  );
}

// Terms Editor
function TermsEditor({
  content,
  onChange,
  title,
  onTitleChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
  title: string;
  onTitleChange: (t: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Section Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Cancellation Policy</label>
        <textarea
          value={(content.cancellationPolicy as string) || ''}
          onChange={(e) => onChange({ ...content, cancellationPolicy: e.target.value })}
          className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
          rows={3}
          placeholder="Free cancellation up to 24 hours..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Refund Policy</label>
        <textarea
          value={(content.refundPolicy as string) || ''}
          onChange={(e) => onChange({ ...content, refundPolicy: e.target.value })}
          className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
          rows={3}
          placeholder="Full refund if cancelled due to weather..."
        />
      </div>
    </div>
  );
}

// Map Editor
function MapEditor({
  content,
  onChange,
  title,
  onTitleChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
  title: string;
  onTitleChange: (t: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Section Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Latitude</label>
          <input
            type="number"
            step="0.0001"
            value={(content.latitude as number) || ''}
            onChange={(e) => onChange({ ...content, latitude: Number(e.target.value) })}
            className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Longitude</label>
          <input
            type="number"
            step="0.0001"
            value={(content.longitude as number) || ''}
            onChange={(e) => onChange({ ...content, longitude: Number(e.target.value) })}
            className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Address</label>
        <input
          type="text"
          value={(content.address as string) || ''}
          onChange={(e) => onChange({ ...content, address: e.target.value })}
          className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
          placeholder="123 Main St, Phuket"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Meeting Point Instructions</label>
        <textarea
          value={(content.meetingPoint as string) || ''}
          onChange={(e) => onChange({ ...content, meetingPoint: e.target.value })}
          className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
          rows={2}
          placeholder="We will pick you up from your hotel..."
        />
      </div>
    </div>
  );
}

// Reviews Editor
function ReviewsEditor({
  content,
  onChange,
  title,
  onTitleChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
  title: string;
  onTitleChange: (t: string) => void;
}) {
  const reviews = (content.reviews as { author: string; rating: number; comment: string; country?: string; date?: string }[]) || [];

  const addReview = () => onChange({ ...content, reviews: [...reviews, { author: '', rating: 5, comment: '' }] });
  const updateReview = (i: number, field: string, value: string | number) => {
    const updated = [...reviews];
    updated[i] = { ...updated[i], [field]: value };
    onChange({ ...content, reviews: updated });
  };
  const removeReview = (i: number) => onChange({ ...content, reviews: reviews.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Section Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Average Rating</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={(content.averageRating as number) || ''}
            onChange={(e) => onChange({ ...content, averageRating: Number(e.target.value) })}
            className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Total Reviews</label>
          <input
            type="number"
            value={(content.totalReviews as number) || ''}
            onChange={(e) => onChange({ ...content, totalReviews: Number(e.target.value) })}
            className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
          />
        </div>
      </div>
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Reviews</label>
        {reviews.map((review, i) => (
          <div key={i} className="rounded-md border border-gray-200 p-3">
            <div className="mb-2 flex justify-between">
              <span className="text-sm text-gray-500">Review {i + 1}</span>
              <button onClick={() => removeReview(i)} className="text-red-500 text-sm">Remove</button>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                type="text"
                value={review.author}
                onChange={(e) => updateReview(i, 'author', e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Name"
              />
              <input
                type="number"
                min="1"
                max="5"
                value={review.rating}
                onChange={(e) => updateReview(i, 'rating', Number(e.target.value))}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Rating"
              />
              <input
                type="text"
                value={review.country || ''}
                onChange={(e) => updateReview(i, 'country', e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Country"
              />
            </div>
            <textarea
              value={review.comment}
              onChange={(e) => updateReview(i, 'comment', e.target.value)}
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Review comment..."
              rows={2}
            />
          </div>
        ))}
        <button onClick={addReview} className="flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700">+ Add review</button>
      </div>
    </div>
  );
}

// Generic Editor (fallback)
function GenericEditor({
  content,
  onChange,
  title,
  onTitleChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
  title: string;
  onTitleChange: (t: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Block Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Content (JSON)</label>
        <textarea
          value={JSON.stringify(content, null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch {
              // Invalid JSON, ignore
            }
          }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
          rows={6}
        />
      </div>
    </div>
  );
}

