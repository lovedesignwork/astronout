'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewTourPage() {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [pricingEngine, setPricingEngine] = useState<'flat_per_person' | 'adult_child' | 'seat_based'>('flat_per_person');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, pricingEngine }),
      });

      const data = await response.json();

      if (data.success) {
        // Use tour_number for the URL (short, readable IDs like "001", "002")
        router.push(`/admin/tours/${data.tour.tour_number || data.tour.id}`);
      } else {
        setError(data.error || 'Failed to create tour');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/tours"
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Tour</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tour Slug *
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="phi-phi-islands-tour"
            />
            <p className="mt-1 text-sm text-gray-500">
              URL-friendly identifier (lowercase, hyphens only)
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Pricing Engine *
            </label>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  value: 'flat_per_person',
                  label: 'Flat Per Person',
                  description: 'Single price for all guests',
                  icon: '👤',
                },
                {
                  value: 'adult_child',
                  label: 'Adult/Child',
                  description: 'Different prices for adults and children',
                  icon: '👨‍👧',
                },
                {
                  value: 'seat_based',
                  label: 'Seat Based',
                  description: 'Different seat types with prices',
                  icon: '💺',
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPricingEngine(option.value as typeof pricingEngine)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    pricingEngine === option.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <p className="mt-2 font-medium text-gray-900">{option.label}</p>
                  <p className="mt-1 text-sm text-gray-500">{option.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !slug}
            className="flex-1 rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Tour'}
          </button>
        </div>
      </form>
    </div>
  );
}
