import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { getBookingByVoucherToken } from '@/lib/data/bookings';
import { formatCurrency } from '@/lib/utils';
import { Language } from '@/types';

interface VoucherPageProps {
  params: Promise<{ lang: string; bookingId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function VoucherPage({ params, searchParams }: VoucherPageProps) {
  const { lang, bookingId } = await params;
  const { token } = await searchParams;
  const language = lang as Language;

  if (!token) {
    notFound();
  }

  const booking = await getBookingByVoucherToken(bookingId, token);

  if (!booking) {
    notFound();
  }

  const tourItem = booking.items?.find((item) => item.item_type === 'tour');
  const upsellItems = booking.items?.filter((item) => item.item_type === 'upsell') || [];

  return (
    <div className="min-h-screen bg-white py-8 print:py-0">
      <Container>
        <div className="mx-auto max-w-3xl">
          {/* Print Button */}
          <div className="mb-6 flex justify-end no-print">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: '#0033FF' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0029cc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0033FF"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print Voucher
            </button>
          </div>

          {/* Voucher */}
          <div className="rounded-xl border-2 border-gray-200 bg-white p-8 print:border-0 print:p-4">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between border-b border-gray-200 pb-8">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0033FF]">
                    <span className="text-xl font-bold text-white">A</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">ASTRONOUT</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">Tour Booking Voucher</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Booking Reference</p>
                <p className="text-2xl font-bold text-[#0033FF]">{booking.reference}</p>
              </div>
            </div>

            {/* Booking Status */}
            <div className="mb-8 rounded-lg bg-green-50 p-4">
              <div className="flex items-center gap-2">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-semibold text-green-700">
                  Booking {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Tour Details */}
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Tour Details</h2>
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {tourItem?.item_name || booking.tour?.slug || 'Tour'}
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(booking.booking_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  {(() => {
                    const time = tourItem?.metadata && (tourItem.metadata as Record<string, unknown>).time;
                    return time ? (
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-medium text-gray-900">
                          {String(time)}
                        </p>
                      </div>
                    ) : null;
                  })()}
                  <div>
                    <p className="text-sm text-gray-500">Guests</p>
                    <p className="font-medium text-gray-900">
                      {tourItem?.quantity || 1} person(s)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Add-ons */}
            {upsellItems.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-bold text-gray-900">Add-ons</h2>
                <div className="space-y-2">
                  {upsellItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <span className="text-gray-700">{item.item_name}</span>
                      <span className="font-medium text-gray-900">
                        {item.quantity}×
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Details */}
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Customer Details</h2>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{booking.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{booking.customer_email}</p>
                  </div>
                  {booking.customer_phone && (
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{booking.customer_phone}</p>
                    </div>
                  )}
                  {booking.customer_nationality && (
                    <div>
                      <p className="text-sm text-gray-500">Nationality</p>
                      <p className="font-medium text-gray-900">
                        {booking.customer_nationality}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="mb-8 rounded-lg bg-[#e6f0ff] p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Total Paid</span>
                <span className="text-2xl font-bold text-[#0033FF]">
                  {formatCurrency(Number(booking.total_retail), booking.currency)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-bold text-gray-900">Notes</h2>
                <p className="text-gray-700">{booking.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
              <p>Please present this voucher upon arrival.</p>
              <p className="mt-2">
                Questions? Contact us at{' '}
                <a href="mailto:support@astronout.co" className="text-[#0033FF]">
                  support@astronout.co
                </a>
              </p>
              <p className="mt-4 text-xs">
                Voucher generated on {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

