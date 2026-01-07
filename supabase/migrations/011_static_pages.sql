-- =====================================================
-- STATIC PAGES TABLE
-- =====================================================
CREATE TABLE static_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  page_type TEXT NOT NULL DEFAULT 'content' CHECK (page_type IN ('content', 'form', 'accordion', 'listing')),
  icon TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_static_pages_slug ON static_pages(slug);
CREATE INDEX idx_static_pages_status ON static_pages(status);
CREATE INDEX idx_static_pages_order ON static_pages("order");

-- =====================================================
-- STATIC PAGES TRANSLATIONS TABLE
-- =====================================================
CREATE TABLE static_pages_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES static_pages(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('en', 'zh', 'ru', 'ko', 'ja', 'fr', 'it', 'es', 'id')),
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(page_id, language)
);

CREATE INDEX idx_static_pages_translations_page_id ON static_pages_translations(page_id);
CREATE INDEX idx_static_pages_translations_language ON static_pages_translations(language);

-- =====================================================
-- RLS POLICIES FOR STATIC PAGES
-- =====================================================
ALTER TABLE static_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE static_pages_translations ENABLE ROW LEVEL SECURITY;

-- Public can read published pages
CREATE POLICY "Allow public read access to published static_pages"
  ON static_pages
  FOR SELECT
  USING (status = 'published');

-- Admin users can do everything on static_pages
CREATE POLICY "Allow admin users full access to static_pages"
  ON static_pages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Public can read translations of published pages
CREATE POLICY "Allow public read access to static_pages_translations"
  ON static_pages_translations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM static_pages
      WHERE static_pages.id = static_pages_translations.page_id
      AND static_pages.status = 'published'
    )
  );

-- Admin users can do everything on translations
CREATE POLICY "Allow admin users full access to static_pages_translations"
  ON static_pages_translations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- =====================================================
-- SEED DEFAULT PAGES WITH ENGLISH CONTENT
-- =====================================================

-- About Us
INSERT INTO static_pages (slug, status, page_type, icon, "order") VALUES
  ('about', 'published', 'content', 'info-circle', 1);
INSERT INTO static_pages_translations (page_id, language, title, content, meta_title, meta_description) VALUES
  ((SELECT id FROM static_pages WHERE slug = 'about'), 'en', 'About Us', '{
    "hero": {
      "title": "About Us",
      "subtitle": "Discover who we are and what drives us to create unforgettable travel experiences."
    },
    "mission": {
      "title": "Our Mission",
      "content": "We are dedicated to providing exceptional tour experiences that create lasting memories. Our passion for travel and commitment to excellence drives everything we do."
    },
    "vision": {
      "title": "Our Vision",
      "content": "To be the most trusted and innovative tour company, connecting travelers with authentic experiences around the world."
    },
    "values": [
      {"title": "Excellence", "description": "We strive for excellence in every tour we offer."},
      {"title": "Authenticity", "description": "We believe in genuine, local experiences."},
      {"title": "Safety", "description": "Your safety is our top priority."},
      {"title": "Sustainability", "description": "We are committed to responsible tourism."}
    ],
    "stats": [
      {"value": "10,000+", "label": "Happy Travelers"},
      {"value": "500+", "label": "Tours Completed"},
      {"value": "50+", "label": "Destinations"},
      {"value": "4.9", "label": "Average Rating"}
    ]
  }'::jsonb, 'About Us | Tour Booking', 'Learn about our company, mission, and the team behind your unforgettable travel experiences.');

-- Legal Notice
INSERT INTO static_pages (slug, status, page_type, icon, "order") VALUES
  ('legal', 'published', 'content', 'scale', 2);
