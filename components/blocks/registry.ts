import { ComponentType } from 'react';
import { HeroBlock } from './HeroBlock';
import { HighlightsBlock } from './HighlightsBlock';
import { PricingSelectorBlock } from './PricingSelectorBlock';
import { AvailabilitySelectorBlock } from './AvailabilitySelectorBlock';
import { ItineraryBlock } from './ItineraryBlock';
import { IncludedExcludedBlock } from './IncludedExcludedBlock';
import { WhatToBringBlock } from './WhatToBringBlock';
import { SafetyInfoBlock } from './SafetyInfoBlock';
import { MapBlock } from './MapBlock';
import { ReviewsBlock } from './ReviewsBlock';
import { UpsellsBlock } from './UpsellsBlock';
import { TermsBlock } from './TermsBlock';
import type { TourBlockWithTranslation } from '@/types';

export interface BlockProps {
  block: TourBlockWithTranslation;
}

export const blockRegistry: Record<string, ComponentType<BlockProps>> = {
  hero: HeroBlock,
  highlights: HighlightsBlock,
  pricing_selector: PricingSelectorBlock,
  availability_selector: AvailabilitySelectorBlock,
  itinerary: ItineraryBlock,
  included_excluded: IncludedExcludedBlock,
  what_to_bring: WhatToBringBlock,
  safety_info: SafetyInfoBlock,
  map: MapBlock,
  reviews: ReviewsBlock,
  upsells: UpsellsBlock,
  terms: TermsBlock,
};

export const BLOCK_TYPES = Object.keys(blockRegistry);





