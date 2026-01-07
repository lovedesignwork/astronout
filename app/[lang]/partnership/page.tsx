'use client';

import { useState } from 'react';
import { Container } from '@/components/layout/Container';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function PartnershipPage() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    partnerType: '',
    message: '',
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

  const benefits = [
    { 
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: 'Increased Visibility', 
      description: 'Reach thousands of travelers actively searching for experiences.' 
    },
    { 
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Competitive Commission', 
      description: 'Enjoy competitive commission rates and timely payments.' 
    },
    { 
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: 'Dedicated Support', 
      description: 'Get personalized support from our partnership team.' 
    },
    { 
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Global Reach', 
      description: 'Access customers from around the world through our platform.' 
    },
  ];

  const partnerTypes = [
    { value: 'tour-operator', label: 'Tour Operator', description: 'List your tours and reach more customers.' },
    { value: 'hotel', label: 'Hotel & Resort', description: 'Offer exclusive packages to our travelers.' },
    { value: 'agency', label: 'Travel Agency', description: 'Become an affiliate and earn commissions.' },
    { value: 'activity', label: 'Activity Provider', description: 'Showcase your unique experiences.' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-teal-50">
        <Container className="py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-teal-100 px-4 py-1.5 text-sm font-medium text-teal-700">
              Partnership Program
            </span>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Partner With Us
            </h1>
            <p className="text-lg text-gray-600 md:text-xl">
              Join our network and grow your business with us. We&apos;re always looking for passionate partners who share our commitment to exceptional travel experiences.
            </p>
          </div>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Why Partner With Us?</h2>
            <p className="mt-3 text-gray-600">Discover the advantages of joining our partner network</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="card bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="card-body p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                    {benefit.icon}
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Partner Types */}
      <section className="bg-gray-50 py-16 md:py-20">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Who Can Partner?</h2>
            <p className="mt-3 text-gray-600">We work with various types of travel businesses</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {partnerTypes.map((type, index) => (
              <div key={index} className="card bg-white shadow-sm border border-gray-200">
                <div className="card-body p-5 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-white font-bold">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-gray-900">{type.label}</h3>
                  <p className="mt-1 text-sm text-gray-600">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Application Form */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-2xl">
            <div className="card bg-white shadow-sm border border-gray-200">
              <div className="card-body p-6 md:p-8">
                <h2 className="mb-6 text-xl font-bold text-gray-900 text-center">Apply for Partnership</h2>
                
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Application Submitted!</h3>
                    <p className="mt-2 text-gray-600">
                      Thank you for your interest in partnering with us. Our team will review your application and get back to you within 2-3 business days.
                    </p>
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({
                          companyName: '',
                          contactName: '',
                          email: '',
                          phone: '',
                          website: '',
                          partnerType: '',
                          message: '',
                        });
                      }}
                      className="mt-6 text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Submit another application
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                          placeholder="Your company name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Contact Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.contactName}
                          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                          placeholder="Your name"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                          placeholder="email@company.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                          placeholder="+1 234 567 890"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Website
                        </label>
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Partner Type *
                        </label>
                        <select
                          required
                          value={formData.partnerType}
                          onChange={(e) => setFormData({ ...formData, partnerType: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                        >
                          <option value="">Select type...</option>
                          {partnerTypes.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Tell us about your business
                      </label>
                      <textarea
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 resize-none"
                        placeholder="Describe your business and how you'd like to partner with us..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              Have questions?{' '}
              <a href={`/${language}/contact`} className="text-teal-600 hover:text-teal-700 font-medium">
                Contact our partnership team
              </a>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}