INSERT INTO static_pages_translations (page_id, language, title, content, meta_title, meta_description) VALUES
  ((SELECT id FROM static_pages WHERE slug = 'legal'), 'en', 'Legal Notice', '{
    "hero": {
      "title": "Legal Notice",
      "subtitle": "Important legal information about our company and services."
    },
    "sections": [
      {
        "title": "Company Information",
        "content": "Company Name: Tour Booking Co., Ltd.\nRegistration Number: 0123456789\nRegistered Address: 123 Travel Street, Phuket, Thailand 83000\nEmail: legal@tourbooking.com\nPhone: +66 123 456 789"
      },
      {
        "title": "Responsible for Content",
        "content": "The content on this website is provided by Tour Booking Co., Ltd. We make every effort to ensure the accuracy and completeness of the information provided."
      },
      {
        "title": "Intellectual Property",
        "content": "All content on this website, including text, images, logos, and graphics, is protected by copyright and other intellectual property laws. Unauthorized use is prohibited."
      },
      {
        "title": "Disclaimer",
        "content": "While we strive to provide accurate information, we cannot guarantee the completeness or accuracy of all content. Tour availability and pricing are subject to change without notice."
      }
    ]
  }'::jsonb, 'Legal Notice | Tour Booking', 'Legal information and company details for Tour Booking.');

-- Terms & Conditions
INSERT INTO static_pages (slug, status, page_type, icon, "order") VALUES
  ('terms', 'published', 'content', 'document-text', 3);
INSERT INTO static_pages_translations (page_id, language, title, content, meta_title, meta_description) VALUES
  ((SELECT id FROM static_pages WHERE slug = 'terms'), 'en', 'Terms & Conditions', '{
    "hero": {
      "title": "Terms & Conditions",
      "subtitle": "Please read these terms carefully before using our services."
    },
    "lastUpdated": "January 1, 2026",
    "sections": [
      {
        "title": "1. Acceptance of Terms",
        "content": "By accessing and using our services, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services."
      },
      {
        "title": "2. Booking and Payment",
        "content": "All bookings are subject to availability. Full payment is required at the time of booking unless otherwise specified. We accept major credit cards and other payment methods as displayed on our website."
      },
      {
        "title": "3. Cancellation Policy",
        "content": "Cancellations made 48 hours or more before the tour start time are eligible for a full refund. Cancellations made less than 48 hours before the tour start time are non-refundable. No-shows are non-refundable."
      },
      {
        "title": "4. Tour Modifications",
        "content": "We reserve the right to modify tour itineraries due to weather conditions, safety concerns, or other unforeseen circumstances. In such cases, we will provide alternative arrangements or refunds as appropriate."
      },
      {
        "title": "5. Liability",
        "content": "While we take all reasonable precautions to ensure your safety, participation in tours is at your own risk. We are not liable for any injury, loss, or damage that may occur during the tour."
      },
      {
        "title": "6. Code of Conduct",
        "content": "Participants are expected to behave responsibly and respectfully during tours. We reserve the right to refuse service or remove participants who violate this code of conduct."
      }
    ]
  }'::jsonb, 'Terms & Conditions | Tour Booking', 'Read our terms and conditions for booking tours and using our services.');

-- Privacy Policy
INSERT INTO static_pages (slug, status, page_type, icon, "order") VALUES
  ('privacy', 'published', 'content', 'shield-check', 4);
INSERT INTO static_pages_translations (page_id, language, title, content, meta_title, meta_description) VALUES
  ((SELECT id FROM static_pages WHERE slug = 'privacy'), 'en', 'Privacy Policy', '{
    "hero": {
      "title": "Privacy Policy",
      "subtitle": "Your privacy is important to us. Learn how we collect, use, and protect your information."
    },
    "lastUpdated": "January 1, 2026",
    "sections": [
      {
        "id": "information-collection",
        "title": "Information We Collect",
        "content": "We collect information you provide directly to us, such as your name, email address, phone number, and payment information when you make a booking. We also collect information about your device and how you interact with our website."
      },
      {
        "id": "information-use",
        "title": "How We Use Your Information",
        "content": "We use your information to process bookings, communicate with you about your tours, improve our services, and send you marketing communications (with your consent). We may also use your information for analytics and fraud prevention."
      },
      {
        "id": "information-sharing",
        "title": "Information Sharing",
        "content": "We do not sell your personal information. We may share your information with tour operators to fulfill your booking, payment processors to complete transactions, and service providers who assist our operations."
      },
      {
        "id": "data-security",
        "title": "Data Security",
        "content": "We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security."
      },
      {
        "id": "your-rights",
        "title": "Your Rights",
        "content": "You have the right to access, correct, or delete your personal information. You can also opt out of marketing communications at any time. Contact us to exercise these rights."
      },
      {
        "id": "contact",
        "title": "Contact Us",
        "content": "If you have questions about this Privacy Policy, please contact us at privacy@tourbooking.com."
      }
    ]
  }'::jsonb, 'Privacy Policy | Tour Booking', 'Learn how we collect, use, and protect your personal information.');

