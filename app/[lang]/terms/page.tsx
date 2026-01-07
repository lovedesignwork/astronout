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
  const page = await getStaticPage('terms', lang as Language);

  return {
    title: page?.meta_title || page?.title || 'Terms & Conditions',
    description: page?.meta_description || 'Read our terms and conditions',
  };
}

// Default content when database is not available
const defaultContent = {
  hero: {
    title: 'Terms & Conditions',
    subtitle: 'Please read these terms carefully before using our services.',
  },
  lastUpdated: 'January 1, 2026',
  sections: [
    { title: '1. Acceptance of Terms', content: 'By accessing and using our services, you accept and agree to be bound by the terms and provisions of this agreement.' },
    { title: '2. Booking and Payments', content: 'All bookings are subject to availability and confirmation. Payment must be made in full at the time of booking unless otherwise specified.' },
    { title: '3. Cancellation Policy', content: 'Cancellations made 48 hours or more before the tour start time are eligible for a full refund. Cancellations made less than 48 hours before are non-refundable.' },
    { title: '4. Limitation of Liability', content: 'We are not liable for any indirect, incidental, or consequential damages arising from the use of our services.' },
    { title: '5. Changes to Terms', content: 'We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.' },
  ],
};

export default async function TermsPage({ params }: PageProps) {
  const { lang } = await params;
  const page = await getStaticPage('terms', lang as Language);

  const content = (page?.content || defaultContent) as {
    hero?: { title?: string; subtitle?: string };
    lastUpdated?: string;
    sections?: { title: string; content: string }[];
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <Container className="py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary-100 p-3">
              <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              {content.hero?.title || page?.title || 'Terms & Conditions'}
            </h1>
            <p className="text-gray-600">
              {content.hero?.subtitle}
            </p>
            {content.lastUpdated && (
              <p className="mt-4 text-sm text-gray-500">
                Last updated: {content.lastUpdated}
              </p>
            )}
          </div>
        </Container>
      </section>

      {/* Terms Content */}
      <section className="py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="card bg-white shadow-sm border border-gray-200">
              <div className="card-body p-6 md:p-8">
                <div className="space-y-8">
                  {content.sections?.map((section, index) => (
                    <div key={index} className="scroll-mt-24" id={`section-${index + 1}`}>
                      <h2 className="mb-4 text-lg font-semibold text-gray-900">
                        {section.title}
                      </h2>
                      <div className="text-gray-600 leading-relaxed">
                        {section.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Note */}
            <div className="mt-8 rounded-xl bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-600">
                If you have any questions about these Terms & Conditions, please{' '}
                <a href={`/${lang}/contact`} className="text-primary-600 hover:text-primary-700 font-medium">
                  contact us
                </a>
                .
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

