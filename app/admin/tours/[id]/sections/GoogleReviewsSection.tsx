'use client';

import { useState } from 'react';
import type { GoogleReview } from '@/types';

interface GoogleReviewsSectionProps {
  tourId: string;
  enabled: boolean;
  reviews: GoogleReview[];
  rating: number | null;
  reviewCount: number | null;
  onUpdate: (data: {
    google_reviews_enabled?: boolean;
    google_reviews?: GoogleReview[];
    google_rating?: number | null;
    google_review_count?: number | null;
  }) => void;
  onMessage: (type: 'success' | 'error', text: string) => void;
}

export function GoogleReviewsSection({
  tourId,
  enabled,
  reviews: initialReviews,
  rating: initialRating,
  reviewCount: initialReviewCount,
  onUpdate,
  onMessage,
}: GoogleReviewsSectionProps) {
  const [reviews, setReviews] = useState<GoogleReview[]>(initialReviews);
  const [rating, setRating] = useState(initialRating || 0);
  const [reviewCount, setReviewCount] = useState(initialReviewCount || 0);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleToggle = async (newEnabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ google_reviews_enabled: newEnabled }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdate({ google_reviews_enabled: newEnabled });
      }
    } catch {
      onMessage('error', 'Failed to update');
    }
  };

  const handleAddReview = (review: Omit<GoogleReview, 'id'>) => {
    const newReview: GoogleReview = {
      id: `review-${Date.now()}`,
      ...review,
    };
    setReviews([...reviews, newReview]);
    setShowAddForm(false);
  };

  const handleRemoveReview = (id: string) => {
    setReviews(reviews.filter(r => r.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          google_reviews: reviews,
          google_rating: rating,
          google_review_count: reviewCount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdate({
          google_reviews: reviews,
          google_rating: rating,
          google_review_count: reviewCount,
        });
        onMessage('success', 'Reviews saved');
      } else {
        onMessage('error', data.error || 'Failed to save');
      }
    } catch {
      onMessage('error', 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Google Reviews</h2>
          <p className="mt-1 text-sm text-gray-500">Customer reviews and ratings</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{enabled ? 'Enabled' : 'Disabled'}</span>
          <button
            type="button"
            onClick={() => handleToggle(!enabled)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              enabled ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Overall Rating */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Overall Rating
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="h-10 w-24 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 transition-colors focus:border-gray-400 focus:outline-none"
              />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`h-5 w-5 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Total Review Count
            </label>
            <input
              type="number"
              min="0"
              value={reviewCount}
              onChange={(e) => setReviewCount(Number(e.target.value))}
              className="h-10 w-32 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 transition-colors focus:border-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Reviews List */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Individual Reviews ({reviews.length})
            </label>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Review
            </button>
          </div>

          {reviews.length > 0 && (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <span className="font-medium text-gray-900">{review.author}</span>
                      <div className="mt-1 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-3.5 w-3.5 ${star <= review.rating ? 'text-amber-400' : 'text-gray-200'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-2 text-xs text-gray-400">{review.date}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveReview(review.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          )}

          {showAddForm && (
            <ReviewForm
              onAdd={handleAddReview}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end border-t border-gray-100 pt-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex h-9 items-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Save Reviews
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Review Form Component
interface ReviewFormProps {
  onAdd: (review: Omit<GoogleReview, 'id'>) => void;
  onCancel: () => void;
}

function ReviewForm({ onAdd, onCancel }: ReviewFormProps) {
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = () => {
    if (!author.trim() || !comment.trim()) return;
    onAdd({
      author: author.trim(),
      rating,
      comment: comment.trim(),
      date,
    });
  };

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Reviewer Name</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-gray-400 focus:outline-none"
            placeholder="John D."
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>
      </div>
      
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-0.5"
            >
              <svg
                className={`h-6 w-6 ${star <= rating ? 'text-amber-400' : 'text-gray-200'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Review Text</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
          placeholder="Write the review..."
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-8 rounded-lg px-3 text-xs font-medium text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!author.trim() || !comment.trim()}
          className="h-8 rounded-lg bg-gray-900 px-3 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Add Review
        </button>
      </div>
    </div>
  );
}
