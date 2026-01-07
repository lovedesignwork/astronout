import Stripe from 'stripe';

// Note: stripe package needs to be installed: npm install stripe
// This module provides server-side Stripe client initialization

let stripeInstance: Stripe | null = null;

/**
 * Get Stripe instance with the appropriate secret key based on mode
 * This should only be used in server-side code (API routes)
 */
export function getStripeClient(secretKey: string): Stripe {
  if (!secretKey) {
    throw new Error('Stripe secret key is required');
  }

  // Create a new instance with the provided key
  return new Stripe(secretKey, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
  });
}

/**
 * Get Stripe instance using environment variables (fallback)
 * Used when settings are not yet configured
 */
export function getStripeFromEnv(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    return null;
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }

  return stripeInstance;
}

/**
 * Convert amount to Stripe's smallest currency unit
 * For THB, this is satang (1 THB = 100 satang)
 */
export function toStripeAmount(amount: number, currency: string): number {
  // Currencies that use zero decimal places
  const zeroDecimalCurrencies = [
    'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA',
    'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'
  ];

  if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
    return Math.round(amount);
  }

  // Most currencies including THB use 2 decimal places
  return Math.round(amount * 100);
}

/**
 * Convert Stripe amount back to normal currency amount
 */
export function fromStripeAmount(amount: number, currency: string): number {
  const zeroDecimalCurrencies = [
    'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA',
    'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'
  ];

  if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
    return amount;
  }

  return amount / 100;
}

/**
 * Get payment method types based on enabled settings
 */
export function getPaymentMethodTypes(paymentMethods: {
  card?: boolean;
  google_pay?: boolean;
  apple_pay?: boolean;
  promptpay?: boolean;
}): string[] {
  const types: string[] = [];

  // Card includes Google Pay and Apple Pay when using Payment Element
  if (paymentMethods.card) {
    types.push('card');
  }

  // PromptPay for Thai QR payments
  if (paymentMethods.promptpay) {
    types.push('promptpay');
  }

  // If no methods enabled, default to card
  if (types.length === 0) {
    types.push('card');
  }

  return types;
}

