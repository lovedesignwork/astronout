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
  const page = await getStaticPage('privacy', lang as Language);

  return {
    title: page?.meta_title || page?.title || 'Privacy Policy',
    description: page?.meta_description || 'Learn how we protect your privacy',
  };
}

// Default content when database is not available
const defaultContent = {
  hero: {
    title: 'Privacy Policy',
    subtitle: 'Your privacy is important to us. Learn how we collect, use, and protect your information.',
  },
  lastUpdated: 'January 1, 2026',
  sections: [
    { id: 'collection', title: 'Information We Collect', content: 'We collect information you provide directly, such as name, email, and payment details when booking tours. We also collect usage data and device information automatically.' },
    { id: 'use', title: 'How We Use Your Information', content: 'We use your information to process bookings, communicate with you, improve our services, and comply with legal obligations.' },
    { id: 'sharing', title: 'Information Sharing', content: 'We share your information with tour operators to fulfill bookings, payment processors for transactions, and service providers who assist our operations.' },
    { id: 'security', title: 'Data Security', content: 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, or destruction.' },
    { id: 'rights', title: 'Your Rights', content: 'You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.' },
  ],
};

export default async function PrivacyPage({ params }: PageProps) {
  const { lang } = await params;
  const page = await getStaticPage('privacy', lang as Language);

  const content = (page?.content || defaultContent) as {
    hero?: { title?: string; subtitle?: string };
    lastUpdated?: string;
    sections?: { id?: string; title: string; content: string }[];
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
        <Container className="py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-emerald-100 p-3">
              <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              {content.hero?.title || page?.title || 'Privacy Policy'}
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

      {/* Table of Contents + Content */}
      <section className="py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 lg:grid-cols-4">
              {/* Table of Contents - Sticky Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 rounded-xl bg-gray-50 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">Contents</h3>
                  <nav className="space-y-2">
                    {content.sections?.map((section, index) => (
                      <a
                        key={index}
                        href={`#${section.id || `section-${index}`}`}
                        className="block text-sm text-gray-600 hover:text-primary-600 transition-colors"
                      >
                        {section.title}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="card bg-white shadow-sm border border-gray-200">
                  <div className="card-body p-6 md:p-8">
                    <div className="space-y-10">
                      {content.sections?.map((section, index) => (
                        <div 
                          key={index} 
                          className="scroll-mt-24" 
                          id={section.id || `section-${index}`}
                        >
                          <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                              {index + 1}
                            </span>
                            {section.title}
                          </h2>
                          <div className="text-gray-600 leading-relaxed pl-9">
                            {section.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Contact Section */}
      <section className="border-t border-gray-100 bg-gray-50 py-12">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-3 text-xl font-bold text-gray-900">Questions About Your Privacy?</h2>
            <p className="mb-6 text-gray-600">
              We take your privacy seriously. If you have any questions or concerns, please don&apos;t hesitate to reach out.
            </p>
            <a
              href={`/${lang}/contact`}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700"
            >
              Contact Us
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}

