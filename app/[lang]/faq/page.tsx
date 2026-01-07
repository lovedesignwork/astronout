'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/layout/Container';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  name: string;
  questions: FAQItem[];
}

interface FAQContent {
  hero?: { title?: string; subtitle?: string };
  categories?: FAQCategory[];
  contact?: { title?: string; description?: string; buttonText?: string };
}

// Default FAQ content when database is not available
const defaultContent: FAQContent = {
  hero: {
    title: 'Frequently Asked Questions',
    subtitle: 'Find answers to common questions about our tours and services.',
  },
  categories: [
    {
      name: 'Booking',
      questions: [
        { question: 'How do I book a tour?', answer: 'You can book a tour directly through our website by selecting your preferred tour, date, and number of participants. Follow the checkout process to complete your booking.' },
        { question: 'Can I cancel or modify my booking?', answer: 'Yes, you can cancel or modify your booking up to 24 hours before the tour start time. Please contact our support team or visit your booking confirmation page.' },
        { question: 'What payment methods do you accept?', answer: 'We accept major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for select tours.' },
      ],
    },
    {
      name: 'Tours',
      questions: [
        { question: 'What should I bring on a tour?', answer: 'Each tour has specific requirements listed on its page. Generally, we recommend comfortable clothing, sunscreen, water, and a camera.' },
        { question: 'Are meals included in the tour price?', answer: 'Meal inclusions vary by tour. Check the "What\'s Included" section on each tour page for specific details.' },
        { question: 'What happens if the weather is bad?', answer: 'For weather-dependent tours, we may reschedule or offer a full refund if conditions are unsafe. We\'ll notify you as soon as possible.' },
      ],
    },
    {
      name: 'Support',
      questions: [
        { question: 'How can I contact customer support?', answer: 'You can reach us via email at hello@astronout.co, by phone at +66 123 456 789, or through the contact form on our website.' },
        { question: 'What are your business hours?', answer: 'Our support team is available Monday to Friday, 9:00 AM to 6:00 PM (ICT). For urgent matters during tours, emergency contacts are provided in your booking confirmation.' },
      ],
    },
  ],
  contact: {
    title: 'Still have questions?',
    description: 'Our support team is here to help.',
    buttonText: 'Contact Us',
  },
};

export default function FAQPage() {
  const { language } = useLanguage();
  const [content, setContent] = useState<FAQContent>(defaultContent);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(defaultContent.categories?.[0]?.name || null);

  useEffect(() => {
    // Try to fetch FAQ content from public API, but use defaults if unavailable
    fetch(`/api/static-pages/faq`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.page?.content) {
          setContent(data.page.content as FAQContent);
          if (data.page.content?.categories?.[0]) {
            setActiveCategory(data.page.content.categories[0].name);
          }
        }
      })
      .catch(() => {
        // Use default content on error
      });
  }, [language]);

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Filter questions based on search
  const filteredCategories = content?.categories?.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

  const displayCategories = searchQuery ? filteredCategories : content?.categories;

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
        <Container className="py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-indigo-100 p-3">
              <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              {content?.hero?.title || 'Frequently Asked Questions'}
            </h1>
            <p className="mb-8 text-gray-600">
              {content?.hero?.subtitle || 'Find answers to common questions about our tours and services.'}
            </p>

            {/* Search Bar */}
            <div className="relative mx-auto max-w-xl">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for answers..."
                className="w-full rounded-full border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ Content */}
      <section className="py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-4xl">
            {/* Category Tabs */}
            {!searchQuery && displayCategories && displayCategories.length > 1 && (
              <div className="mb-8 flex flex-wrap gap-2 justify-center">
                {displayCategories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setActiveCategory(category.name)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      activeCategory === category.name
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}

            {/* FAQ Items */}
            <div className="space-y-4">
              {displayCategories?.map((category) => {
                // If not searching and category doesn't match active, skip
                if (!searchQuery && activeCategory && category.name !== activeCategory) {
                  return null;
                }

                return (
                  <div key={category.name}>
                    {searchQuery && (
                      <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        {category.name}
                      </h3>
                    )}
                    <div className="space-y-3">
                      {category.questions.map((item, index) => {
                        const itemId = `${category.name}-${index}`;
                        const isExpanded = expandedItems.has(itemId);

                        return (
                          <div
                            key={itemId}
                            className="card bg-white shadow-sm border border-gray-200 overflow-hidden"
                          >
                            <button
                              onClick={() => toggleItem(itemId)}
                              className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                            >
                              <span className="font-medium text-gray-900 pr-4">
                                {item.question}
                              </span>
                              <span className={`flex-shrink-0 ml-2 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </span>
                            </button>
                            <div
                              className={`overflow-hidden transition-all duration-200 ${
                                isExpanded ? 'max-h-96' : 'max-h-0'
                              }`}
                            >
                              <div className="px-5 pb-5 text-gray-600 border-t border-gray-100 pt-4">
                                {item.answer}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No Results */}
            {searchQuery && (!displayCategories || displayCategories.length === 0) && (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No results found</h3>
                <p className="mt-2 text-gray-600">
                  We couldn&apos;t find any questions matching &quot;{searchQuery}&quot;
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Contact CTA */}
      <section className="border-t border-gray-100 bg-gray-50 py-12">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-3 text-xl font-bold text-gray-900">
              {content?.contact?.title || 'Still have questions?'}
            </h2>
            <p className="mb-6 text-gray-600">
              {content?.contact?.description || 'Our support team is here to help.'}
            </p>
            <a
              href={`/${language}/contact`}
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
            >
              {content?.contact?.buttonText || 'Contact Us'}
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}

