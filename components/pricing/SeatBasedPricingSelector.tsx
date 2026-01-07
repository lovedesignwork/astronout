'use client';

import { useState, useEffect } from 'react';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { formatCurrency } from '@/lib/utils';
import type { SeatBasedPricing, SeatType } from '@/types';

interface SeatBasedPricingSelectorProps {
  config: SeatBasedPricing;
}

export function SeatBasedPricingSelector({ config }: SeatBasedPricingSelectorProps) {
  const { tour, selectedDate, selectedTime, updateTourSelection } = useBookingContext();
  const [selectedSeat, setSelectedSeat] = useState<SeatType | null>(
    config.seats[0] || null
  );
  const [quantity, setQuantity] = useState(1);

  const maxQty = selectedSeat?.capacity || 10;

  useEffect(() => {
    if (!tour || !selectedDate || !selectedSeat) return;

    const totalRetail = quantity * selectedSeat.retail_price;
    const totalNet = quantity * selectedSeat.net_price;

    updateTourSelection({
      tourId: tour.id,
      tourSlug: tour.slug,
      tourName: tour.slug,
      date: selectedDate,
      time: selectedTime || undefined,
      pax: { total: quantity },
      seat: { type: selectedSeat.seat_type, qty: quantity },
      priceBreakdown: [
        {
          label: `${selectedSeat.seat_type} Seat`,
          quantity,
          unit_price: selectedSeat.retail_price,
          amount: totalRetail,
        },
      ],
      totalRetail,
      totalNet,
      currency: config.currency,
    });
  }, [selectedSeat, quantity, selectedDate, selectedTime, tour, config.currency, updateTourSelection]);

  return (
    <div className="rounded-xl bg-gray-50 p-6">
      <div className="mb-6">
        <h3 className="mb-4 font-semibold text-gray-900">Select Seat Type</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {config.seats.map((seat) => (
            <button
              key={seat.seat_type}
              onClick={() => {
                setSelectedSeat(seat);
                setQuantity(1);
              }}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                selectedSeat?.seat_type === seat.seat_type
                  ? 'border-[#0033FF] bg-[#e6f0ff]'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{seat.seat_type}</span>
                {selectedSeat?.seat_type === seat.seat_type && (
                  <svg
                    className="h-5 w-5" style={{ color: '#0033FF' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatCurrency(seat.retail_price, config.currency)}
              </p>
              {seat.capacity && (
                <p className="mt-1 text-sm text-gray-500">
                  {seat.capacity} seats available
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedSeat && (
        <div className="space-y-4">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between rounded-lg bg-white p-4">
            <div>
              <p className="font-medium text-gray-900">Number of Seats</p>
              <p className="text-sm text-gray-500">{selectedSeat.seat_type}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-12 text-center text-xl font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                disabled={quantity >= maxQty}
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
                {formatCurrency(quantity * selectedSeat.retail_price, config.currency)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {quantity} × {selectedSeat.seat_type} @ {formatCurrency(selectedSeat.retail_price, config.currency)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}




