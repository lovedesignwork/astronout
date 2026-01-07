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
  const page = await getStaticPage('legal', lang as Language);

  return {
    title: page?.meta_title || page?.title || 'Legal Notice',
    description: page?.meta_description || 'Legal information and company details',
  };
}

// Default content when database is not available
const defaultContent = {
  hero: {
    title: 'Legal Notice',
    subtitle: 'Important legal information about our company and services.',
  },
  sections: [
    { title: 'Company Information', content: 'Company Name: Tour Booking Co., Ltd.\nRegistration Number: 0123456789\nRegistered Address: 123 Travel Street, Phuket, Thailand 83000\nEmail: legal@tourbooking.com\nPhone: +66 123 456 789' },
    { title: 'Responsible for Content', content: 'The content on this website is provided by Tour Booking Co., Ltd. We make every effort to ensure the accuracy and completeness of the information provided.' },
    { title: 'Intellectual Property', content: 'All content on this website, including text, images, logos, and graphics, is protected by copyright and other intellectual property laws. Unauthorized use is prohibited.' },
    { title: 'Disclaimer', content: 'While we strive to provide accurate information, we cannot guarantee the completeness or accuracy of all content. Tour availability and pricing are subject to change without notice.' },
  ],
};

export default async function LegalPage({ params }: PageProps) {
  const { lang } = await params;
  const page = await getStaticPage('legal', lang as Language);

  const content = (page?.content || defaultContent) as {
    hero?: { title?: string; subtitle?: string };
    sections?: { title: string; content: string }[];
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Container className="py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-gray-100 p-3">
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              {content.hero?.title || page?.title || 'Legal Notice'}
            </h1>
            <p className="text-gray-600">
              {content.hero?.subtitle}
            </p>
          </div>
        </Container>
      </section>

      {/* Content Sections */}
      <section className="py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="card bg-white shadow-sm border border-gray-200">
              <div className="card-body divide-y divide-gray-100">
                {content.sections?.map((section, index) => (
                  <div key={index} className="p-6 md:p-8">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                      {section.title}
                    </h2>
                    <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Updated */}
            <div className="mt-8 text-center text-sm text-gray-500">
              Last updated: January 1, 2026
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

