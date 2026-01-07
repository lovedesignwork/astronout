'use client';

import { useState, useEffect } from 'react';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { formatCurrency } from '@/lib/utils';
import type { FlatPerPersonPricing } from '@/types';

interface FlatPricingSelectorProps {
  config: FlatPerPersonPricing;
}

export function FlatPricingSelector({ config }: FlatPricingSelectorProps) {
  const { tour, selectedDate, selectedTime, updateTourSelection } = useBookingContext();
  const [pax, setPax] = useState(1);

  const minPax = config.min_pax || 1;
  const maxPax = config.max_pax || 20;

  useEffect(() => {
    if (!tour || !selectedDate) return;

    const totalRetail = pax * config.retail_price;
    const totalNet = pax * config.net_price;

    updateTourSelection({
      tourId: tour.id,
      tourSlug: tour.slug,
      tourName: tour.slug, // Will be replaced with actual name
      date: selectedDate,
      time: selectedTime || undefined,
      pax: { total: pax },
      priceBreakdown: [
        {
          label: 'Per Person',
          quantity: pax,
          unit_price: config.retail_price,
          amount: totalRetail,
        },
      ],
      totalRetail,
      totalNet,
      currency: config.currency,
    });
  }, [pax, selectedDate, selectedTime, tour, config, updateTourSelection]);

  const handleIncrement = () => {
    if (pax < maxPax) setPax(pax + 1);
  };

  const handleDecrement = () => {
    if (pax > minPax) setPax(pax - 1);
  };

  return (
    <div className="rounded-xl bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Price per person</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(config.retail_price, config.currency)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Pax Selector */}
        <div className="flex items-center justify-between rounded-lg bg-white p-4">
          <div>
            <p className="font-medium text-gray-900">Number of Guests</p>
            <p className="text-sm text-gray-500">
              {minPax} - {maxPax} guests
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDecrement}
              disabled={pax <= minPax}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="w-12 text-center text-xl font-semibold">{pax}</span>
            <button
              onClick={handleIncrement}
              disabled={pax >= maxPax}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Total */}
        <div className="rounded-lg p-4" style={{ backgroundColor: '#e6f0ff' }}>
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Total</span>
            <span className="text-2xl font-bold" style={{ color: '#0033FF' }}>
              {formatCurrency(pax * config.retail_price, config.currency)}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {pax} × {formatCurrency(config.retail_price, config.currency)}
          </p>
        </div>
      </div>
    </div>
  );
}




