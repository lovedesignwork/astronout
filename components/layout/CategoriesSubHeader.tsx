'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { TourCategory } from '@/types';

export function CategoriesSubHeader() {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<TourCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (loading || categories.length === 0) {
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

