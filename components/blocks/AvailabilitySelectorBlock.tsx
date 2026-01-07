'use client';

import { Container } from '@/components/layout/Container';
import { AvailabilityCalendar } from '@/components/pricing/AvailabilityCalendar';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import type { BlockProps } from './registry';

interface AvailabilitySelectorContent {
  showTitle?: boolean;
  showCalendar?: boolean;
}

export function AvailabilitySelectorBlock({ block }: BlockProps) {
  const { tour } = useBookingContext();
  const content = block.content as AvailabilitySelectorContent;

  if (!tour) {
    return null;
  }

  return (
    <div className="bg-gray-50 py-12">
      <Container>
        {content.showTitle !== false && block.title && (
          <h2 className="mb-8 text-2xl font-bold text-gray-900">{block.title}</h2>
        )}
        <AvailabilityCalendar tourId={tour.id} />
      </Container>
    </div>
  );
}




