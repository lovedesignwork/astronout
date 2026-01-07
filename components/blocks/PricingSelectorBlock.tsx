'use client';

import { Container } from '@/components/layout/Container';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { FlatPricingSelector } from '@/components/pricing/FlatPricingSelector';
import { AdultChildPricingSelector } from '@/components/pricing/AdultChildPricingSelector';
import { SeatBasedPricingSelector } from '@/components/pricing/SeatBasedPricingSelector';
import type { BlockProps } from './registry';
import type { PricingConfig } from '@/types';

interface PricingSelectorContent {
  showTitle?: boolean;
}

export function PricingSelectorBlock({ block }: BlockProps) {
  const { tour, pricing } = useBookingContext();
  const content = block.content as PricingSelectorContent;

  if (!pricing || !tour) {
    return null;
  }

  const pricingConfig = pricing.config as PricingConfig;

  const renderPricingSelector = () => {
    switch (pricingConfig.type) {
      case 'flat_per_person':
        return <FlatPricingSelector config={pricingConfig} />;
      case 'adult_child':
        return <AdultChildPricingSelector config={pricingConfig} />;
      case 'seat_based':
        return <SeatBasedPricingSelector config={pricingConfig} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white py-12">
      <Container>
        {content.showTitle !== false && block.title && (
          <h2 className="mb-8 text-2xl font-bold text-gray-900">{block.title}</h2>
        )}
        {renderPricingSelector()}
      </Container>
    </div>
  );
}




