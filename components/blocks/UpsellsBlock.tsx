'use client';

import { Container } from '@/components/layout/Container';
import { UpsellCard } from '@/components/upsells/UpsellCard';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import type { BlockProps } from './registry';
import type { UpsellSelection } from '@/types';

interface UpsellsContent {
  showTitle?: boolean;
}

export function UpsellsBlock({ block }: BlockProps) {
  const { upsells, selection, addUpsell, removeUpsell } = useBookingContext();
  const content = block.content as UpsellsContent;

  // Only show upsells if main selection is valid
  const isMainSelectionValid = selection?.tour?.date && (selection?.tour?.pax?.total ?? 0) > 0;
  const guestCount = selection?.tour?.pax?.total ?? 1;

  const handleUpsellToggle = (upsellSelection: UpsellSelection, selected: boolean) => {
    if (!selection) return;
    
    if (selected) {
      addUpsell(upsellSelection);
    } else {
      removeUpsell(upsellSelection.upsellId);
    }
  };

  const isUpsellSelected = (upsellId: string) => {
    return selection?.upsells?.some(u => u.upsellId === upsellId) || false;
  };

  if (!upsells || upsells.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-12">
      <Container>
        {content.showTitle !== false && block.title && (
          <h2 className="mb-8 text-2xl font-bold text-gray-900">{block.title}</h2>
        )}

        {!isMainSelectionValid ? (
          <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">
            Please select your tour date and number of guests first to view available add-ons.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upsells.map((upsell) => (
              <UpsellCard 
                key={upsell.id} 
                upsell={upsell}
                selected={isUpsellSelected(upsell.id)}
                guestCount={guestCount}
                onToggle={handleUpsellToggle}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}




