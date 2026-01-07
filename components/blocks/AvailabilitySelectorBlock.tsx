'use client';

import { Container } from '@/components/layout/Container';
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

  // Note: AvailabilityCalendar requires props that are managed by BookingForm
  // This block serves as a placeholder - actual calendar is rendered in BookingForm/BookingSidebar
  return (
    <div className="bg-gray-50 py-12">
      <Container>
        {content.showTitle !== false && block.title && (
          <h2 className="mb-8 text-2xl font-bold text-gray-900">{block.title}</h2>
        )}
        <div className="text-center text-gray-500">
          {/* Calendar is integrated in the booking form */}
          <p>Select your preferred date and time using the booking form.</p>
        </div>
      </Container>
    </div>
  );
}




