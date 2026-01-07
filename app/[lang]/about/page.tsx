import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { getStaticPage } from '@/lib/data/static-pages';
import { Language } from '@/types';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const page = await getStaticPage('about', lang as Language);

  return {
    title: page?.meta_title || page?.title || 'About Us',
    description: page?.meta_description || 'Learn about our company and team',
  };
}

// Default fallback content when database is not available
const defaultContent = {
  hero: {
    title: 'About Us',
    subtitle: 'Discover who we are and what drives us to create unforgettable travel experiences.',
  },
  mission: {
    title: 'Our Mission',
    content: 'We are dedicated to providing exceptional tour experiences that create lasting memories. Our passion for travel and commitment to excellence drives everything we do.',
  },
  vision: {
    title: 'Our Vision',
    content: 'To be the most trusted and innovative tour company, connecting travelers with authentic experiences around the world.',
  },
  values: [
    { title: 'Excellence', description: 'We strive for excellence in every tour we offer.' },
    { title: 'Authenticity', description: 'We believe in genuine, local experiences.' },
    { title: 'Safety', description: 'Your safety is our top priority.' },
    { title: 'Sustainability', description: 'We are committed to responsible tourism.' },
  ],
  stats: [
    { value: '10,000+', label: 'Happy Travelers' },
    { value: '500+', label: 'Tours Completed' },
    { value: '50+', label: 'Destinations' },
    { value: '4.9', label: 'Average Rating' },
  ],
};

export default async function AboutPage({ params }: PageProps) {
  const { lang } = await params;
  const page = await getStaticPage('about', lang as Language);

  // Use page content if available, otherwise use default content
  const content = (page?.content || defaultContent) as {
    hero?: { title?: string; subtitle?: string };
    mission?: { title?: string; content?: string };
    vision?: { title?: string; content?: string };
    values?: { title: string; description: string }[];
    stats?: { value: string; label: string }[];
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30" />
        <Container className="relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700">
              About Us
            </span>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              {content.hero?.title || page?.title || 'About Us'}
            </h1>
            <p className="text-lg text-gray-600 md:text-xl">
              {content.hero?.subtitle}
            </p>
          </div>
        </Container>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Mission Card */}
            <div className="card bg-white shadow-sm border border-gray-200">
              <div className="card-body p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                  <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="mb-3 text-xl font-bold text-gray-900">
                  {content.mission?.title || 'Our Mission'}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {content.mission?.content}
                </p>
              </div>
            </div>

            {/* Vision Card */}
            <div className="card bg-white shadow-sm border border-gray-200">
              <div className="card-body p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                  <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="mb-3 text-xl font-bold text-gray-900">
                  {content.vision?.title || 'Our Vision'}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {content.vision?.content}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Values Section */}
      {content.values && content.values.length > 0 && (
        <section className="bg-gray-50 py-16 md:py-20">
          <Container>
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900">Our Values</h2>
              <p className="mt-3 text-gray-600">The principles that guide everything we do</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {content.values.map((value, index) => (
                <div key={index} className="card bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="card-body p-6 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold text-lg">
                      {index + 1}
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-900">{value.title}</h3>
                    <p className="text-sm text-gray-600">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Stats Section */}
      {content.stats && content.stats.length > 0 && (
        <section className="py-16 md:py-20">
          <Container>
            <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 p-8 md:p-12">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {content.stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl font-bold text-white md:text-5xl">
                      {stat.value}
                    </div>
                    <div className="mt-2 text-primary-100">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* CTA Section */}
      <section className="border-t border-gray-100 bg-gray-50 py-16">
        <Container>
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
              Ready to Start Your Adventure?
            </h2>
            <p className="mb-8 text-gray-600">
              Browse our collection of handpicked tours and create unforgettable memories.
            </p>
            <a
              href={`/${lang}/tours`}
              className="inline-flex items-center justify-center rounded-full bg-primary-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
            >
              Explore Tours
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}

