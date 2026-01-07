'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TourCategory, SpecialLabel } from '@/types';

interface CategoriesLabelsSectionProps {
  tourId: string;
  initialTags: string[];
  onUpdate: (data: { tags?: string[] }) => void;
  onMessage: (type: 'success' | 'error', text: string) => void;
}

export function CategoriesLabelsSection({
  tourId,
  initialTags,
  onUpdate,
  onMessage,
}: CategoriesLabelsSectionProps) {
  // All available options
  const [allCategories, setAllCategories] = useState<TourCategory[]>([]);
  const [allLabels, setAllLabels] = useState<SpecialLabel[]>([]);
  
  // Selected/assigned items
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>(initialTags || []);
  const [newTag, setNewTag] = useState('');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingCategories, setIsSavingCategories] = useState(false);
  const [isSavingLabels, setIsSavingLabels] = useState(false);
  const [isSavingTags, setIsSavingTags] = useState(false);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      // Fetch all categories and labels
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
      console.error('Error fetching data:', error);
      onMessage('error', 'Failed to load categories and labels');
    } finally {
      setIsLoading(false);
    }
  }, [tourId, onMessage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        // Revert on error
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

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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

        {allCategories.length === 0 ? (
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

        {allLabels.length === 0 ? (
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

      {/* Regular Tags Section */}
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



