'use client';

import { useState, useEffect, useCallback } from 'react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Language, SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '@/types';

interface UITranslation {
  id: string;
  translation_key: string;
  category: 'booking' | 'navigation' | 'forms' | 'general' | 'errors';
  en: string;
  zh: string | null;
  ru: string | null;
  ko: string | null;
  ja: string | null;
  fr: string | null;
  it: string | null;
  es: string | null;
  id_lang: string | null; // Indonesian - renamed to avoid conflict with id field
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'booking', label: 'Booking' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'forms', label: 'Forms' },
  { value: 'general', label: 'General' },
  { value: 'errors', label: 'Errors' },
];

// Languages excluding English (source language)
const TARGET_LANGUAGES = SUPPORTED_LANGUAGES.filter(l => l !== 'en') as Language[];

export default function TranslationsPage() {
  const [translations, setTranslations] = useState<UITranslation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<UITranslation | null>(null);
  const [formData, setFormData] = useState<Partial<UITranslation>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<UITranslation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // AI Translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());

  const fetchTranslations = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/admin/translations?${params}`);
      const data = await response.json();

      if (data.success) {
        setTranslations(data.translations);
      } else {
        setError(data.error || 'Failed to fetch translations');
      }
    } catch {
      setError('Failed to fetch translations');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Modal handlers
  const handleOpenModal = (translation?: UITranslation) => {
    if (translation) {
      setEditingTranslation(translation);
      setFormData(translation);
    } else {
      setEditingTranslation(null);
      setFormData({
        translation_key: '',
        category: 'general',
        en: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTranslation(null);
    setFormData({});
  };

  const handleSave = async () => {
    if (!formData.translation_key || !formData.en) {
      setError('Translation key and English text are required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const url = editingTranslation
        ? `/api/admin/translations/${editingTranslation.id}`
        : '/api/admin/translations';

      const response = await fetch(url, {
        method: editingTranslation ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(editingTranslation ? 'Translation updated' : 'Translation created');
        handleCloseModal();
        fetchTranslations();
      } else {
        setError(data.error || 'Failed to save translation');
      }
    } catch {
      setError('Failed to save translation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/translations/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Translation deleted');
        setDeleteTarget(null);
        fetchTranslations();
      } else {
        setError(data.error || 'Failed to delete translation');
      }
    } catch {
      setError('Failed to delete translation');
    } finally {
      setIsDeleting(false);
    }
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === translations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(translations.map(t => t.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // AI Translation - Single
  const handleAITranslate = async (translation: UITranslation) => {
    setTranslatingIds(prev => new Set(prev).add(translation.id));
    setError(null);

    try {
      const response = await fetch('/api/admin/translations/ai-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: [{ key: translation.translation_key, en: translation.en }],
          targetLanguages: TARGET_LANGUAGES,
        }),
      });

      const data = await response.json();

      if (data.success && data.translations[translation.translation_key]) {
        const translated = data.translations[translation.translation_key];
        
        // Update the translation in database
        const updateResponse = await fetch(`/api/admin/translations/${translation.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            zh: translated.zh || translation.zh,
            ru: translated.ru || translation.ru,
            ko: translated.ko || translation.ko,
            ja: translated.ja || translation.ja,
            fr: translated.fr || translation.fr,
            it: translated.it || translation.it,
            es: translated.es || translation.es,
            id: translated.id || translation.id,
          }),
        });

        if (updateResponse.ok) {
          showSuccess('Translation completed');
          fetchTranslations();
        }
      } else {
        setError(data.error || 'Translation failed');
      }
    } catch {
      setError('Failed to translate');
    } finally {
      setTranslatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(translation.id);
        return newSet;
      });
    }
  };

  // AI Translation - Bulk
  const handleBulkAITranslate = async () => {
    if (selectedIds.size === 0) return;

    setIsTranslating(true);
    setError(null);

    const selectedTranslations = translations.filter(t => selectedIds.has(t.id));
    const texts = selectedTranslations.map(t => ({ key: t.translation_key, en: t.en }));

    try {
      const response = await fetch('/api/admin/translations/ai-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts,
          targetLanguages: TARGET_LANGUAGES,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update each translation
        const updatePromises = selectedTranslations.map(async (t) => {
          const translated = data.translations[t.translation_key];
          if (!translated) return;

          return fetch(`/api/admin/translations/${t.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              zh: translated.zh || t.zh,
              ru: translated.ru || t.ru,
              ko: translated.ko || t.ko,
              ja: translated.ja || t.ja,
              fr: translated.fr || t.fr,
              it: translated.it || t.it,
              es: translated.es || t.es,
              id: translated.id || t.id,
            }),
          });
        });

        await Promise.all(updatePromises);
        showSuccess(`Translated ${selectedIds.size} items`);
        setSelectedIds(new Set());
        fetchTranslations();
      } else {
        setError(data.error || 'Bulk translation failed');
      }
    } catch {
      setError('Failed to translate');
    } finally {
      setIsTranslating(false);
    }
  };

  // Inline edit handler
  const handleInlineEdit = async (translation: UITranslation, lang: Language, value: string) => {
    try {
      const response = await fetch(`/api/admin/translations/${translation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [lang]: value }),
      });

      if (response.ok) {
        fetchTranslations();
      }
    } catch {
      setError('Failed to update');
    }
  };

  // Check if a translation has missing languages
  const getMissingLanguages = (translation: UITranslation): Language[] => {
    const missing: Language[] = [];
    TARGET_LANGUAGES.forEach(lang => {
      if (!translation[lang as keyof UITranslation]) {
        missing.push(lang);
      }
    });
    return missing;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Translations</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage UI text translations for all languages</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Translation
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-gray-400 focus:outline-none"
        >
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keys or text..."
            className="w-48 rounded-lg border border-gray-200 bg-white pl-8 pr-3 py-1.5 text-xs text-gray-700 focus:border-gray-400 focus:outline-none"
          />
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-0.5 p-0.5 bg-gray-100 rounded-lg ml-auto">
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                selectedLanguage === lang
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 ml-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {successMessage}
        </div>
      )}

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-indigo-50 px-3 py-2">
          <span className="text-xs font-medium text-indigo-700">
            {selectedIds.size} selected
          </span>
          <button
            onClick={handleBulkAITranslate}
            disabled={isTranslating}
            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isTranslating ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Translating...
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                </svg>
                AI Translate Selected
              </>
            )}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-indigo-600 hover:text-indigo-800"
          >
            Clear
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex h-48 items-center justify-center">
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading translations...
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <div className="rounded-lg bg-white border border-gray-200 overflow-hidden">
          {translations.length === 0 ? (
            <div className="py-12 text-center">
              <svg className="mx-auto h-8 w-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">No translations found</p>
              <button
                onClick={() => handleOpenModal()}
                className="mt-3 text-xs text-indigo-600 hover:text-indigo-800"
              >
                Add your first translation
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="w-8 px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === translations.length && translations.length > 0}
                        onChange={handleSelectAll}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="text-left font-medium text-gray-500 px-3 py-2">Key</th>
                    <th className="text-left font-medium text-gray-500 px-3 py-2 w-20">Category</th>
                    <th className="text-left font-medium text-gray-500 px-3 py-2">
                      {selectedLanguage === 'en' ? 'English (Source)' : LANGUAGE_NAMES[selectedLanguage]}
                    </th>
                    <th className="w-24 px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {translations.map((translation) => {
                    const missingLangs = getMissingLanguages(translation);
                    const currentValue = translation[selectedLanguage as keyof UITranslation] as string | null;
                    const isTranslatingThis = translatingIds.has(translation.id);

                    return (
                      <tr key={translation.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(translation.id)}
                            onChange={() => handleSelectOne(translation.id)}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <code className="text-[11px] text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                              {translation.translation_key}
                            </code>
                            {missingLangs.length > 0 && (
                              <span className="text-amber-500" title={`Missing: ${missingLangs.join(', ')}`}>
                                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 capitalize">
                            {translation.category}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {selectedLanguage === 'en' ? (
                            <span className="text-gray-900">{translation.en}</span>
                          ) : (
                            <input
                              type="text"
                              defaultValue={currentValue || ''}
                              onBlur={(e) => {
                                if (e.target.value !== (currentValue || '')) {
                                  handleInlineEdit(translation, selectedLanguage, e.target.value);
                                }
                              }}
                              placeholder={translation.en}
                              className={`w-full rounded border px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100 ${
                                currentValue ? 'border-gray-200 text-gray-900' : 'border-amber-200 bg-amber-50/50 text-gray-400'
                              }`}
                            />
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-end gap-1">
                            {missingLangs.length > 0 && (
                              <button
                                onClick={() => handleAITranslate(translation)}
                                disabled={isTranslatingThis}
                                className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded disabled:opacity-50"
                                title="AI Translate"
                              >
                                {isTranslatingThis ? (
                                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                ) : (
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                                  </svg>
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenModal(translation)}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                              title="Edit"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteTarget(translation)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              {editingTranslation ? 'Edit Translation' : 'New Translation'}
            </h2>

            <div className="space-y-4">
              {/* Key and Category */}
              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Key *</label>
                  <input
                    type="text"
                    value={formData.translation_key || ''}
                    onChange={(e) => setFormData({ ...formData, translation_key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    disabled={!!editingTranslation}
                    className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 font-mono focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50"
                    placeholder="my_translation_key"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Category *</label>
                  <select
                    value={formData.category || 'general'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as UITranslation['category'] })}
                    className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* English (Required) */}
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  English (Source) *
                </label>
                <input
                  type="text"
                  value={formData.en || ''}
                  onChange={(e) => setFormData({ ...formData, en: e.target.value })}
                  className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  placeholder="English text"
                />
              </div>

              {/* Other Languages */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[11px] font-medium text-gray-600">Other Languages</label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!formData.en) {
                        setError('Enter English text first');
                        return;
                      }
                      setIsSaving(true);
                      try {
                        const response = await fetch('/api/admin/translations/ai-translate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            texts: [{ key: 'temp', en: formData.en }],
                            targetLanguages: TARGET_LANGUAGES,
                          }),
                        });
                        const data = await response.json();
                        if (data.success && data.translations.temp) {
                          const t = data.translations.temp;
                          setFormData({
                            ...formData,
                            zh: t.zh || formData.zh,
                            ru: t.ru || formData.ru,
                            ko: t.ko || formData.ko,
                            ja: t.ja || formData.ja,
                            fr: t.fr || formData.fr,
                            it: t.it || formData.it,
                            es: t.es || formData.es,
                            id: t.id || formData.id,
                          });
                          showSuccess('AI translation complete');
                        }
                      } catch {
                        setError('Translation failed');
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    disabled={isSaving || !formData.en}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                    </svg>
                    Auto-fill with AI
                  </button>
                </div>

                <div className="grid gap-3 grid-cols-2">
                  {TARGET_LANGUAGES.map(lang => (
                    <div key={lang}>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">
                        {LANGUAGE_NAMES[lang]}
                      </label>
                      <input
                        type="text"
                        value={(formData[lang as keyof typeof formData] as string) || ''}
                        onChange={(e) => setFormData({ ...formData, [lang]: e.target.value })}
                        className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-xs text-gray-900 focus:border-gray-400 focus:outline-none"
                        placeholder={formData.en || `${LANGUAGE_NAMES[lang]} translation`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-4">
              <button
                onClick={handleCloseModal}
                className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : editingTranslation ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Translation"
        message={`Delete "${deleteTarget?.translation_key}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}



