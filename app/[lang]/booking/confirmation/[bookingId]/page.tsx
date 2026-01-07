import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { getBookingById } from '@/lib/data/bookings';
import { formatCurrency } from '@/lib/utils';
import { Language } from '@/types';

interface ConfirmationPageProps {
  params: Promise<{ lang: string; bookingId: string }>;
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { lang, bookingId } = await params;
  const language = lang as Language;

  // In production, verify the user has access to this booking
  const booking = await getBookingById(bookingId);

  if (!booking) {
    notFound();
  }

  return (
    <div className="bg-gray-50 py-12">
      <Container>
        <div className="mx-auto max-w-2xl">
          {/* Success Message */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600">
              Thank you for your booking. A confirmation email has been sent to{' '}
              <span className="font-medium">{booking.customer_email}</span>
            </p>
          </div>

          {/* Booking Details */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-6 border-b border-gray-100 pb-6">
              <p className="text-sm text-gray-500">Booking Reference</p>
              <p className="text-2xl font-bold text-[#0033FF]">{booking.reference}</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Tour</span>
                <span className="font-medium text-gray-900">
                  {booking.tour?.slug || 'Tour'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-medium text-gray-900">
                  {new Date(booking.booking_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Customer</span>
                <span className="font-medium text-gray-900">
                  {booking.customer_name}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                  {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total Paid</span>
                  <span className="text-lg font-bold text-[#0033FF]">
                    {formatCurrency(Number(booking.total_retail), booking.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href={`/${language}/voucher/${booking.id}?token=${booking.voucher_token}`}
              className="inline-flex items-center justify-center rounded-full px-8 py-3 font-semibold text-white shadow-lg transition-all"
              style={{ backgroundColor: '#0033FF' }}
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Voucher
            </Link>
            <Link
              href={`/${language}/tours`}
              className="inline-flex items-center justify-center rounded-full border-2 border-gray-200 bg-white px-8 py-3 font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
            >
              Browse More Tours
            </Link>
          </div>

          {/* Help */}
          <div className="mt-12 rounded-xl bg-blue-50 p-6 text-center">
            <h3 className="mb-2 font-semibold text-blue-900">Need Help?</h3>
            <p className="text-sm text-blue-700">
              If you have any questions about your booking, please contact us at{' '}
              <a
                href="mailto:support@astronout.co"
                className="font-medium underline"
              >
                support@astronout.co
              </a>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}




