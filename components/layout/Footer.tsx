'use client';

import Link from 'next/link';
import { Container } from './Container';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export function Footer() {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <Container>
        <div className="py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link href={`/${language}`} className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(to bottom right, #0033FF, #0029cc)' }}>
                  <span className="text-lg font-bold text-white">A</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900">
                  ASTRONOUT
                </span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-gray-600">
                Your gateway to unforgettable tour experiences. Discover the best
                adventures with us.
              </p>
            </div>

            {/* Explore */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
                Explore
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href={`/${language}/tours`}
                    className="text-sm text-gray-600 transition-colors footer-link"
                  >
                    All Tours
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${language}/about`}
                    className="text-sm text-gray-600 transition-colors footer-link"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${language}/blog`}
                    className="text-sm text-gray-600 transition-colors footer-link"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${language}/partnership`}
                    className="text-sm text-gray-600 transition-colors footer-link"
                  >
                    Partnership
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
                Support
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href={`/${language}/faq`}
                    className="text-sm text-gray-600 transition-colors footer-link"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${language}/contact`}
                    className="text-sm text-gray-600 transition-colors footer-link"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:hello@astronout.co"
                    className="text-sm text-gray-600 transition-colors footer-link"
                  >
                    hello@astronout.co
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
                Legal
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href={`/${language}/terms`}
                    className="text-sm text-gray-600 transition-colors footer-link"
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${language}/privacy`}
                    className="text-sm text-gray-600 transition-colors footer-link"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${language}/cookies`}
                    className="text-sm text-gray-600 transition-colors footer-link"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${language}/legal`}
                    className="text-sm text-gray-600 transition-colors footer-link"
                  >
                    Legal Notice
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${language}/ccpa`}
                    className="text-sm text-gray-600 transition-colors footer-link"
                  >
                    Do Not Sell My Info
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
                Contact
              </h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>Phuket, Thailand</li>
                <li>
                  <a
                    href="tel:+66123456789"
                    className="transition-colors footer-link"
                  >
                    +66 123 456 789
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:hello@astronout.co"
                    className="transition-colors footer-link"
                  >
                    hello@astronout.co
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 md:flex-row">
            <p className="text-sm text-gray-500">
              © {currentYear} Astronout. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors social-link"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors social-link"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors social-link"
                aria-label="Twitter"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}


