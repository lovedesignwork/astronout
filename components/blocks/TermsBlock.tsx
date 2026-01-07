'use client';

import { useState } from 'react';
import type { BlockProps } from './registry';

interface TermsSection {
  title: string;
  content: string;
}

interface TermsContent {
  sections?: TermsSection[];
  cancellationPolicy?: string;
  refundPolicy?: string;
}

export function TermsBlock({ block }: BlockProps) {
  const content = block.content as TermsContent;
  const sections = content.sections || [];
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  // Build sections array including cancellation and refund policies
  const allSections: TermsSection[] = [...sections];
  
  if (content.cancellationPolicy) {
    allSections.push({
      title: 'Cancellation Policy',
      content: content.cancellationPolicy,
    });
  }
  
  if (content.refundPolicy) {
    allSections.push({
      title: 'Refund Policy',
      content: content.refundPolicy,
    });
  }

  if (allSections.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      {block.title && (
        <h2 className="mb-6 text-xl font-bold text-gray-900">{block.title}</h2>
      )}

      <div className="space-y-2">
        {allSections.map((section, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg border border-gray-100"
          >
            <button
              onClick={() =>
                setExpandedSection(expandedSection === index ? null : index)
              }
              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
            >
              <span className="text-sm font-semibold text-gray-900">
                {section.title}
              </span>
              <svg
                className={`h-5 w-5 text-gray-400 transition-transform ${
                  expandedSection === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {expandedSection === index && (
              <div className="border-t border-gray-100 bg-gray-50 px-4 pb-4 pt-3">
                <p className="text-sm text-gray-600">{section.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
