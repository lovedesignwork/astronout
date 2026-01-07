'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import type { TourCategory } from '@/types';

interface CategoriesSubHeaderProps {
  categories?: TourCategory[];
}

export function CategoriesSubHeader({ categories = [] }: CategoriesSubHeaderProps) {
  const { language } = useLanguage();

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#d6ebff]">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-center px-4 py-2.5 md:px-6 lg:px-8" style={{ backgroundColor: 'rgba(214, 235, 255, 1)' }}>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/${language}/tours?category=${category.slug}`}
              className="text-base font-semibold transition-colors hover:text-[#0033FF]"
              style={{ color: 'rgba(70, 73, 78, 1)' }}
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
