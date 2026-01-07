'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe, StripeElementsOptions } from '@stripe/stripe-js';

interface StripeProviderProps {
  children: ReactNode;
  clientSecret: string;
  publishableKey: string;
}

// Cache the stripe promise to avoid re-loading
let stripePromiseCache: Promise<Stripe | null> | null = null;
let cachedPublishableKey: string | null = null;

function getStripePromise(publishableKey: string): Promise<Stripe | null> {
  if (stripePromiseCache && cachedPublishableKey === publishableKey) {
    return stripePromiseCache;
  }
  
  cachedPublishableKey = publishableKey;
  stripePromiseCache = loadStripe(publishableKey);
  return stripePromiseCache;
}

export function StripeProvider({
  children,
  clientSecret,
  publishableKey,
}: StripeProviderProps) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    if (publishableKey) {
      setStripePromise(getStripePromise(publishableKey));
    }
  }, [publishableKey]);

  if (!stripePromise || !clientSecret) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="size-8 animate-spin rounded-full border-4 border-[#0033FF] border-t-transparent" />
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0033FF',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: '8px',
        spacingUnit: '4px',
      },
      rules: {
        '.Input': {
          border: '1px solid #d1d5db',
          boxShadow: 'none',
          padding: '12px 16px',
        },
        '.Input:focus': {
          border: '1px solid #0033FF',
          boxShadow: '0 0 0 2px rgba(0, 51, 255, 0.1)',
        },
        '.Input--invalid': {
          border: '1px solid #ef4444',
        },
        '.Label': {
          fontWeight: '500',
          fontSize: '14px',
          marginBottom: '4px',
        },
        '.Tab': {
          border: '1px solid #d1d5db',
          borderRadius: '8px',
        },
        '.Tab--selected': {
          border: '1px solid #0033FF',
          backgroundColor: 'rgba(0, 51, 255, 0.05)',
        },
        '.TabIcon--selected': {
          fill: '#0033FF',
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}


