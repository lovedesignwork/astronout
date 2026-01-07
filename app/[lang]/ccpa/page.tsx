'use client';

import { useState } from 'react';
import { Container } from '@/components/layout/Container';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function CCPAPage() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    requestType: 'opt-out',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const rights = [
    { 
      title: 'Right to Know', 
      description: 'You can request information about the personal data we collect about you.',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      title: 'Right to Delete', 
      description: 'You can request that we delete your personal information.',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )
    },
    { 
      title: 'Right to Opt-Out', 
      description: 'You can opt out of the sale of your personal information.',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      )
    },
    { 
      title: 'Right to Non-Discrimination', 
      description: 'We will not discriminate against you for exercising your rights.',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-violet-50">
        <Container className="py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-violet-100 p-3">
              <svg className="h-6 w-6 text-violet-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Do Not Sell My Personal Information
            </h1>
            <p className="text-gray-600">
              Exercise your rights under the California Consumer Privacy Act (CCPA).
            </p>
          </div>
        </Container>
      </section>

      {/* Introduction */}
      <section className="py-8">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="rounded-xl bg-violet-50 border border-violet-100 p-6">
              <p className="text-gray-700">
                Under the California Consumer Privacy Act (CCPA), California residents have the right to opt out of the sale of their personal information. While we do not sell personal information in the traditional sense, we provide this form to ensure transparency and compliance.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Your Rights */}
      <section className="py-8 md:py-12">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-xl font-bold text-gray-900 text-center">Your Rights Under CCPA</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {rights.map((right, index) => (
                <div key={index} className="card bg-white shadow-sm border border-gray-200">
                  <div className="card-body p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                        {right.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{right.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{right.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Request Form */}
      <section className="py-8 md:py-12 bg-gray-50">
        <Container>
          <div className="mx-auto max-w-xl">
            <div className="card bg-white shadow-sm border border-gray-200">
              <div className="card-body p-6 md:p-8">
                <h2 className="mb-6 text-xl font-bold text-gray-900 text-center">Submit Your Request</h2>
                
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Request Submitted</h3>
                    <p className="mt-2 text-gray-600">
                      We have received your request and will process it within 45 days as required by law.
                    </p>
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({ name: '', email: '', requestType: 'opt-out' });
                      }}
                      className="mt-6 text-sm text-violet-600 hover:text-violet-700 font-medium"
                    >
                      Submit another request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Request Type
                      </label>
                      <select
                        value={formData.requestType}
                        onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                      >
                        <option value="opt-out">Opt-Out of Sale of Personal Information</option>
                        <option value="know">Request to Know (Access Data)</option>
                        <option value="delete">Request to Delete</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        'Submit Request'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              Need help?{' '}
              <a href={`/${language}/contact`} className="text-violet-600 hover:text-violet-700 font-medium">
                Contact our privacy team
              </a>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}