-- Cookie Policy
INSERT INTO static_pages (slug, status, page_type, icon, "order") VALUES
  ('cookies', 'published', 'content', 'cookie', 5);
INSERT INTO static_pages_translations (page_id, language, title, content, meta_title, meta_description) VALUES
  ((SELECT id FROM static_pages WHERE slug = 'cookies'), 'en', 'Cookie Policy', '{
    "hero": {
      "title": "Cookie Policy",
      "subtitle": "Learn how we use cookies and similar technologies on our website."
    },
    "lastUpdated": "January 1, 2026",
    "intro": "This Cookie Policy explains how we use cookies and similar tracking technologies when you visit our website.",
    "sections": [
      {
        "title": "What Are Cookies?",
        "content": "Cookies are small text files that are stored on your device when you visit a website. They help the website remember your preferences and improve your browsing experience."
      },
      {
        "title": "Types of Cookies We Use",
        "content": "We use the following types of cookies:",
        "items": [
          {"name": "Essential Cookies", "description": "Required for the website to function properly. These cannot be disabled."},
          {"name": "Analytics Cookies", "description": "Help us understand how visitors interact with our website."},
          {"name": "Functional Cookies", "description": "Remember your preferences and settings."},
          {"name": "Marketing Cookies", "description": "Used to deliver relevant advertisements."}
        ]
      },
      {
        "title": "Managing Cookies",
        "content": "You can control and manage cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of our website."
      },
      {
        "title": "Third-Party Cookies",
        "content": "Some cookies are placed by third-party services that appear on our pages. We do not control these cookies and recommend reviewing the privacy policies of these third parties."
      }
    ]
  }'::jsonb, 'Cookie Policy | Tour Booking', 'Understand how we use cookies and how you can manage your preferences.');

-- CCPA (Do Not Sell My Personal Information)
INSERT INTO static_pages (slug, status, page_type, icon, "order") VALUES
  ('ccpa', 'published', 'form', 'user-shield', 6);
INSERT INTO static_pages_translations (page_id, language, title, content, meta_title, meta_description) VALUES
  ((SELECT id FROM static_pages WHERE slug = 'ccpa'), 'en', 'Do Not Sell My Personal Information', '{
    "hero": {
      "title": "Do Not Sell My Personal Information",
      "subtitle": "Exercise your rights under the California Consumer Privacy Act (CCPA)."
    },
    "intro": "Under the California Consumer Privacy Act (CCPA), California residents have the right to opt out of the sale of their personal information. While we do not sell personal information in the traditional sense, we provide this form to ensure transparency and compliance.",
    "rights": [
      {"title": "Right to Know", "description": "You can request information about the personal data we collect about you."},
      {"title": "Right to Delete", "description": "You can request that we delete your personal information."},
      {"title": "Right to Opt-Out", "description": "You can opt out of the sale of your personal information."},
      {"title": "Right to Non-Discrimination", "description": "We will not discriminate against you for exercising your rights."}
    ],
    "form": {
      "title": "Submit Your Request",
      "fields": ["name", "email", "request_type"],
      "submitText": "Submit Request"
    }
  }'::jsonb, 'Do Not Sell My Personal Information | Tour Booking', 'Exercise your CCPA rights and manage your personal information preferences.');

-- Partnership
INSERT INTO static_pages (slug, status, page_type, icon, "order") VALUES
  ('partnership', 'published', 'form', 'handshake', 7);
