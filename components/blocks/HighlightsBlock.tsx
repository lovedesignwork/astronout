'use client';

import type { BlockProps } from './registry';

interface HighlightsContent {
  items?: string[];
  columns?: number;
}

export function HighlightsBlock({ block }: BlockProps) {
  const content = block.content as HighlightsContent;
  const items = content.items || [];
  const columns = content.columns || 2;

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      {block.title && (
        <h2 className="mb-6 text-xl font-bold text-gray-900">{block.title}</h2>
      )}

      <div
        className={`grid gap-3 ${
          columns === 3
            ? 'md:grid-cols-3'
            : columns === 4
            ? 'md:grid-cols-4'
            : 'md:grid-cols-2'
        }`}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-lg bg-gray-50 p-3"
          >
            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#e6f0ff]">
              <svg
                className="h-3 w-3 text-[#0033FF]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-sm text-gray-700">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
