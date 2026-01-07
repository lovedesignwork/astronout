import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTourBySlug, getAvailability } from '@/lib/data/tours';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { TourPageClient } from './TourPageClient';
import { Language, SUPPORTED_LANGUAGES } from '@/types';
import { format, addMonths } from 'date-fns';

interface TourPageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: TourPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const tourData = await getTourBySlug(slug, lang as Language);

  if (!tourData) {
    return { title: 'Tour Not Found' };
  }

  const heroBlock = tourData.blocks.find((b) => b.block_type === 'hero');
  const title = heroBlock?.title || slug;
  const description = (heroBlock?.content as { subtitle?: string })?.subtitle || '';

  // Generate alternates for all languages
  const alternates: Record<string, string> = {};
  SUPPORTED_LANGUAGES.forEach((l) => {
    alternates[l] = `/${l}/tours/${slug}`;
  });

  const imageUrl = (heroBlock?.content as { imageUrl?: string })?.imageUrl;

  return {
    title,
    description,
    alternates: {
      languages: alternates,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function TourPage({ params }: TourPageProps) {
  const { lang, slug } = await params;
  const language = lang as Language;

  const tourData = await getTourBySlug(slug, language);

  if (!tourData) {
    notFound();
  }

  // Fetch availability for next 3 months
  const today = new Date();
  const startDate = format(today, 'yyyy-MM-dd');
  const endDate = format(addMonths(today, 3), 'yyyy-MM-dd');
  const availability = await getAvailability(tourData.id, startDate, endDate);

  // Extract tour base properties
  const tour = {
    id: tourData.id,
    tour_number: tourData.tour_number || '',
    slug: tourData.slug,
    status: tourData.status,
    pricing_engine: tourData.pricing_engine,
    tags: tourData.tags || [],
    created_at: tourData.created_at,
    updated_at: tourData.updated_at,
  };

  return (
    <TourPageClient
      tour={tour}
      blocks={tourData.blocks}
      pricing={tourData.pricing}
      upsells={tourData.upsells}
      availability={availability}
      language={language}
      categories={tourData.categories || []}
      specialLabels={tourData.specialLabels || []}
    />
  );
}

