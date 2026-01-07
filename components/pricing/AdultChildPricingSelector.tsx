'use client';

import { useState, useEffect } from 'react';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { formatCurrency } from '@/lib/utils';
import type { AdultChildPricing } from '@/types';

interface AdultChildPricingSelectorProps {
  config: AdultChildPricing;
}

export function AdultChildPricingSelector({ config }: AdultChildPricingSelectorProps) {
  const { tour, selectedDate, selectedTime, updateTourSelection } = useBookingContext();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const minPax = config.min_pax || 1;
  const maxPax = config.max_pax || 20;
  const childAgeMax = config.child_age_max || 12;

  useEffect(() => {
    if (!tour || !selectedDate) return;

    const adultTotal = adults * config.adult_retail_price;
    const childTotal = children * config.child_retail_price;
    const totalRetail = adultTotal + childTotal;

    const adultNet = adults * config.adult_net_price;
    const childNet = children * config.child_net_price;
    const totalNet = adultNet + childNet;

    const priceBreakdown = [];
    if (adults > 0) {
      priceBreakdown.push({
        label: 'Adult',
        quantity: adults,
        unit_price: config.adult_retail_price,
        amount: adultTotal,
      });
    }
    if (children > 0) {
      priceBreakdown.push({
        label: `Child (0-${childAgeMax})`,
        quantity: children,
        unit_price: config.child_retail_price,
        amount: childTotal,
      });
    }

    updateTourSelection({
      tourId: tour.id,
      tourSlug: tour.slug,
      tourName: tour.slug,
      date: selectedDate,
      time: selectedTime || undefined,
      pax: { adult: adults, child: children, total: adults + children },
      priceBreakdown,
      totalRetail,
      totalNet,
      currency: config.currency,
    });
  }, [adults, children, selectedDate, selectedTime, tour, config, childAgeMax, updateTourSelection]);

  const totalPax = adults + children;

  return (
    <div className="rounded-xl bg-gray-50 p-6">
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-white p-4 text-center">
          <p className="text-sm text-gray-500">Adult Price</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(config.adult_retail_price, config.currency)}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 text-center">
          <p className="text-sm text-gray-500">Child Price (0-{childAgeMax})</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(config.child_retail_price, config.currency)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Adults Selector */}
        <div className="flex items-center justify-between rounded-lg bg-white p-4">
          <div>
            <p className="font-medium text-gray-900">Adults</p>
            <p className="text-sm text-gray-500">Age 13+</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAdults(Math.max(1, adults - 1))}
              disabled={adults <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="w-12 text-center text-xl font-semibold">{adults}</span>
            <button
              onClick={() => setAdults(Math.min(maxPax - children, adults + 1))}
              disabled={totalPax >= maxPax}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Children Selector */}
        <div className="flex items-center justify-between rounded-lg bg-white p-4">
          <div>
            <p className="font-medium text-gray-900">Children</p>
            <p className="text-sm text-gray-500">Age 0-{childAgeMax}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setChildren(Math.max(0, children - 1))}
              disabled={children <= 0}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="w-12 text-center text-xl font-semibold">{children}</span>
            <button
              onClick={() => setChildren(Math.min(maxPax - adults, children + 1))}
              disabled={totalPax >= maxPax}
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
              {formatCurrency(
                adults * config.adult_retail_price + children * config.child_retail_price,
                config.currency
              )}
            </span>
          </div>
          <div className="mt-2 space-y-1 text-sm text-gray-500">
            {adults > 0 && (
              <p>
                {adults} Adult × {formatCurrency(config.adult_retail_price, config.currency)}
              </p>
            )}
            {children > 0 && (
              <p>
                {children} Child × {formatCurrency(config.child_retail_price, config.currency)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




