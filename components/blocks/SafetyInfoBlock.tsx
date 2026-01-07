'use client';

import type { BlockProps } from './registry';

interface SafetyInfoContent {
  items?: string[];
  warnings?: string[];
  restrictions?: string[];
}

export function SafetyInfoBlock({ block }: BlockProps) {
  const content = block.content as SafetyInfoContent;
  const items = content.items || [];
  const warnings = content.warnings || [];
  const restrictions = content.restrictions || [];

  if (items.length === 0 && warnings.length === 0 && restrictions.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      {block.title && (
        <h2 className="mb-6 text-xl font-bold text-gray-900">{block.title}</h2>
      )}

      <div className="space-y-4">
        {/* Safety Guidelines */}
        {items.length > 0 && (
          <div className="rounded-xl bg-green-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-700">
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Safety Guidelines
            </h3>
            <ul className="space-y-1.5">
              {items.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="rounded-xl bg-yellow-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-yellow-700">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Important Warnings
            </h3>
            <ul className="space-y-1.5">
              {warnings.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Restrictions */}
        {restrictions.length > 0 && (
          <div className="rounded-xl bg-red-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-700">
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
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              Restrictions
            </h3>
            <ul className="space-y-1.5">
              {restrictions.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
