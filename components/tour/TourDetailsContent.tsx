'use client';

import { blockRegistry } from '@/components/blocks/registry';
import type { TourBlockWithTranslation } from '@/types';

interface TourDetailsContentProps {
  blocks: TourBlockWithTranslation[];
}

// Blocks that should appear in the left column (tour details)
const LEFT_COLUMN_BLOCKS = [
  'highlights',
  'itinerary',
  'included_excluded',
  'what_to_bring',
  'safety_info',
  'map',
  'reviews',
  'terms',
];

export function TourDetailsContent({ blocks }: TourDetailsContentProps) {
  // Filter blocks for the left column, excluding hero, pricing_selector, availability_selector, and upsells
  const detailBlocks = blocks.filter((block) => 
    LEFT_COLUMN_BLOCKS.includes(block.block_type)
  );

  return (
    <div className="space-y-8">
      {detailBlocks.map((block) => {
        const Component = blockRegistry[block.block_type];

        if (!Component) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Unknown block type: ${block.block_type}`);
          }
          return null;
        }

        return (
          <section key={block.id} data-block-type={block.block_type}>
            <Component block={block} />
          </section>
        );
      })}
    </div>
  );
}




