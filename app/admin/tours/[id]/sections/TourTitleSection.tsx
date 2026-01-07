'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TourCategory, SpecialLabel, Language } from '@/types';
import { AITranslateButton } from '@/components/admin/AITranslateButton';

interface TourTitleSectionProps {
  tourId: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  initialTags?: string[];
  onUpdate: (data: { title?: string; slug?: string; status?: string; tags?: string[] }) => void;
  onMessage: (type: 'success' | 'error', text: string) => void;
}

export function TourTitleSection({
  tourId,
  title: initialTitle,
  slug: initialSlug,
  status: initialStatus,
  initialTags = [],
  onUpdate,
  onMessage,
}: TourTitleSectionProps) {
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [status, setStatus] = useState(initialStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Categories & Labels state
  const [allCategories, setAllCategories] = useState<TourCategory[]>([]);
  const [allLabels, setAllLabels] = useState<SpecialLabel[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState('');
  const [isLoadingCategoriesLabels, setIsLoadingCategoriesLabels] = useState(true);
  const [isSavingCategories, setIsSavingCategories] = useState(false);
  const [isSavingLabels, setIsSavingLabels] = useState(false);
  const [isSavingTags, setIsSavingTags] = useState(false);

  useEffect(() => {
    const changed = title !== initialTitle || slug !== initialSlug || status !== initialStatus;
    setHasChanges(changed);
  }, [title, slug, status, initialTitle, initialSlug, initialStatus]);

  // Fetch categories and labels
  const fetchCategoriesLabels = useCallback(async () => {
    try {
      const [categoriesRes, labelsRes, tourCategoriesRes, tourLabelsRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/labels'),
        fetch(`/api/admin/tours/${tourId}/categories`),
        fetch(`/api/admin/tours/${tourId}/labels`),
      ]);

      const [categoriesData, labelsData, tourCategoriesData, tourLabelsData] = await Promise.all([
        categoriesRes.json(),
        labelsRes.json(),
        tourCategoriesRes.json(),
        tourLabelsRes.json(),
      ]);

      if (categoriesData.success) {
        setAllCategories(categoriesData.categories);
      }
      if (labelsData.success) {
        setAllLabels(labelsData.labels);
      }
      if (tourCategoriesData.success) {
        setSelectedCategoryIds(tourCategoriesData.categories.map((c: TourCategory) => c.id));
      }
      if (tourLabelsData.success) {
        setSelectedLabelIds(tourLabelsData.labels.map((l: SpecialLabel) => l.id));
      }
    } catch (error) {
      console.error('Error fetching categories/labels:', error);
    } finally {
      setIsLoadingCategoriesLabels(false);
    }
  }, [tourId]);

  useEffect(() => {
    fetchCategoriesLabels();
  }, [fetchCategoriesLabels]);

  // Handle category toggle
  const handleCategoryToggle = async (categoryId: string) => {
    const newSelection = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter(id => id !== categoryId)
      : [...selectedCategoryIds, categoryId];
    
    setSelectedCategoryIds(newSelection);
    setIsSavingCategories(true);

    try {
      const response = await fetch(`/api/admin/tours/${tourId}/categories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryIds: newSelection }),
      });

      const data = await response.json();
      if (!data.success) {
        setSelectedCategoryIds(selectedCategoryIds);
        onMessage('error', data.error || 'Failed to update categories');
      }
    } catch {
      setSelectedCategoryIds(selectedCategoryIds);
      onMessage('error', 'Failed to update categories');
    } finally {
      setIsSavingCategories(false);
    }
  };

  // Handle label toggle
  const handleLabelToggle = async (labelId: string) => {
    const newSelection = selectedLabelIds.includes(labelId)
      ? selectedLabelIds.filter(id => id !== labelId)
      : [...selectedLabelIds, labelId];
    
    setSelectedLabelIds(newSelection);
    setIsSavingLabels(true);

    try {
      const response = await fetch(`/api/admin/tours/${tourId}/labels`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labelIds: newSelection }),
      });

      const data = await response.json();
      if (!data.success) {
        setSelectedLabelIds(selectedLabelIds);
        onMessage('error', data.error || 'Failed to update labels');
      }
    } catch {
      setSelectedLabelIds(selectedLabelIds);
      onMessage('error', 'Failed to update labels');
    } finally {
      setIsSavingLabels(false);
    }
  };

  // Handle adding a tag
  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) return;
    if (tags.includes(trimmedTag)) {
      onMessage('error', 'This tag already exists');
      return;
    }

    const newTags = [...tags, trimmedTag];
    setTags(newTags);
    setNewTag('');
    saveTags(newTags);
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    setTags(newTags);
    saveTags(newTags);
  };

  // Save tags to server
  const saveTags = async (newTags: string[]) => {
    setIsSavingTags(true);
    try {
      const response = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: newTags }),
      });

      const data = await response.json();
      if (data.success) {
        onUpdate({ tags: newTags });
      } else {
        onMessage('error', data.error || 'Failed to save tags');
      }
    } catch {
      onMessage('error', 'Failed to save tags');
    } finally {
      setIsSavingTags(false);
    }
  };

  // Handle Enter key for tags
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSlugChange = (value: string) => {
    // Auto-format slug: lowercase, replace spaces with dashes, remove special chars
    const formatted = value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setSlug(formatted);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update tour basic info
      const res = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, status }),
      });
      const data = await res.json();

      if (data.success) {
        // Update hero block title
        const blocksRes = await fetch(`/api/admin/tours/${tourId}/blocks`);
        const blocksData = await blocksRes.json();
        
        if (blocksData.success) {
          const heroBlock = blocksData.blocks?.find((b: { block_type: string }) => b.block_type === 'hero');
          if (heroBlock) {
            await fetch(`/api/admin/tours/${tourId}/blocks/${heroBlock.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title, language: 'en' }),
            });
          }
        }

        onUpdate({ title, slug, status });
        onMessage('success', 'Tour settings saved');
        setHasChanges(false);
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
    <div className="space-y-8">
      {/* Title & Status Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Tour Title & Status</h2>
          <p className="mt-1 text-sm text-gray-500">Basic tour information and publishing status</p>
        </div>

        <div className="space-y-5">
          {/* Tour Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Tour Title
              </label>
              <AITranslateButton
                sourceText={title}
                tourId={tourId}
                size="sm"
                label="Translate title"
                onTranslationsComplete={(translations) => {
                  // The translations are saved via the API, refresh the page or show success
                  onMessage('success', 'Title translated to all languages');
                }}
              />
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 transition-colors focus:border-gray-400 focus:outline-none"
              placeholder="Enter tour title"
            />
            <p className="mt-1 text-xs text-gray-400">
              Click &quot;Translate title&quot; to auto-translate to all languages using AI
            </p>
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              URL Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">/tours/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="h-10 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 transition-colors focus:border-gray-400 focus:outline-none"
                placeholder="tour-url-slug"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Status
            </label>
            <div className="flex gap-2">
              {(['draft', 'published', 'archived'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    status === s
                      ? s === 'published'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : s === 'draft'
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-500 bg-gray-50 text-gray-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          {hasChanges && (
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
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Categories Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
            <p className="text-sm text-gray-500">Assign this tour to one or more categories</p>
          </div>
          {isSavingCategories && (
            <span className="text-sm text-gray-500">Saving...</span>
          )}
        </div>

        {isLoadingCategoriesLabels ? (
          <div className="flex h-20 items-center justify-center">
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        ) : allCategories.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
            <p className="text-sm text-gray-500">No categories created yet.</p>
            <a
              href="/admin/categories"
              className="mt-2 inline-block text-sm font-medium text-gray-900 hover:underline"
            >
              Create categories →
            </a>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {allCategories.map((category) => (
              <label
                key={category.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  selectedCategoryIds.includes(category.id)
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <div>
                  <span className="font-medium text-gray-900">{category.name}</span>
                  {category.description && (
                    <p className="text-xs text-gray-500 line-clamp-1">{category.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Special Labels Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Special Labels</h3>
            <p className="text-sm text-gray-500">Add corner badge labels to highlight this tour</p>
          </div>
          {isSavingLabels && (
            <span className="text-sm text-gray-500">Saving...</span>
          )}
        </div>

        {isLoadingCategoriesLabels ? (
          <div className="flex h-20 items-center justify-center">
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        ) : allLabels.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
            <p className="text-sm text-gray-500">No special labels created yet.</p>
            <a
              href="/admin/labels"
              className="mt-2 inline-block text-sm font-medium text-gray-900 hover:underline"
            >
              Create labels →
            </a>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {allLabels.map((label) => (
              <label
                key={label.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  selectedLabelIds.includes(label.id)
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedLabelIds.includes(label.id)}
                  onChange={() => handleLabelToggle(label.id)}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block rounded px-2 py-0.5 text-xs font-semibold"
                    style={{
                      backgroundColor: label.background_color,
                      color: label.text_color,
                    }}
                  >
                    {label.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Tags Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
            <p className="text-sm text-gray-500">Add custom tags that appear as small badges on the tour card</p>
          </div>
          {isSavingTags && (
            <span className="text-sm text-gray-500">Saving...</span>
          )}
        </div>

        {/* Tag Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Type a tag and press Enter..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          <button
            onClick={handleAddTag}
            disabled={!newTag.trim()}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            Add
          </button>
        </div>

        {/* Tags Display */}
        {tags.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
            <p className="text-sm text-gray-500">No tags added yet. Tags like &quot;Golf&quot;, &quot;Adventure&quot;, &quot;Family-Friendly&quot; help describe the tour.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
