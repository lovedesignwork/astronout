'use client';

import type { BlockProps } from './registry';

interface IncludedExcludedContent {
  included?: string[];
  excluded?: string[];
}

export function IncludedExcludedBlock({ block }: BlockProps) {
  const content = block.content as IncludedExcludedContent;
  const included = content.included || [];
  const excluded = content.excluded || [];

  if (included.length === 0 && excluded.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      {block.title && (
        <h2 className="mb-6 text-xl font-bold text-gray-900">{block.title}</h2>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Included */}
        {included.length > 0 && (
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-green-700">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              What&apos;s Included
            </h3>
            <ul className="space-y-2">
              {included.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
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
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Excluded */}
        {excluded.length > 0 && (
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-red-700">
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
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Not Included
            </h3>
            <ul className="space-y-2">
              {excluded.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
