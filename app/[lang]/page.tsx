import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Language } from '@/types';

interface HomePageProps {
  params: Promise<{ lang: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params;
  const language = lang as Language;

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #e6f0ff, white, #e6f0ff)' }}>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30" />
        <Container className="relative py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-medium" style={{ backgroundColor: '#cce0ff', color: '#001f99' }}>
              Discover Amazing Tours
            </span>
            <h1 className="mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-6xl">
              Unforgettable Adventures Await You
            </h1>
            <p className="mb-8 text-lg text-gray-600 md:text-xl">
              Explore the best tours and experiences. From island hopping to jungle
              adventures, we have the perfect trip for you.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={`/${language}/tours`}
                className="inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-90"
                style={{ backgroundColor: '#0033FF', boxShadow: '0 10px 15px -3px rgba(0, 51, 255, 0.3)' }}
              >
                Explore Tours
                <svg
                  className="ml-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
              <Link
                href={`/${language}/about`}
                className="inline-flex items-center justify-center rounded-full border-2 border-gray-200 bg-white px-8 py-3 text-base font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                Learn More
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="border-y border-gray-100 bg-white py-16">
        <Container>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">
                <svg
                  className="h-7 w-7 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Verified Tours
              </h3>
              <p className="text-gray-600">
                All our tours are verified and reviewed for quality and safety.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: '#cce0ff' }}>
                <svg
                  className="h-7 w-7"
                  style={{ color: '#0029cc' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Best Prices
              </h3>
              <p className="text-gray-600">
                Get the best deals with our competitive pricing and no hidden fees.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: '#cce0ff' }}>
                <svg
                  className="h-7 w-7"
                  style={{ color: '#0029cc' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                24/7 Support
              </h3>
              <p className="text-gray-600">
                Our support team is available around the clock to help you.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16" style={{ background: 'linear-gradient(to right, #0033FF, #0029cc)' }}>
        <Container>
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Ready for Your Next Adventure?
            </h2>
            <p className="mb-8 text-lg" style={{ color: '#cce0ff' }}>
              Browse our collection of handpicked tours and start planning today.
            </p>
            <Link
              href={`/${language}/tours`}
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-base font-semibold shadow-lg transition-all hover:shadow-xl hover:bg-blue-50"
              style={{ color: '#0029cc' }}
            >
              View All Tours
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}



