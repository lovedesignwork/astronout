'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { formatCurrency } from '@/lib/utils';
import { StripeProvider } from '@/components/checkout/StripeProvider';
import { StripePaymentForm } from '@/components/checkout/StripePaymentForm';
import type { StripePaymentMethods } from '@/types';

export default function CheckoutPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selection } = useBookingContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nationality: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Payment state
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<StripePaymentMethods>({
    card: true,
    google_pay: true,
    apple_pay: true,
    promptpay: true,
  });
  const [showPayment, setShowPayment] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Check for payment_intent in URL (redirect from Stripe)
  useEffect(() => {
    const paymentIntentStatus = searchParams.get('redirect_status');
    const paymentIntentId = searchParams.get('payment_intent');

    if (paymentIntentStatus === 'succeeded' && paymentIntentId) {
      // Payment was successful, redirect to confirmation
      // The webhook will have updated the booking status
      router.push(`/${language}/booking/confirmation/${bookingId || 'success'}`);
    }
  }, [searchParams, language, router, bookingId]);

  // If no selection, show a message
  if (!selection) {
    return (
      <div className="bg-gray-50 py-12">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-gray-100">
                <svg
                  className="size-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              Your cart is empty
            </h1>
            <p className="mb-8 text-gray-600">
              Please select a tour and options before proceeding to checkout.
            </p>
            <a
              href={`/${language}/tours`}
              className="inline-flex items-center justify-center rounded-full px-8 py-3 font-semibold text-white transition-all"
              style={{ backgroundColor: '#0033FF' }}
            >
              Browse Tours
            </a>
          </div>
        </Container>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!selection) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Step 1: Create booking
      const bookingResponse = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: selection.tour.tourId,
          bookingDate: selection.tour.date,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone || undefined,
          customerNationality: formData.nationality || undefined,
          language,
          selection,
        }),
      });

      const bookingData = await bookingResponse.json();

      if (!bookingData.success) {
        setErrors({ submit: bookingData.error || 'Failed to create booking' });
        setIsSubmitting(false);
        return;
      }

      setBookingId(bookingData.booking.id);
      setBookingReference(bookingData.booking.reference);

      // Step 2: Create payment intent
      const paymentResponse = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingData.booking.id,
          amount: selection.grandTotalRetail,
          currency: selection.currency,
          customerEmail: formData.email,
          customerName: formData.name,
          tourName: selection.tour.tourName,
          bookingReference: bookingData.booking.reference,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentData.success) {
        setErrors({
          submit: paymentData.error || 'Failed to initialize payment',
        });
        setIsSubmitting(false);
        return;
      }

      setClientSecret(paymentData.clientSecret);
      setPublishableKey(paymentData.publishableKey);
      setPaymentMethods(paymentData.paymentMethods);
      setShowPayment(true);
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Redirect to confirmation page
    if (bookingId) {
      router.push(`/${language}/booking/confirmation/${bookingId}`);
    }
  };

  const handlePaymentError = (error: string) => {
    setErrors({ payment: error });
  };

  const returnUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${language}/checkout?booking_id=${bookingId}`;

  return (
    <div className="bg-gray-50 py-12">
      <Container>
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">Checkout</h1>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2">
              {!showPayment ? (
                <form onSubmit={handleContinueToPayment} className="space-y-6">
                  {/* Customer Details */}
                  <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-6 text-xl font-semibold text-gray-900">
                      Customer Details
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className={`w-full rounded-lg border px-4 py-3 focus:border-[#0033FF] focus:outline-none focus:ring-2 focus:ring-[#0033FF]/20 ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="John Doe"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className={`w-full rounded-lg border px-4 py-3 focus:border-[#0033FF] focus:outline-none focus:ring-2 focus:ring-[#0033FF]/20 ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="john@example.com"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#0033FF] focus:outline-none focus:ring-2 focus:ring-[#0033FF]/20"
                          placeholder="+66 123 456 789"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Nationality
                        </label>
                        <input
                          type="text"
                          value={formData.nationality}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nationality: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#0033FF] focus:outline-none focus:ring-2 focus:ring-[#0033FF]/20"
                          placeholder="e.g., United States"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="rounded-xl bg-white p-6 shadow-sm">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            agreeTerms: e.target.checked,
                          })
                        }
                        className="mt-1 h-5 w-5 rounded border-gray-300 focus:ring-[#0033FF]"
                        style={{ accentColor: '#0033FF' }}
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{' '}
                        <a
                          href={`/${language}/terms`}
                          className="hover:underline"
                          style={{ color: '#0033FF' }}
                          target="_blank"
                        >
                          Terms & Conditions
                        </a>{' '}
                        and{' '}
                        <a
                          href={`/${language}/privacy`}
                          className="hover:underline"
                          style={{ color: '#0033FF' }}
                          target="_blank"
                        >
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                    {errors.agreeTerms && (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.agreeTerms}
                      </p>
                    )}
                  </div>

                  {errors.submit && (
                    <div className="rounded-lg bg-red-50 p-4 text-red-700">
                      {errors.submit}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full py-4 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      backgroundColor: '#0033FF',
                      boxShadow: '0 10px 15px -3px rgba(0, 51, 255, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0029cc';
                      e.currentTarget.style.boxShadow =
                        '0 20px 25px -5px rgba(0, 51, 255, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0033FF';
                      e.currentTarget.style.boxShadow =
                        '0 10px 15px -3px rgba(0, 51, 255, 0.3)';
                    }}
                  >
                    {isSubmitting ? 'Processing...' : 'Continue to Payment'}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Back Button */}
                  <button
                    onClick={() => setShowPayment(false)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <svg
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Back to details
                  </button>

                  {/* Booking Reference */}
                  {bookingReference && (
                    <div className="rounded-xl bg-blue-50 p-4">
                      <p className="text-sm text-blue-600">Booking Reference</p>
                      <p className="text-lg font-bold text-blue-900">
                        {bookingReference}
                      </p>
                    </div>
                  )}

                  {/* Payment Form */}
                  <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-6 text-xl font-semibold text-gray-900">
                      Payment
                    </h2>

                    {clientSecret && publishableKey ? (
                      <StripeProvider
                        clientSecret={clientSecret}
                        publishableKey={publishableKey}
                      >
                        <StripePaymentForm
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                          isProcessing={paymentProcessing}
                          setIsProcessing={setPaymentProcessing}
                          returnUrl={returnUrl}
                          paymentMethods={paymentMethods}
                        />
                      </StripeProvider>
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <div className="size-8 animate-spin rounded-full border-4 border-[#0033FF] border-t-transparent" />
                      </div>
                    )}
                  </div>

                  {errors.payment && (
                    <div className="rounded-lg bg-red-50 p-4 text-red-700">
                      {errors.payment}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-xl font-semibold text-gray-900">
                  Order Summary
                </h2>

                {/* Tour */}
                <div className="mb-6 border-b border-gray-100 pb-6">
                  <h3 className="font-semibold text-gray-900">
                    {selection.tour.tourName}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(selection.tour.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {selection.tour.time && ` at ${selection.tour.time}`}
                  </p>

                  <div className="mt-4 space-y-2">
                    {selection.tour.priceBreakdown.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600">
                          {item.quantity}× {item.label}
                        </span>
                        <span className="text-gray-900">
                          {formatCurrency(item.amount, selection.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upsells */}
                {selection.upsells.length > 0 && (
                  <div className="mb-6 border-b border-gray-100 pb-6">
                    <h4 className="mb-3 text-sm font-medium text-gray-700">
                      Add-ons
                    </h4>
                    <div className="space-y-2">
                      {selection.upsells.map((upsell) => (
                        <div
                          key={upsell.upsellId}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-600">{upsell.title}</span>
                          <span className="text-gray-900">
                            {formatCurrency(
                              upsell.totalRetail,
                              selection.currency
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-2xl font-bold" style={{ color: '#0033FF' }}>
                    {formatCurrency(
                      selection.grandTotalRetail,
                      selection.currency
                    )}
                  </span>
                </div>

                {/* Payment Status Indicator */}
                {showPayment && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                    <svg
                      className="size-5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span>Complete payment to confirm your booking</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
