'use client';

import { Container } from '@/components/layout/Container';
import type { BlockProps } from './registry';

interface HeroContent {
  subtitle?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  location?: string;
  duration?: string;
  badges?: string[];
}

export function HeroBlock({ block }: BlockProps) {
  const content = block.content as HeroContent;

  return (
    <div className="relative min-h-[400px] overflow-hidden bg-gray-900 md:min-h-[500px]">
      {/* Background Image */}
      {content.imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${content.imageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-gray-900/30" />
        </div>
      )}

      {/* Content */}
      <Container className="relative flex min-h-[400px] flex-col justify-end pb-12 pt-20 md:min-h-[500px]">
        {/* Badges */}
        {content.badges && content.badges.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {content.badges.map((badge, index) => (
              <span
                key={index}
                className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: '#0033FF' }}
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="mb-4 max-w-3xl text-3xl font-bold text-white md:text-5xl lg:text-6xl">
          {block.title}
        </h1>

        {/* Subtitle */}
        {content.subtitle && (
          <p className="mb-6 max-w-2xl text-lg text-gray-200 md:text-xl">
            {content.subtitle}
          </p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 md:gap-6">
          {/* Rating */}
          {content.rating && (
            <div className="flex items-center gap-1">
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold text-white">{content.rating}</span>
              {content.reviewCount && (
                <span>({content.reviewCount} reviews)</span>
              )}
            </div>
          )}

          {/* Location */}
          {content.location && (
            <div className="flex items-center gap-1">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{content.location}</span>
            </div>
          )}

          {/* Duration */}
          {content.duration && (
            <div className="flex items-center gap-1">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{content.duration}</span>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}





