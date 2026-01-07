'use client';

import { blockRegistry } from './registry';
import type { TourBlockWithTranslation } from '@/types';

interface BlockRendererProps {
  blocks: TourBlockWithTranslation[];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  return (
    <div className="space-y-0">
      {blocks.map((block) => {
        const Component = blockRegistry[block.block_type];

        if (!Component) {
          // Silently skip unknown block types in production
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





