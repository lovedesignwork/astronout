'use client';

import { useState, useEffect } from 'react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import type { TourCategory, SpecialLabel } from '@/types';

const PRESET_COLORS = [
  { bg: '#f97316', text: '#ffffff', name: 'Orange' },
  { bg: '#ef4444', text: '#ffffff', name: 'Red' },
  { bg: '#22c55e', text: '#ffffff', name: 'Green' },
  { bg: '#3b82f6', text: '#ffffff', name: 'Blue' },
  { bg: '#8b5cf6', text: '#ffffff', name: 'Purple' },
  { bg: '#ec4899', text: '#ffffff', name: 'Pink' },
  { bg: '#14b8a6', text: '#ffffff', name: 'Teal' },
  { bg: '#f59e0b', text: '#000000', name: 'Amber' },
  { bg: '#1f2937', text: '#ffffff', name: 'Dark' },
  { bg: '#fbbf24', text: '#000000', name: 'Yellow' },
];

type ActiveTab = 'categories' | 'labels';

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('categories');
  
  // Categories state
  const [categories, setCategories] = useState<TourCategory[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  
  // Labels state
  const [labels, setLabels] = useState<SpecialLabel[]>([]);
  const [isLabelsLoading, setIsLabelsLoading] = useState(true);
  
  // Shared state
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TourCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', slug: '', description: '' });
  const [isCategorySaving, setIsCategorySaving] = useState(false);

  // Label modal state
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<SpecialLabel | null>(null);
  const [labelFormData, setLabelFormData] = useState({
    name: '',
    slug: '',
    background_color: '#f97316',
    text_color: '#ffffff',
  });
  const [isLabelSaving, setIsLabelSaving] = useState(false);

  // Delete dialog state
  const [categoryDeleteTarget, setCategoryDeleteTarget] = useState<TourCategory | null>(null);
  const [labelDeleteTarget, setLabelDeleteTarget] = useState<SpecialLabel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchLabels();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      } else {
        setError(data.error || 'Failed to fetch categories');
      }
    } catch {
      setError('Failed to fetch categories');
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const fetchLabels = async () => {
    try {
      const response = await fetch('/api/admin/labels');
      const data = await response.json();
      if (data.success) {
        setLabels(data.labels);
      } else {
        setError(data.error || 'Failed to fetch labels');
      }
    } catch {
      setError('Failed to fetch labels');
    } finally {
      setIsLabelsLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Category handlers
  const handleOpenCategoryModal = (category?: TourCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({ name: '', slug: '', description: '' });
    }
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryFormData({ name: '', slug: '', description: '' });
  };

  const handleCategoryNameChange = (name: string) => {
    setCategoryFormData({
      ...categoryFormData,
      name,
      slug: editingCategory ? categoryFormData.slug : name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    });
  };

  const handleSaveCategory = async () => {
    if (!categoryFormData.name || !categoryFormData.slug) {
      setError('Name and slug are required');
      return;
    }

    setIsCategorySaving(true);
    setError(null);

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      
      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryFormData),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(editingCategory ? 'Category updated' : 'Category created');
        handleCloseCategoryModal();
        fetchCategories();
      } else {
        setError(data.error || 'Failed to save category');
      }
    } catch {
      setError('Failed to save category');
    } finally {
      setIsCategorySaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryDeleteTarget) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/categories/${categoryDeleteTarget.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Category deleted');
        setCategoryDeleteTarget(null);
        fetchCategories();
      } else {
        setError(data.error || 'Failed to delete category');
      }
    } catch {
      setError('Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  // Label handlers
  const handleOpenLabelModal = (label?: SpecialLabel) => {
    if (label) {
      setEditingLabel(label);
      setLabelFormData({
        name: label.name,
        slug: label.slug,
        background_color: label.background_color,
        text_color: label.text_color,
      });
    } else {
      setEditingLabel(null);
      setLabelFormData({
        name: '',
        slug: '',
        background_color: '#f97316',
        text_color: '#ffffff',
      });
    }
    setIsLabelModalOpen(true);
  };

  const handleCloseLabelModal = () => {
    setIsLabelModalOpen(false);
    setEditingLabel(null);
    setLabelFormData({
      name: '',
      slug: '',
      background_color: '#f97316',
      text_color: '#ffffff',
    });
  };

  const handleLabelNameChange = (name: string) => {
    setLabelFormData({
      ...labelFormData,
      name,
      slug: editingLabel ? labelFormData.slug : name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    });
  };

  const handlePresetColor = (bg: string, text: string) => {
    setLabelFormData({ ...labelFormData, background_color: bg, text_color: text });
  };

  const handleSaveLabel = async () => {
    if (!labelFormData.name || !labelFormData.slug) {
      setError('Name and slug are required');
      return;
    }

    setIsLabelSaving(true);
    setError(null);

    try {
      const url = editingLabel
        ? `/api/admin/labels/${editingLabel.id}`
        : '/api/admin/labels';
      
      const response = await fetch(url, {
        method: editingLabel ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(labelFormData),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(editingLabel ? 'Label updated' : 'Label created');
        handleCloseLabelModal();
        fetchLabels();
      } else {
        setError(data.error || 'Failed to save label');
      }
    } catch {
      setError('Failed to save label');
    } finally {
      setIsLabelSaving(false);
    }
  };

  const handleDeleteLabel = async () => {
    if (!labelDeleteTarget) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/labels/${labelDeleteTarget.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Label deleted');
        setLabelDeleteTarget(null);
        fetchLabels();
      } else {
        setError(data.error || 'Failed to delete label');
      }
    } catch {
      setError('Failed to delete label');
    } finally {
      setIsDeleting(false);
    }
  };

  const isLoading = activeTab === 'categories' ? isCategoriesLoading : isLabelsLoading;

  return (
    <div className="max-w-2xl">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-0.5 p-0.5 bg-gray-100 rounded-lg">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'categories'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
            </svg>
            Categories
            <span className="px-1.5 py-0.5 text-[10px] bg-gray-200/80 text-gray-600 rounded-full min-w-[18px] text-center">
              {categories.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('labels')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'labels'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
            Labels
            <span className="px-1.5 py-0.5 text-[10px] bg-gray-200/80 text-gray-600 rounded-full min-w-[18px] text-center">
              {labels.length}
            </span>
          </button>
        </div>

        <button
          onClick={() => activeTab === 'categories' ? handleOpenCategoryModal() : handleOpenLabelModal()}
          className="inline-flex items-center gap-1 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 flex items-center justify-between mb-3">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 ml-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {successMessage && (
        <div className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700 mb-3">
          {successMessage}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex h-32 items-center justify-center">
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </div>
        </div>
      )}

      {/* Categories Tab Content */}
      {!isLoading && activeTab === 'categories' && (
        <div className="rounded-lg bg-white border border-gray-200 overflow-hidden">
          {categories.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-gray-400">No categories yet</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left font-medium text-gray-500 px-3 py-2">Name</th>
                  <th className="text-left font-medium text-gray-500 px-3 py-2">Slug</th>
                  <th className="text-left font-medium text-gray-500 px-3 py-2 hidden sm:table-cell">Description</th>
                  <th className="w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2">
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </td>
                    <td className="px-3 py-2">
                      <code className="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {category.slug}
                      </code>
                    </td>
                    <td className="px-3 py-2 text-gray-500 truncate max-w-[150px] hidden sm:table-cell">
                      {category.description || '—'}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          onClick={() => handleOpenCategoryModal(category)}
                          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setCategoryDeleteTarget(category)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Labels Tab Content */}
      {!isLoading && activeTab === 'labels' && (
        <div className="rounded-lg bg-white border border-gray-200 overflow-hidden">
          {labels.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-gray-400">No special labels yet</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left font-medium text-gray-500 px-3 py-2">Preview</th>
                  <th className="text-left font-medium text-gray-500 px-3 py-2">Slug</th>
                  <th className="text-left font-medium text-gray-500 px-3 py-2">Colors</th>
                  <th className="w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {labels.map((label) => (
                  <tr key={label.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold"
                        style={{
                          backgroundColor: label.background_color,
                          color: label.text_color,
                        }}
                      >
                        {label.name}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <code className="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {label.slug}
                      </code>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <div
                          className="h-4 w-4 rounded border border-gray-200"
                          style={{ backgroundColor: label.background_color }}
                          title={label.background_color}
                        />
                        <div
                          className="h-4 w-4 rounded border border-gray-200"
                          style={{ backgroundColor: label.text_color }}
                          title={label.text_color}
                        />
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          onClick={() => handleOpenLabelModal(label)}
                          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setLabelDeleteTarget(label)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl mx-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              {editingCategory ? 'Edit Category' : 'New Category'}
            </h2>
            <div className="space-y-3">
              <div className="grid gap-2 grid-cols-2">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Name *</label>
                  <input
                    type="text"
                    value={categoryFormData.name}
                    onChange={(e) => handleCategoryNameChange(e.target.value)}
                    className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    placeholder="Day Tours"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Slug *</label>
                  <input
                    type="text"
                    value={categoryFormData.slug}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                    className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 font-mono"
                    placeholder="day-tours"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Description</label>
                <input
                  type="text"
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  placeholder="Optional description..."
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleCloseCategoryModal}
                className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={isCategorySaving}
                className="rounded bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {isCategorySaving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Label Modal */}
      {isLabelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl mx-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              {editingLabel ? 'Edit Label' : 'New Label'}
            </h2>
            
            <div className="space-y-3">
              <div className="grid gap-2 grid-cols-2">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Name *</label>
                  <input
                    type="text"
                    value={labelFormData.name}
                    onChange={(e) => handleLabelNameChange(e.target.value)}
                    className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    placeholder="Featured"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Slug *</label>
                  <input
                    type="text"
                    value={labelFormData.slug}
                    onChange={(e) => setLabelFormData({ ...labelFormData, slug: e.target.value })}
                    className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 font-mono"
                    placeholder="featured"
                  />
                </div>
              </div>

              {/* Preset Colors */}
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Color</label>
                <div className="flex flex-wrap gap-1">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => handlePresetColor(color.bg, color.text)}
                      className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                        labelFormData.background_color === color.bg
                          ? 'border-gray-900 ring-1 ring-gray-900 ring-offset-1'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.bg }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid gap-2 grid-cols-2">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Background</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={labelFormData.background_color}
                      onChange={(e) => setLabelFormData({ ...labelFormData, background_color: e.target.value })}
                      className="h-7 w-7 cursor-pointer rounded border border-gray-300 p-0.5"
                    />
                    <input
                      type="text"
                      value={labelFormData.background_color}
                      onChange={(e) => setLabelFormData({ ...labelFormData, background_color: e.target.value })}
                      className="flex-1 rounded border border-gray-300 px-2 py-1 text-[11px] text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Text</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={labelFormData.text_color}
                      onChange={(e) => setLabelFormData({ ...labelFormData, text_color: e.target.value })}
                      className="h-7 w-7 cursor-pointer rounded border border-gray-300 p-0.5"
                    />
                    <input
                      type="text"
                      value={labelFormData.text_color}
                      onChange={(e) => setLabelFormData({ ...labelFormData, text_color: e.target.value })}
                      className="flex-1 rounded border border-gray-300 px-2 py-1 text-[11px] text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-gray-500">Preview:</span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-semibold"
                  style={{
                    backgroundColor: labelFormData.background_color,
                    color: labelFormData.text_color,
                  }}
                >
                  {labelFormData.name || 'Label'}
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleCloseLabelModal}
                className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLabel}
                disabled={isLabelSaving}
                className="rounded bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {isLabelSaving ? 'Saving...' : editingLabel ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={!!categoryDeleteTarget}
        onClose={() => setCategoryDeleteTarget(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Delete "${categoryDeleteTarget?.name}"? Tours will be unassigned.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={!!labelDeleteTarget}
        onClose={() => setLabelDeleteTarget(null)}
        onConfirm={handleDeleteLabel}
        title="Delete Label"
        message={`Delete "${labelDeleteTarget?.name}"? Tours will have it removed.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