INSERT INTO static_pages_translations (page_id, language, title, content, meta_title, meta_description) VALUES
  ((SELECT id FROM static_pages WHERE slug = 'partnership'), 'en', 'Partnership', '{
    "hero": {
      "title": "Partner With Us",
      "subtitle": "Join our network and grow your business with us."
    },
    "intro": "We are always looking for passionate partners who share our commitment to exceptional travel experiences. Whether you are a tour operator, hotel, or travel agency, we would love to hear from you.",
    "benefits": [
      {"icon": "chart-bar", "title": "Increased Visibility", "description": "Reach thousands of travelers actively searching for experiences."},
      {"icon": "currency-dollar", "title": "Competitive Commission", "description": "Enjoy competitive commission rates and timely payments."},
      {"icon": "support", "title": "Dedicated Support", "description": "Get personalized support from our partnership team."},
      {"icon": "globe", "title": "Global Reach", "description": "Access customers from around the world through our platform."}
    ],
    "partnerTypes": [
      {"title": "Tour Operators", "description": "List your tours and reach more customers."},
      {"title": "Hotels & Resorts", "description": "Offer exclusive packages to our travelers."},
      {"title": "Travel Agencies", "description": "Become an affiliate and earn commissions."},
      {"title": "Activity Providers", "description": "Showcase your unique experiences."}
    ],
    "form": {
      "title": "Apply for Partnership",
      "fields": ["company_name", "contact_name", "email", "phone", "website", "partner_type", "message"],
      "submitText": "Submit Application"
    }
  }'::jsonb, 'Partnership | Tour Booking', 'Partner with us to grow your travel business and reach more customers.');

-- FAQ
INSERT INTO static_pages (slug, status, page_type, icon, "order") VALUES
  ('faq', 'published', 'accordion', 'question-mark-circle', 8);
INSERT INTO static_pages_translations (page_id, language, title, content, meta_title, meta_description) VALUES
  ((SELECT id FROM static_pages WHERE slug = 'faq'), 'en', 'Frequently Asked Questions', '{
    "hero": {
      "title": "Frequently Asked Questions",
      "subtitle": "Find answers to common questions about our tours and services."
    },
    "categories": [
      {
        "name": "Booking & Payment",
        "questions": [
          {"question": "How do I book a tour?", "answer": "You can book a tour directly on our website by selecting your preferred tour, choosing a date and time, and completing the checkout process. You will receive a confirmation email with your voucher."},
          {"question": "What payment methods do you accept?", "answer": "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and various local payment methods depending on your region."},
          {"question": "Can I pay in installments?", "answer": "Currently, we require full payment at the time of booking. However, we are working on introducing flexible payment options in the future."},
          {"question": "Is my payment secure?", "answer": "Yes, all payments are processed through secure, encrypted connections. We use industry-standard security measures to protect your financial information."}
        ]
      },
      {
        "name": "Cancellation & Refunds",
        "questions": [
          {"question": "What is your cancellation policy?", "answer": "Cancellations made 48 hours or more before the tour start time are eligible for a full refund. Cancellations made less than 48 hours before are non-refundable."},
          {"question": "How do I cancel my booking?", "answer": "You can cancel your booking by contacting our customer support team via email or phone. Please have your booking reference number ready."},
          {"question": "How long does it take to receive a refund?", "answer": "Refunds are typically processed within 5-10 business days, depending on your payment method and bank."}
        ]
      },
      {
        "name": "Tours & Activities",
        "questions": [
          {"question": "What should I bring on the tour?", "answer": "Each tour has specific recommendations listed on its page. Generally, we recommend comfortable clothing, sunscreen, a hat, and a camera. Some tours may require swimwear or hiking shoes."},
          {"question": "Are tours suitable for children?", "answer": "Many of our tours are family-friendly. Check the tour details for age restrictions and recommendations. Some adventure tours may have minimum age requirements."},
          {"question": "What happens if the weather is bad?", "answer": "Safety is our priority. If weather conditions are unsafe, we will reschedule your tour or offer a full refund. Minor weather changes typically do not affect tour operations."},
          {"question": "Can I request a private tour?", "answer": "Yes, many of our tours can be arranged as private experiences. Contact us for availability and pricing for private tours."}
        ]
      },
      {
        "name": "Account & Support",
        "questions": [
          {"question": "How do I contact customer support?", "answer": "You can reach us via email at support@tourbooking.com, by phone at +66 123 456 789, or through the contact form on our website. We aim to respond within 24 hours."},
          {"question": "Do I need to create an account to book?", "answer": "No, you can book as a guest. However, creating an account allows you to easily manage your bookings and access exclusive offers."},
          {"question": "How can I view my booking history?", "answer": "If you have an account, log in and visit your dashboard to view all past and upcoming bookings. Guest bookings can be accessed via the confirmation email."}
        ]
      }
    ],
    "contact": {
      "title": "Still have questions?",
      "description": "Our support team is here to help.",
      "buttonText": "Contact Us"
    }
  }'::jsonb, 'FAQ | Tour Booking', 'Find answers to frequently asked questions about booking tours, payments, cancellations, and more.');

