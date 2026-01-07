'use client';

import type { BlockProps } from './registry';

interface ItineraryItem {
  time?: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

interface ItineraryContent {
  items?: ItineraryItem[];
}

export function ItineraryBlock({ block }: BlockProps) {
  const content = block.content as ItineraryContent;
  const items = content.items || [];

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      {block.title && (
        <h2 className="mb-6 text-xl font-bold text-gray-900">{block.title}</h2>
      )}

      <div className="relative pl-8">
        {/* Timeline line */}
        <div className="absolute left-3 top-2 h-[calc(100%-16px)] w-0.5 bg-orange-200" />

        {/* Items */}
        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={index} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-8 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#0033FF' }}>
                {index + 1}
              </div>

              {/* Content */}
              <div className="rounded-lg bg-gray-50 p-4">
                {item.time && (
                  <span className="mb-2 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                    {item.time}
                  </span>
                )}
                <h3 className="text-base font-semibold text-gray-900">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                )}
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="mt-3 rounded-lg"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
