'use client';

import { useState } from 'react';

interface TourDescriptionProps {
  description: string;
  longDescription?: string;
  wordLimit?: number;
}

export function TourDescription({ description, longDescription, wordLimit = 100 }: TourDescriptionProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Use long description if available, otherwise use short description
  const descriptionToShow = longDescription || description;

  // Truncate description to word limit
  const truncateDescription = (text: string, limit: number) => {
    const words = text.split(/\s+/);
    if (words.length <= limit) return { text, isTruncated: false };
    return { text: words.slice(0, limit).join(' '), isTruncated: true };
  };

  const { text: truncatedDescription, isTruncated: isDescriptionTruncated } = truncateDescription(descriptionToShow, wordLimit);

  if (!descriptionToShow) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: '0px 4px 6px -4px rgba(0, 0, 0, 0.1)' }}>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-[17px] font-semibold text-gray-800">About this tour</h3>
      </div>
      <div className="text-[15px] leading-relaxed text-gray-600">
        {showFullDescription || !isDescriptionTruncated ? (
          <p>{descriptionToShow}</p>
        ) : (
          <p>
            {truncatedDescription}...{' '}
            <button
              onClick={() => setShowFullDescription(true)}
              className="inline text-[#159d37] font-medium hover:underline focus:outline-none"
            >
              read more
            </button>
          </p>
        )}
        {showFullDescription && isDescriptionTruncated && (
          <button
            onClick={() => setShowFullDescription(false)}
            className="mt-2 text-[#159d37] font-medium hover:underline focus:outline-none"
          >
            show less
          </button>
        )}
      </div>
    </div>
  );
}