-- Contact
INSERT INTO static_pages (slug, status, page_type, icon, "order") VALUES
  ('contact', 'published', 'form', 'mail', 9);
INSERT INTO static_pages_translations (page_id, language, title, content, meta_title, meta_description) VALUES
  ((SELECT id FROM static_pages WHERE slug = 'contact'), 'en', 'Contact Us', '{
    "hero": {
      "title": "Contact Us",
      "subtitle": "We would love to hear from you. Get in touch with our team."
    },
    "contactInfo": {
      "email": {"label": "Email", "value": "hello@tourbooking.com", "icon": "mail"},
      "phone": {"label": "Phone", "value": "+66 123 456 789", "icon": "phone"},
      "address": {"label": "Address", "value": "123 Travel Street, Phuket, Thailand 83000", "icon": "location-marker"},
      "hours": {"label": "Business Hours", "value": "Monday - Friday: 9:00 AM - 6:00 PM (ICT)", "icon": "clock"}
    },
    "form": {
      "title": "Send us a message",
      "fields": ["name", "email", "subject", "message"],
      "submitText": "Send Message"
    },
    "social": {
      "title": "Follow Us",
      "links": [
        {"platform": "facebook", "url": "https://facebook.com"},
        {"platform": "instagram", "url": "https://instagram.com"},
        {"platform": "twitter", "url": "https://twitter.com"}
      ]
    }
  }'::jsonb, 'Contact Us | Tour Booking', 'Get in touch with our team for questions, support, or partnership inquiries.');

-- Blog
INSERT INTO static_pages (slug, status, page_type, icon, "order") VALUES
  ('blog', 'published', 'listing', 'newspaper', 10);
INSERT INTO static_pages_translations (page_id, language, title, content, meta_title, meta_description) VALUES
  ((SELECT id FROM static_pages WHERE slug = 'blog'), 'en', 'Blog', '{
    "hero": {
      "title": "Travel Blog",
      "subtitle": "Discover travel tips, destination guides, and inspiring stories."
    },
    "intro": "Welcome to our travel blog! Here you will find the latest travel tips, destination guides, and stories from our adventures around the world.",
    "categories": ["Travel Tips", "Destination Guides", "Adventure Stories", "Culture & Food"],
    "featuredPosts": [
      {
        "title": "Top 10 Things to Do in Phuket",
        "excerpt": "Discover the best attractions, beaches, and hidden gems in Thailand most popular island destination.",
        "image": "/images/blog/phuket.jpg",
        "date": "2026-01-01",
        "category": "Destination Guides"
      },
      {
        "title": "Essential Packing Tips for Tropical Adventures",
        "excerpt": "Learn what to pack for your next tropical getaway with our comprehensive packing guide.",
        "image": "/images/blog/packing.jpg",
        "date": "2025-12-15",
        "category": "Travel Tips"
      },
      {
        "title": "A Culinary Journey Through Thai Street Food",
        "excerpt": "Explore the vibrant world of Thai street food and discover must-try dishes.",
        "image": "/images/blog/thai-food.jpg",
        "date": "2025-12-01",
        "category": "Culture & Food"
      }
    ],
    "cta": {
      "title": "Subscribe to Our Newsletter",
      "description": "Get the latest travel tips and exclusive offers delivered to your inbox.",
      "buttonText": "Subscribe"
    }
  }'::jsonb, 'Travel Blog | Tour Booking', 'Explore our travel blog for destination guides, travel tips, and inspiring adventure stories.');

-- =====================================================
-- UPDATE TRIGGER FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_static_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_static_pages_updated_at
  BEFORE UPDATE ON static_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_static_pages_updated_at();

CREATE TRIGGER trigger_static_pages_translations_updated_at
  BEFORE UPDATE ON static_pages_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_static_pages_updated_at();




