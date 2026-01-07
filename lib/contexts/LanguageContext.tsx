'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Language, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  languages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  initialLang: Language;
}

export function LanguageProvider({ children, initialLang }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(initialLang);
  const router = useRouter();
  const pathname = usePathname();

  const setLanguage = (newLang: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(newLang)) return;

    // Update state
    setLanguageState(newLang);

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', newLang);
    }

    // Persist to cookie
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000; SameSite=Lax`;

    // Navigate to new language URL
    const currentPath = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '');
    const newPath = `/${newLang}${currentPath || ''}`;
    router.push(newPath);
  };

  useEffect(() => {
    // Sync from localStorage on mount (backup only, URL is source of truth)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('preferred-language') as Language | null;
      if (stored && SUPPORTED_LANGUAGES.includes(stored) && stored !== initialLang) {
        // Don't auto-redirect, just note the preference
        localStorage.setItem('preferred-language', initialLang);
      }
    }
  }, [initialLang]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}




