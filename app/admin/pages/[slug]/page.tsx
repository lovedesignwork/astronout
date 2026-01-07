'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Language, SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '@/types';

interface PageTranslation {
  id: string;
  page_id: string;
  language: Language;
  title: string;
  content: Record<string, unknown>;
  meta_title: string | null;
  meta_description: string | null;
}

interface StaticPageData {
  id: string;
  slug: string;
  status: 'draft' | 'published';
  page_type: string;
  translations: PageTranslation[];
}

interface PageEditorProps {
  params: Promise<{ slug: string }>;
}

export default function PageEditorPage({ params }: PageEditorProps) {
  const { slug } = use(params);
  const [page, setPage] = useState<StaticPageData | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state for current language
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    meta_title: '',
    meta_description: '',
  });

  useEffect(() => {
    fetchPage();
  }, [slug]);

  useEffect(() => {
    if (page) {
      loadTranslation(activeLanguage);
    }
  }, [page, activeLanguage]);

  const fetchPage = async () => {
    try {
      const response = await fetch(`/api/admin/static-pages/${slug}`);
      const data = await response.json();
      if (data.success) {
        setPage(data.page);
      } else {
        setError(data.error || 'Failed to fetch page');
      }
    } catch {
      setError('Failed to fetch page');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTranslation = (lang: Language) => {
    const translation = page?.translations.find(t => t.language === lang);
    if (translation) {
      setFormData({
        title: translation.title,
        content: JSON.stringify(translation.content, null, 2),
        meta_title: translation.meta_title || '',
        meta_description: translation.meta_description || '',
      });
    } else {
      // Load from English as fallback for new translations
      const enTranslation = page?.translations.find(t => t.language === 'en');
      setFormData({
        title: enTranslation?.title || '',
        content: enTranslation ? JSON.stringify(enTranslation.content, null, 2) : '{}',
        meta_title: '',
        meta_description: '',
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Parse content JSON
      let contentObj;
      try {
        contentObj = JSON.parse(formData.content);
      } catch {
        setError('Invalid JSON in content field');
        setIsSaving(false);
        return;
      }

      const response = await fetch(`/api/admin/static-pages/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          translations: {
            [activeLanguage]: {
              title: formData.title,
              content: contentObj,
              meta_title: formData.meta_title || null,
              meta_description: formData.meta_description || null,
            },
          },
        }),
      });

      if (response.ok) {
        setSuccessMessage('Page saved successfully!');
        // Refresh page data
        await fetchPage();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save page');
      }
    } catch {
      setError('Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  const hasTranslation = (lang: Language) => {
    return page?.translations.some(t => t.language === lang);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading page...
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold text-gray-900">Page not found</h2>
        <p className="mt-2 text-gray-600">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/admin/pages" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
          ← Back to pages
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/pages"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {page.translations.find(t => t.language === 'en')?.title || page.slug}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              /{page.slug} • {page.page_type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/en/${page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Preview
          </a>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* Language Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLanguage(lang)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeLanguage === lang
                  ? 'text-primary-600 border-b-2 border-primary-600 -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {LANGUAGE_NAMES[lang]}
              {hasTranslation(lang) ? (
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Form */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Page Content</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    placeholder="Enter page title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Content (JSON)
                  </label>
                  <textarea
                    rows={20}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none"
                    placeholder="{}"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Edit the page content in JSON format. The structure depends on the page type.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Sidebar */}
        <div className="space-y-6">
          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">SEO Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    placeholder="SEO title"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.meta_title.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none"
                    placeholder="SEO description"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.meta_description.length}/160 characters
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Translation Status */}
          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Translation Status</h3>
              <div className="space-y-2">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <div key={lang} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-gray-600">{LANGUAGE_NAMES[lang]}</span>
                    {hasTranslation(lang) ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Complete
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Missing
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




