'use client';

import { formatCurrency } from '@/lib/utils';
import type { Booking, BookingStatus, Tour } from '@/types';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  tours: Tour[];
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  pending_payment: 'bg-[#e6f0ff] text-[#001f99] border-[#cce0ff]',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export function BookingDetailsModal({ isOpen, onClose, booking, tours }: BookingDetailsModalProps) {
  if (!isOpen || !booking) return null;

  // Helper function to get tour name
  const getTourName = (): string => {
    const tour = tours.find(t => t.id === booking.tour_id);
    if (!tour) return '-';
    
    const heroBlock = (tour as any).blocks?.find((b: any) => b.block_type === 'hero');
    const translation = heroBlock?.translations?.find((t: any) => t.language === 'en');
    return translation?.title || tour.slug;
  };

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
              <div>
                <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                <p className="mt-1 text-sm text-gray-500 font-mono">{booking.reference}</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium border ${STATUS_COLORS[booking.status]}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Customer Information */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Customer Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Name</span>
                      <span className="text-sm font-medium text-gray-900">{booking.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Email</span>
                      <span className="text-sm font-medium text-gray-900">{booking.customer_email}</span>
                    </div>
                    {booking.customer_phone && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Phone</span>
                        <span className="text-sm font-medium text-gray-900">{booking.customer_phone}</span>
                      </div>
                    )}
                    {booking.customer_nationality && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Nationality</span>
                        <span className="text-sm font-medium text-gray-900">{booking.customer_nationality}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tour Information */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Tour Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Tour</span>
                      <span className="text-sm font-medium text-gray-900">{getTourName()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Tour Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(booking.booking_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Language</span>
                      <span className="text-sm font-medium text-gray-900 uppercase">{booking.language}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Booking Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Reference</span>
                      <span className="text-sm font-mono font-semibold text-purple-600">{booking.reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Booking Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(booking.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Last Updated</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(booking.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-purple-600">
                    Payment Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Retail Total</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(Number(booking.total_retail), booking.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Net Total</span>
                      <span className="text-sm font-medium text-gray-700">
                        {formatCurrency(Number(booking.total_net), booking.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-purple-200 pt-3">
                      <span className="text-sm font-medium text-purple-700">Profit</span>
                      <span className="text-sm font-bold text-purple-700">
                        {formatCurrency(Number(booking.total_retail) - Number(booking.total_net), booking.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {booking.notes && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                      Notes
                    </h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{booking.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



