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
  const page = await getStaticPage('cookies', lang as Language);

  return {
    title: page?.meta_title || page?.title || 'Cookie Policy',
    description: page?.meta_description || 'Learn about how we use cookies',
  };
}

// Default content when database is not available
const defaultContent = {
  hero: {
    title: 'Cookie Policy',
    subtitle: 'Learn about how we use cookies and similar technologies on our website.',
  },
  lastUpdated: 'January 1, 2026',
  intro: 'We use cookies and similar tracking technologies to improve your browsing experience, analyze site traffic, and understand where our visitors come from.',
  sections: [
    { 
      title: 'What Are Cookies?', 
      content: 'Cookies are small text files that are stored on your device when you visit a website. They help the website remember your preferences and improve your experience.',
      items: [] 
    },
    { 
      title: 'Types of Cookies We Use', 
      content: 'We use different types of cookies for various purposes:',
      items: [
        { name: 'Essential Cookies', description: 'Required for the website to function properly. These cannot be disabled.' },
        { name: 'Analytics Cookies', description: 'Help us understand how visitors interact with our website.' },
        { name: 'Functional Cookies', description: 'Remember your preferences and settings.' },
        { name: 'Marketing Cookies', description: 'Used to deliver relevant advertisements.' },
      ]
    },
    { 
      title: 'Managing Cookies', 
      content: 'You can control and manage cookies through your browser settings. Note that disabling certain cookies may affect the functionality of our website.',
      items: [] 
    },
  ],
};

export default async function CookiesPage({ params }: PageProps) {
  const { lang } = await params;
  const page = await getStaticPage('cookies', lang as Language);

  const content = (page?.content || defaultContent) as {
    hero?: { title?: string; subtitle?: string };
    lastUpdated?: string;
    intro?: string;
    sections?: { 
      title: string; 
      content: string;
      items?: { name: string; description: string }[];
    }[];
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-amber-50">
        <Container className="py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-amber-100 p-3">
              <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              {content.hero?.title || page?.title || 'Cookie Policy'}
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

      {/* Introduction */}
      {content.intro && (
        <section className="py-8">
          <Container>
            <div className="mx-auto max-w-3xl">
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-6">
                <p className="text-gray-700">{content.intro}</p>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Content Sections */}
      <section className="py-8 md:py-12">
        <Container>
          <div className="mx-auto max-w-3xl space-y-6">
            {content.sections?.map((section, index) => (
              <div key={index} className="card bg-white shadow-sm border border-gray-200">
                <div className="card-body p-6 md:p-8">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    {section.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {section.content}
                  </p>
                  
                  {/* Cookie Types List */}
                  {section.items && section.items.length > 0 && (
                    <div className="mt-6 space-y-4">
                      {section.items.map((item, itemIndex) => (
                        <div 
                          key={itemIndex} 
                          className="flex items-start gap-4 rounded-lg bg-gray-50 p-4"
                        >
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200">
                            <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Manage Preferences CTA */}
      <section className="border-t border-gray-100 bg-gray-50 py-12">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-3 text-xl font-bold text-gray-900">Manage Your Cookie Preferences</h2>
            <p className="mb-6 text-gray-600">
              You can adjust your cookie settings at any time through your browser preferences.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`/${lang}/privacy`}
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
              >
                Privacy Policy
              </a>
              <a
                href={`/${lang}/contact`}
                className="inline-flex items-center justify-center rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-700"
              >
                Contact Us
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

