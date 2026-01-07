'use client';

import { useState, useEffect } from 'react';
import type { Booking, BookingStatus, Tour } from '@/types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  booking?: Booking | null;
  tours: Tour[];
}

const STATUS_OPTIONS: { value: BookingStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'pending_payment', label: 'Pending Payment', color: 'bg-[#e6f0ff] text-[#001f99]' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-700' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-700' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
];

export function BookingModal({ isOpen, onClose, onSave, booking, tours }: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    tourId: '',
    bookingDate: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerNationality: '',
    status: 'confirmed' as BookingStatus,
    notes: '',
    // Simple pricing for manual booking
    quantity: 1,
    pricePerPerson: 0,
  });

  useEffect(() => {
    if (booking) {
      setFormData({
        tourId: booking.tour_id,
        bookingDate: booking.booking_date,
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        customerPhone: booking.customer_phone || '',
        customerNationality: booking.customer_nationality || '',
        status: booking.status,
        notes: booking.notes || '',
        quantity: 1,
        pricePerPerson: Number(booking.total_retail),
      });
    } else {
      // Reset form for new booking
      setFormData({
        tourId: tours[0]?.id || '',
        bookingDate: new Date().toISOString().split('T')[0],
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerNationality: '',
        status: 'confirmed',
        notes: '',
        quantity: 1,
        pricePerPerson: 0,
      });
    }
    setError(null);
  }, [booking, tours, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = booking 
        ? `/api/admin/bookings/${booking.id}` 
        : '/api/admin/bookings';
      
      const method = booking ? 'PUT' : 'POST';

      const totalRetail = formData.quantity * formData.pricePerPerson;
      const totalNet = totalRetail * 0.8; // 20% margin

      const selectedTour = tours.find(t => t.id === formData.tourId);

      const payload = {
        tourId: formData.tourId,
        bookingDate: formData.bookingDate,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone || null,
        customerNationality: formData.customerNationality || null,
        status: formData.status,
        notes: formData.notes || null,
        items: booking ? undefined : [{
          item_type: 'tour',
          item_id: formData.tourId,
          item_name: selectedTour?.slug || 'Tour',
          quantity: formData.quantity,
          retail_price_snapshot: formData.pricePerPerson,
          net_price_snapshot: formData.pricePerPerson * 0.8,
          subtotal_retail: totalRetail,
          subtotal_net: totalNet,
        }],
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save booking');
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 flex max-w-full">
        <div className="w-screen max-w-lg">
          <div className="flex h-full flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">
                {booking ? 'Edit Booking' : 'New Booking'}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-6">
                {error && (
                  <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Tour Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tour *
                  </label>
                  <select
                    value={formData.tourId}
                    onChange={(e) => setFormData({ ...formData, tourId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    required
                    disabled={!!booking}
                  >
                    <option value="">Select a tour</option>
                    {tours.map((tour) => (
                      <option key={tour.id} value={tour.id}>
                        {tour.slug}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Booking Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Date *
                  </label>
                  <input
                    type="date"
                    value={formData.bookingDate}
                    onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    required
                  />
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="John Smith"
                    required
                  />
                </div>

                {/* Customer Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Email *
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="john@email.com"
                    required
                  />
                </div>

                {/* Customer Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="+66 123 456 789"
                  />
                </div>

                {/* Customer Nationality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={formData.customerNationality}
                    onChange={(e) => setFormData({ ...formData, customerNationality: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="US"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as BookingStatus })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pricing (only for new bookings) */}
                {!booking && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price per Person (THB)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.pricePerPerson}
                        onChange={(e) => setFormData({ ...formData, pricePerPerson: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                  </div>
                )}

                {/* Total Preview (only for new bookings) */}
                {!booking && formData.pricePerPerson > 0 && (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-bold text-gray-900">
                        ฿{(formData.quantity * formData.pricePerPerson).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="Special requests, dietary requirements, etc."
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : booking ? 'Update Booking' : 'Create Booking'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}





