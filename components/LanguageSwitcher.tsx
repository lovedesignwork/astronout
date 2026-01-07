'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { LANGUAGE_NAMES, Language } from '@/types';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export function LanguageSwitcher() {
  const { language, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <GlobeAltIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{LANGUAGE_NAMES[language]}</span>
        <span className="sm:hidden">{language.toUpperCase()}</span>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 origin-top-right rounded-lg bg-white py-2 shadow-lg ring-1 ring-black/5">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageSelect(lang)}
              className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors ${
                language === lang
                  ? 'bg-[#e6f0ff] text-[#0033FF]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{LANGUAGE_NAMES[lang]}</span>
              {language === lang && (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}





