import { Container } from '@/components/layout/Container';
import { getToursWithHero } from '@/lib/data/tours';
import { Language } from '@/types';
import { ToursPageClient } from './ToursPageClient';

interface ToursPageProps {
  params: Promise<{ lang: string }>;
}

export default async function ToursPage({ params }: ToursPageProps) {
  const { lang } = await params;
  const language = lang as Language;
  const tours = await getToursWithHero(language);

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <Container>
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Explore Our Tours
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Discover unforgettable experiences. From island adventures to cultural
            explorations, find your perfect tour.
          </p>
        </div>

        {/* Tours Grid - 4 columns */}
        {tours.length > 0 ? (
          <ToursPageClient tours={tours} language={language} />
        ) : (
          <div className="py-20 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No tours available</h3>
            <p className="mt-2 text-gray-500">Check back soon for new adventures!</p>
          </div>
        )}
      </Container>
    </div>
  );
}

