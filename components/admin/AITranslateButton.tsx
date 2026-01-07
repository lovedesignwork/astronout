'use client';

import { useState } from 'react';
import { Language, SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '@/types';

interface AITranslateButtonProps {
  // The English source text to translate
  sourceText: string;
  // Tour ID for the API endpoint
  tourId: string;
  // Optional block ID if translating block content
  blockId?: string;
  // Callback when translations are complete
  onTranslationsComplete: (translations: Record<Language, string>) => void;
  // Optional: specific languages to translate to (defaults to all except en)
  targetLanguages?: Language[];
  // Optional: smaller variant
  size?: 'sm' | 'md';
  // Optional: whether to save directly to database
  saveToDatabase?: boolean;
  // Optional: custom label
  label?: string;
  // Disabled state
  disabled?: boolean;
}

export function AITranslateButton({
  sourceText,
  tourId,
  blockId,
  onTranslationsComplete,
  targetLanguages,
  size = 'sm',
  saveToDatabase = false,
  label,
  disabled = false,
}: AITranslateButtonProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      setError('No text to translate');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/tours/${tourId}/ai-translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          blockId,
          targetLanguages: targetLanguages || SUPPORTED_LANGUAGES.filter(l => l !== 'en'),
          saveToDatabase,
        }),
      });

      const data = await response.json();

      if (data.success && data.translations) {
        // Convert the translations object to the expected format
        const translations: Record<Language, string> = { en: sourceText } as Record<Language, string>;
        
        Object.keys(data.translations).forEach(lang => {
          if (lang !== 'en' && typeof data.translations[lang] === 'string') {
            translations[lang as Language] = data.translations[lang];
          }
        });

        onTranslationsComplete(translations);
      } else {
        setError(data.error || 'Translation failed');
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      setError('Failed to translate');
      setTimeout(() => setError(null), 5000);
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-1 text-[11px] gap-1' 
    : 'px-3 py-1.5 text-xs gap-1.5';

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleTranslate}
        disabled={isTranslating || disabled || !sourceText.trim()}
        className={`inline-flex items-center rounded-md font-medium transition-colors
          ${sizeClasses}
          ${isTranslating 
            ? 'bg-indigo-100 text-indigo-400 cursor-wait' 
            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title={disabled ? 'Enter text first' : 'Translate to all languages using AI'}
      >
        {isTranslating ? (
          <>
            <svg className={`${iconSize} animate-spin`} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Translating...</span>
          </>
        ) : (
          <>
            <svg className={iconSize} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
            </svg>
            <span>{label || 'AI Translate'}</span>
          </>
        )}
      </button>

      {/* Error tooltip */}
      {error && (
        <div className="absolute left-0 top-full mt-1 z-10 rounded-md bg-red-50 px-2 py-1 text-[10px] text-red-600 whitespace-nowrap shadow-sm border border-red-100">
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Simplified version for translating within a modal/form context
 * Shows translations in a dropdown preview
 */
interface AITranslateWithPreviewProps {
  sourceText: string;
  tourId: string;
  currentTranslations?: Partial<Record<Language, string>>;
  onTranslationsChange: (translations: Record<Language, string>) => void;
}

export function AITranslateWithPreview({
  sourceText,
  tourId,
  currentTranslations = {},
  onTranslationsChange,
}: AITranslateWithPreviewProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [translations, setTranslations] = useState<Record<Language, string>>({
    en: sourceText,
    ...currentTranslations,
  } as Record<Language, string>);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);

    try {
      const response = await fetch(`/api/admin/tours/${tourId}/ai-translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          targetLanguages: SUPPORTED_LANGUAGES.filter(l => l !== 'en'),
        }),
      });

      const data = await response.json();

      if (data.success && data.translations) {
        const newTranslations: Record<Language, string> = { en: sourceText } as Record<Language, string>;
        
        Object.keys(data.translations).forEach(lang => {
          if (typeof data.translations[lang] === 'string') {
            newTranslations[lang as Language] = data.translations[lang];
          }
        });

        setTranslations(newTranslations);
        onTranslationsChange(newTranslations);
        setShowPreview(true);
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const targetLangs = SUPPORTED_LANGUAGES.filter(l => l !== 'en') as Language[];
  const missingCount = targetLangs.filter(l => !translations[l]).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleTranslate}
          disabled={isTranslating || !sourceText.trim()}
          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50"
        >
          {isTranslating ? (
            <>
              <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Translating...
            </>
          ) : (
            <>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
              </svg>
              Translate to all
            </>
          )}
        </button>

        {missingCount > 0 && (
          <span className="text-[10px] text-amber-600">
            {missingCount} languages missing
          </span>
        )}

        {missingCount === 0 && Object.keys(translations).length > 1 && (
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-[10px] text-gray-500 hover:text-gray-700"
          >
            {showPreview ? 'Hide' : 'Show'} translations
          </button>
        )}
      </div>

      {/* Translation Preview */}
      {showPreview && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-2 space-y-1.5">
          {targetLangs.map(lang => (
            <div key={lang} className="flex items-start gap-2 text-[11px]">
              <span className="w-6 shrink-0 font-medium text-gray-500 uppercase">{lang}</span>
              <input
                type="text"
                value={translations[lang] || ''}
                onChange={(e) => {
                  const updated = { ...translations, [lang]: e.target.value };
                  setTranslations(updated);
                  onTranslationsChange(updated);
                }}
                placeholder={`${LANGUAGE_NAMES[lang]} translation`}
                className="flex-1 rounded border border-gray-200 px-2 py-0.5 text-[11px] text-gray-700 focus:border-gray-400 focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



