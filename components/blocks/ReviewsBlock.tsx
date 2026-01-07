'use client';

import type { BlockProps } from './registry';

interface Review {
  author: string;
  rating: number;
  date?: string;
  comment: string;
  avatar?: string;
  country?: string;
}

interface ReviewsContent {
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
}

export function ReviewsBlock({ block }: BlockProps) {
  const content = block.content as ReviewsContent;
  const reviews = content.reviews || [];

  if (reviews.length === 0) return null;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          {block.title && (
            <h2 className="text-xl font-bold text-gray-900">{block.title}</h2>
          )}
          {content.averageRating && (
            <div className="mt-2 flex items-center gap-2">
              {renderStars(Math.round(content.averageRating))}
              <span className="font-semibold text-gray-900">
                {content.averageRating.toFixed(1)}
              </span>
              {content.totalReviews && (
                <span className="text-sm text-gray-500">
                  ({content.totalReviews} reviews)
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="rounded-xl bg-gray-50 p-4"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                {review.avatar ? (
                  <img
                    src={review.avatar}
                    alt={review.author}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0ff] text-sm font-semibold text-[#0033FF]">
                    {review.author.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{review.author}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {review.country && <span>{review.country}</span>}
                    {review.date && (
                      <>
                        {review.country && <span>•</span>}
                        <span>{review.date}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {renderStars(review.rating)}
            </div>
            <p className="text-sm text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
