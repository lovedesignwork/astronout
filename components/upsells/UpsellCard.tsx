'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import type { UpsellWithTranslation, UpsellSelection } from '@/types';

interface UpsellCardProps {
  upsell: UpsellWithTranslation;
  selected: boolean;
  guestCount: number;
  onToggle: (selection: UpsellSelection, selected: boolean) => void;
  compact?: boolean;
}

export function UpsellCard({ upsell, selected, guestCount, onToggle, compact = false }: UpsellCardProps) {
  const [quantity, setQuantity] = useState(1);

  const paxTotal = guestCount || 1;

  // Calculate price based on pricing type
  const getUnitPrice = () => {
    switch (upsell.pricing_type) {
      case 'per_person':
        return upsell.retail_price; // Price per person
      case 'per_booking':
      case 'flat':
        return upsell.retail_price;
      default:
        return upsell.retail_price;
    }
  };

  const calculateTotal = (qty: number) => {
    switch (upsell.pricing_type) {
      case 'per_person':
        return upsell.retail_price * paxTotal * qty;
      case 'per_booking':
        return upsell.retail_price; // Fixed per booking
      case 'flat':
        return upsell.retail_price * qty;
      default:
        return upsell.retail_price * qty;
    }
  };

  const handleToggle = () => {
    const qty = upsell.pricing_type === 'per_booking' ? 1 : quantity;
    const totalRetail = calculateTotal(qty);
    const totalNet =
      upsell.pricing_type === 'per_person'
        ? upsell.net_price * paxTotal * qty
        : upsell.pricing_type === 'per_booking'
        ? upsell.net_price
        : upsell.net_price * qty;

    const selection: UpsellSelection = {
      upsellId: upsell.id,
      title: upsell.title,
      pricingType: upsell.pricing_type,
      quantity: qty,
      unitRetailPrice: getUnitPrice(),
      unitNetPrice: upsell.net_price,
      totalRetail,
      totalNet,
    };

    onToggle(selection, !selected);
  };

  const handleQuantityChange = (newQty: number) => {
    const maxQty = upsell.max_quantity || 10;
    const clampedQty = Math.max(1, Math.min(maxQty, newQty));
    setQuantity(clampedQty);

    // If already selected, update with new quantity
    if (selected) {
      const newTotalRetail = calculateTotal(clampedQty);
      const newTotalNet =
        upsell.pricing_type === 'per_person'
          ? upsell.net_price * paxTotal * clampedQty
          : upsell.pricing_type === 'per_booking'
          ? upsell.net_price
          : upsell.net_price * clampedQty;

      const selection: UpsellSelection = {
        upsellId: upsell.id,
        title: upsell.title,
        pricingType: upsell.pricing_type,
        quantity: clampedQty,
        unitRetailPrice: getUnitPrice(),
        unitNetPrice: upsell.net_price,
        totalRetail: newTotalRetail,
        totalNet: newTotalNet,
      };

      onToggle(selection, true);
    }
  };

  const getPricingLabel = () => {
    switch (upsell.pricing_type) {
      case 'per_person':
        return 'per person';
      case 'per_booking':
        return 'per booking';
      case 'flat':
        return 'each';
      default:
        return '';
    }
  };

  // Compact version for inline display
  if (compact) {
    return (
      <div
        onClick={handleToggle}
        className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
          selected
            ? 'border-[#0033FF] bg-[#e6f0ff]'
            : 'border-[#52ffae] bg-white hover:border-[#3de69a]'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{upsell.title}</h4>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(upsell.retail_price, upsell.currency)}
              </span>
              <span className="text-xs text-gray-500">{getPricingLabel()}</span>
            </div>
          </div>

          <div
            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
              selected
                ? 'border-[#0033FF] bg-[#0033FF] text-white'
                : 'border-gray-300 bg-white'
            }`}
          >
            {selected && (
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all ${
        selected
          ? 'border-[#0033FF] bg-[#e6f0ff]'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{upsell.title}</h3>
          {upsell.description && (
            <p className="mt-1 text-sm text-gray-600">{upsell.description}</p>
          )}
          <div className="mt-2">
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(upsell.retail_price, upsell.currency)}
            </span>
            <span className="ml-1 text-sm text-gray-500">{getPricingLabel()}</span>
          </div>
        </div>

        <button
          onClick={handleToggle}
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
            selected
              ? 'border-[#0033FF] bg-[#0033FF] text-white'
              : 'border-gray-300 bg-white'
          }`}
        >
          {selected && (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Quantity selector for flat pricing */}
      {upsell.pricing_type === 'flat' && (
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-600">Quantity</span>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuantityChange(quantity - 1);
              }}
              disabled={quantity <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              -
            </button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuantityChange(quantity + 1);
              }}
              disabled={quantity >= (upsell.max_quantity || 10)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Show calculated total */}
      {selected && (
        <div className="mt-4 rounded-lg bg-orange-100 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-orange-700">Subtotal</span>
            <span className="font-semibold text-orange-700">
              {formatCurrency(calculateTotal(quantity), upsell.currency)}
            </span>
          </div>
          {upsell.pricing_type === 'per_person' && (
            <p className="mt-1 text-xs text-orange-600">
              {formatCurrency(upsell.retail_price, upsell.currency)} × {paxTotal} guests
            </p>
          )}
        </div>
      )}
    </div>
  );
}
