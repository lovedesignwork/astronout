'use client';

import { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type { StripePaymentMethods } from '@/types';

interface StripePaymentFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  returnUrl: string;
  paymentMethods: StripePaymentMethods;
}

export function StripePaymentForm({
  onSuccess,
  onError,
  isProcessing,
  setIsProcessing,
  returnUrl,
  paymentMethods,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (elements) {
      const paymentElement = elements.getElement('payment');
      if (paymentElement) {
        paymentElement.on('ready', () => setIsReady(true));
      }
    }
  }, [elements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'if_required',
      });

      if (error) {
        // Handle error
        const message =
          error.type === 'card_error' || error.type === 'validation_error'
            ? error.message || 'An error occurred with your payment'
            : 'An unexpected error occurred';
        setErrorMessage(message);
        onError(message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded without redirect
        onSuccess();
      } else if (paymentIntent && paymentIntent.status === 'processing') {
        // Payment is processing (common for PromptPay)
        setErrorMessage('Payment is processing. You will be notified once completed.');
      }
    } catch (err) {
      const message = 'An unexpected error occurred';
      setErrorMessage(message);
      onError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Build payment method info text
  const getPaymentMethodsText = () => {
    const methods: string[] = [];
    if (paymentMethods.card) methods.push('Credit/Debit Card');
    if (paymentMethods.google_pay) methods.push('Google Pay');
    if (paymentMethods.apple_pay) methods.push('Apple Pay');
    if (paymentMethods.promptpay) methods.push('Thai QR (PromptPay)');
    return methods.join(', ');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Methods Info */}
      <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4">
        <svg
          className="size-5 flex-shrink-0 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="text-sm text-blue-800">
          <p className="font-medium">Accepted Payment Methods</p>
          <p className="text-blue-600">{getPaymentMethodsText()}</p>
        </div>
      </div>

      {/* Payment Element */}
      <div className="rounded-lg border border-gray-200 p-4">
        <PaymentElement
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
            wallets: {
              googlePay: paymentMethods.google_pay ? 'auto' : 'never',
              applePay: paymentMethods.apple_pay ? 'auto' : 'never',
            },
            paymentMethodOrder: ['card', 'google_pay', 'apple_pay', 'promptpay'],
          }}
          onReady={() => setIsReady(true)}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Secure Payment Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
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
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span>Secured by Stripe</span>
        <div className="flex items-center gap-1">
          {/* Payment icons */}
          <svg className="h-5 w-8" viewBox="0 0 32 20" fill="none">
            <rect width="32" height="20" rx="2" fill="#1A1F71" />
            <path
              d="M12.5 14.5L14 5.5H16.5L15 14.5H12.5Z"
              fill="white"
            />
            <path
              d="M21.5 5.7C21 5.5 20.2 5.3 19.2 5.3C16.7 5.3 15 6.5 15 8.2C15 9.5 16.2 10.2 17.1 10.6C18 11 18.3 11.3 18.3 11.7C18.3 12.3 17.6 12.6 16.9 12.6C15.9 12.6 15.4 12.5 14.6 12.1L14.3 12L14 14C14.6 14.3 15.6 14.5 16.7 14.5C19.4 14.5 21 13.3 21 11.5C21 10.5 20.4 9.7 19.1 9.1C18.3 8.7 17.8 8.4 17.8 8C17.8 7.6 18.2 7.2 19.1 7.2C19.9 7.2 20.5 7.4 20.9 7.5L21.1 7.6L21.5 5.7Z"
              fill="white"
            />
            <path
              d="M24.5 5.5H22.7C22.1 5.5 21.7 5.7 21.5 6.3L18 14.5H20.7L21.2 13H24.4L24.7 14.5H27L24.5 5.5ZM22 11C22.2 10.4 23 8.2 23 8.2C23 8.2 23.2 7.6 23.3 7.3L23.5 8.1C23.5 8.1 24 10.3 24.1 11H22Z"
              fill="white"
            />
            <path
              d="M10.5 5.5L8 11.5L7.7 10C7.3 8.7 6.1 7.3 4.7 6.5L7 14.5H9.7L13.2 5.5H10.5Z"
              fill="white"
            />
            <path
              d="M6.5 5.5H2.5L2.5 5.7C5.6 6.5 7.6 8.4 8.3 10.5L7.5 6.3C7.4 5.7 7 5.5 6.5 5.5Z"
              fill="#F9A51A"
            />
          </svg>
          <svg className="h-5 w-8" viewBox="0 0 32 20" fill="none">
            <rect width="32" height="20" rx="2" fill="#EB001B" fillOpacity="0.1" />
            <circle cx="12" cy="10" r="6" fill="#EB001B" />
            <circle cx="20" cy="10" r="6" fill="#F79E1B" />
            <path
              d="M16 5.5C17.7 6.8 18.8 8.8 18.8 10C18.8 11.2 17.7 13.2 16 14.5C14.3 13.2 13.2 11.2 13.2 10C13.2 8.8 14.3 6.8 16 5.5Z"
              fill="#FF5F00"
            />
          </svg>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing || !isReady}
        className="w-full rounded-full py-4 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          backgroundColor: '#0033FF',
          boxShadow: '0 10px 15px -3px rgba(0, 51, 255, 0.3)',
        }}
        onMouseEnter={(e) => {
          if (!isProcessing) {
            e.currentTarget.style.backgroundColor = '#0029cc';
            e.currentTarget.style.boxShadow =
              '0 20px 25px -5px rgba(0, 51, 255, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#0033FF';
          e.currentTarget.style.boxShadow =
            '0 10px 15px -3px rgba(0, 51, 255, 0.3)';
        }}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="size-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          'Pay Now'
        )}
      </button>
    </form>
  );
}

