'use client';

import type { BlockProps } from './registry';

interface WhatToBringContent {
  items?: string[];
  note?: string;
}

export function WhatToBringBlock({ block }: BlockProps) {
  const content = block.content as WhatToBringContent;
  const items = content.items || [];

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      {block.title && (
        <h2 className="mb-6 text-xl font-bold text-gray-900">{block.title}</h2>
      )}

      <div className="rounded-xl bg-blue-50 p-4">
        <div className="mb-3 flex items-center gap-2 text-blue-700">
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <span className="text-sm font-semibold">Packing List</span>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="flex h-4 w-4 items-center justify-center rounded border border-blue-300 bg-white text-[10px] text-blue-600">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>

        {content.note && (
          <p className="mt-3 text-xs text-blue-700">{content.note}</p>
        )}
      </div>
    </div>
  );
}
