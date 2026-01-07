-- =====================================================
-- SEED DATA FOR ASTRONOUT PLATFORM
-- =====================================================

-- Tour 1: Phuket Zipline Adventure (flat_per_person)
INSERT INTO tours (id, tour_number, slug, status, pricing_engine) VALUES
  ('11111111-1111-1111-1111-111111111111', '0001', 'phuket-zipline-adventure', 'published', 'flat_per_person');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('11111111-1111-1111-1111-111111111111', '{
    "type": "flat_per_person",
    "retail_price": 1800,
    "net_price": 1400,
    "currency": "THB",
    "min_pax": 1,
    "max_pax": 10
  }');

-- Blocks for Zipline
INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled, config) VALUES
  ('a1111111-0001-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'hero', 1, true, '{}'),
  ('a1111111-0002-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'highlights', 2, true, '{}'),
  ('a1111111-0003-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'availability_selector', 3, true, '{}'),
  ('a1111111-0004-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'pricing_selector', 4, true, '{}'),
  ('a1111111-0005-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'included_excluded', 5, true, '{}'),
  ('a1111111-0006-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'safety_info', 6, true, '{}'),
  ('a1111111-0007-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'upsells', 7, true, '{}'),
  ('a1111111-0008-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'terms', 8, true, '{}');

-- Translations for Zipline (EN + ZH only for testing fallback)
INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('a1111111-0001-0000-0000-000000000001', 'en', 'Phuket Zipline Adventure', '{"subtitle": "Soar through the jungle canopy on 16 thrilling ziplines", "description": "Experience the ultimate adventure as you fly through the lush tropical rainforest of Phuket on our world-class zipline course. Our professionally designed course features 16 platforms connected by thrilling ziplines, sky bridges, and rappelling stations. You will be equipped with top-of-the-line safety gear and guided by our certified instructors who ensure your safety while maximizing the fun. The course winds through ancient trees, offering breathtaking views of the jungle canopy and occasional glimpses of wildlife. Whether you are an adrenaline junkie or a first-time zipliner, this adventure promises unforgettable memories.", "imageUrl": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200", "location": "Phuket, Thailand", "duration": "4 hours", "rating": 4.8, "reviewCount": 324, "badges": ["Best Seller", "Eco-Friendly"]}'),
  ('a1111111-0001-0000-0000-000000000001', 'zh', '普吉岛丛林飞跃', '{"subtitle": "在16条刺激的滑索上穿越丛林树冠", "imageUrl": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200", "location": "泰国普吉岛", "duration": "4小时", "rating": 4.8, "reviewCount": 324, "badges": ["畅销", "环保"]}'),
  ('a1111111-0002-0000-0000-000000000001', 'en', 'Tour Highlights', '{"items": ["16 exciting zipline platforms", "Professional safety equipment", "Experienced guides", "Beautiful jungle scenery", "Photo opportunities", "Refreshments included"]}'),
  ('a1111111-0002-0000-0000-000000000001', 'zh', '行程亮点', '{"items": ["16个刺激的滑索平台", "专业安全设备", "经验丰富的导游", "美丽的丛林风景", "拍照机会", "含茶点"]}'),
  ('a1111111-0003-0000-0000-000000000001', 'en', 'Select Date', '{}'),
  ('a1111111-0004-0000-0000-000000000001', 'en', 'Select Tickets', '{}'),
  ('a1111111-0005-0000-0000-000000000001', 'en', 'What''s Included', '{"included": ["Hotel pickup & drop-off", "Safety equipment", "Professional guide", "Insurance", "Refreshments"], "excluded": ["Personal expenses", "Tips", "Lunch"]}'),
  ('a1111111-0006-0000-0000-000000000001', 'en', 'Safety Information', '{"items": ["Weight limit: 20-120kg", "Minimum age: 7 years", "Not suitable for pregnant women", "Closed-toe shoes required"], "restrictions": ["Heart conditions", "Back problems", "Fear of heights"]}'),
  ('a1111111-0007-0000-0000-000000000001', 'en', 'Add-ons', '{}'),
  ('a1111111-0008-0000-0000-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation up to 24 hours before the tour. 50% refund for cancellations within 24 hours.", "refundPolicy": "Full refund for cancellations due to weather conditions."}');

-- Availability for Zipline
INSERT INTO tour_availability (tour_id, date, time_slot, capacity, booked, enabled) VALUES
  ('11111111-1111-1111-1111-111111111111', '2026-01-15', '08:00', 20, 5, true),
  ('11111111-1111-1111-1111-111111111111', '2026-01-15', '13:00', 20, 3, true),
  ('11111111-1111-1111-1111-111111111111', '2026-01-16', '08:00', 20, 0, true),
  ('11111111-1111-1111-1111-111111111111', '2026-01-16', '13:00', 20, 0, true),
  ('11111111-1111-1111-1111-111111111111', '2026-01-17', '08:00', 20, 0, true),
  ('11111111-1111-1111-1111-111111111111', '2026-01-17', '13:00', 20, 0, true);

-- Upsells for Zipline
INSERT INTO upsells (id, tour_id, status, pricing_type, retail_price, net_price, currency, "order") VALUES
  ('c1111111-0001-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'active', 'per_booking', 500, 300, 'THB', 1),
  ('c1111111-0002-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'active', 'per_person', 200, 100, 'THB', 2);

INSERT INTO upsell_translations (upsell_id, language, title, description) VALUES
  ('c1111111-0001-0000-0000-000000000001', 'en', 'GoPro Video Package', 'Professional video recording of your zipline experience'),
  ('c1111111-0002-0000-0000-000000000001', 'en', 'Photo Package', 'Digital photos at each platform');

-- =====================================================
-- Tour 2: Phi Phi Islands Boat Tour (adult_child)
-- =====================================================
INSERT INTO tours (id, tour_number, slug, status, pricing_engine) VALUES
  ('22222222-2222-2222-2222-222222222222', '0002', 'phi-phi-islands-boat-tour', 'published', 'adult_child');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('22222222-2222-2222-2222-222222222222', '{
    "type": "adult_child",
    "adult_retail_price": 2500,
    "adult_net_price": 2000,
    "child_retail_price": 1500,
    "child_net_price": 1200,
    "currency": "THB",
    "child_age_max": 11,
    "min_pax": 1,
    "max_pax": 8
  }');

-- Blocks for Phi Phi
INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled, config) VALUES
  ('a2222222-0001-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'hero', 1, true, '{}'),
  ('a2222222-0002-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'highlights', 2, true, '{}'),
  ('a2222222-0003-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'itinerary', 3, true, '{}'),
  ('a2222222-0004-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'availability_selector', 4, true, '{}'),
  ('a2222222-0005-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'pricing_selector', 5, true, '{}'),
  ('a2222222-0006-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'included_excluded', 6, true, '{}'),
  ('a2222222-0007-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'what_to_bring', 7, true, '{}'),
  ('a2222222-0008-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'map', 8, true, '{}'),
  ('a2222222-0009-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'reviews', 9, true, '{}'),
  ('a2222222-0010-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'upsells', 10, true, '{}'),
  ('a2222222-0011-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'terms', 11, true, '{}');

-- Translations for Phi Phi (Full EN)
INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('a2222222-0001-0000-0000-000000000001', 'en', 'Phi Phi Islands Day Tour by Speedboat', '{"subtitle": "Visit Maya Bay, Pileh Lagoon, and more stunning locations", "imageUrl": "https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=1200", "location": "Phi Phi Islands, Thailand", "duration": "Full Day (8 hours)", "rating": 4.9, "reviewCount": 856, "badges": ["Top Rated", "Bestseller"]}'),
  ('a2222222-0002-0000-0000-000000000001', 'en', 'Tour Highlights', '{"items": ["Visit famous Maya Bay", "Snorkeling at Pileh Lagoon", "Monkey Beach visit", "Viking Cave viewing", "Lunch on Phi Phi Don", "Swimming in crystal clear waters"]}'),
  ('a2222222-0003-0000-0000-000000000001', 'en', 'Itinerary', '{"items": [{"time": "07:00", "title": "Hotel Pickup", "description": "Pickup from your hotel in Phuket"}, {"time": "08:30", "title": "Depart from Pier", "description": "Board speedboat and head to Phi Phi Islands"}, {"time": "10:00", "title": "Maya Bay", "description": "Visit the famous beach from The Beach movie"}, {"time": "11:00", "title": "Pileh Lagoon", "description": "Snorkeling in crystal clear waters"}, {"time": "12:30", "title": "Lunch", "description": "Thai buffet lunch on Phi Phi Don"}, {"time": "14:00", "title": "Monkey Beach", "description": "See wild monkeys in their natural habitat"}, {"time": "15:30", "title": "Return", "description": "Head back to Phuket"}, {"time": "17:30", "title": "Hotel Drop-off", "description": "Return to your hotel"}]}'),
  ('a2222222-0004-0000-0000-000000000001', 'en', 'Select Date', '{}'),
  ('a2222222-0005-0000-0000-000000000001', 'en', 'Select Tickets', '{}'),
  ('a2222222-0006-0000-0000-000000000001', 'en', 'What''s Included', '{"included": ["Hotel transfers", "Speedboat ride", "National park fees", "Snorkeling equipment", "Buffet lunch", "Drinking water", "English-speaking guide", "Insurance"], "excluded": ["Personal expenses", "Alcoholic drinks", "Tips"]}'),
  ('a2222222-0007-0000-0000-000000000001', 'en', 'What to Bring', '{"items": ["Swimwear", "Sunscreen", "Towel", "Camera", "Cash for extras", "Sunglasses", "Hat"], "note": "Waterproof bags available for rent at the pier"}'),
  ('a2222222-0008-0000-0000-000000000001', 'en', 'Meeting Point', '{"address": "Rassada Pier, Phuket", "meetingPoint": "We will pick you up from your hotel. Please be ready 15 minutes before pickup time.", "latitude": 7.8804, "longitude": 98.3923}'),
  ('a2222222-0009-0000-0000-000000000001', 'en', 'Reviews', '{"averageRating": 4.9, "totalReviews": 856, "reviews": [{"author": "Sarah M.", "rating": 5, "date": "December 2025", "comment": "Amazing experience! The water was so clear and the crew was fantastic.", "country": "Australia"}, {"author": "John D.", "rating": 5, "date": "December 2025", "comment": "Best day trip in Thailand. Maya Bay was breathtaking!", "country": "USA"}, {"author": "Emma L.", "rating": 4, "date": "November 2025", "comment": "Great tour but quite crowded at some spots.", "country": "UK"}]}'),
  ('a2222222-0010-0000-0000-000000000001', 'en', 'Add-ons', '{}'),
  ('a2222222-0011-0000-0000-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation up to 48 hours before departure. 50% refund for cancellations within 24-48 hours. No refund within 24 hours.", "refundPolicy": "Full refund if tour is cancelled due to weather conditions."}');

-- Availability for Phi Phi
INSERT INTO tour_availability (tour_id, date, time_slot, capacity, booked, enabled) VALUES
  ('22222222-2222-2222-2222-222222222222', '2026-01-15', '07:00', 30, 12, true),
  ('22222222-2222-2222-2222-222222222222', '2026-01-16', '07:00', 30, 8, true),
  ('22222222-2222-2222-2222-222222222222', '2026-01-17', '07:00', 30, 0, true),
  ('22222222-2222-2222-2222-222222222222', '2026-01-18', '07:00', 30, 0, true);

-- Upsells for Phi Phi
INSERT INTO upsells (id, tour_id, status, pricing_type, retail_price, net_price, currency, "order") VALUES
  ('c2222222-0001-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'active', 'per_booking', 800, 500, 'THB', 1),
  ('c2222222-0002-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'active', 'per_person', 300, 150, 'THB', 2),
  ('c2222222-0003-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'active', 'flat', 150, 50, 'THB', 3);

INSERT INTO upsell_translations (upsell_id, language, title, description) VALUES
  ('c2222222-0001-0000-0000-000000000001', 'en', 'Private Speedboat Upgrade', 'Upgrade to a private speedboat for your group'),
  ('c2222222-0002-0000-0000-000000000001', 'en', 'Underwater Camera Rental', 'Waterproof camera to capture your snorkeling moments'),
  ('c2222222-0003-0000-0000-000000000001', 'en', 'Waterproof Phone Pouch', 'Keep your phone safe and dry');

-- =====================================================
-- Tour 3: Siam Cabaret Show (seat_based)
-- =====================================================
INSERT INTO tours (id, tour_number, slug, status, pricing_engine) VALUES
  ('33333333-3333-3333-3333-333333333333', '0003', 'siam-cabaret-show', 'published', 'seat_based');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('33333333-3333-3333-3333-333333333333', '{
    "type": "seat_based",
    "currency": "THB",
    "seats": [
      {"seat_type": "VIP", "retail_price": 1500, "net_price": 1200, "capacity": 50},
      {"seat_type": "Standard", "retail_price": 900, "net_price": 700, "capacity": 150}
    ]
  }');

-- Blocks for Cabaret
INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled, config) VALUES
  ('a3333333-0001-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'hero', 1, true, '{}'),
  ('a3333333-0002-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'highlights', 2, true, '{}'),
  ('a3333333-0003-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'availability_selector', 3, true, '{}'),
  ('a3333333-0004-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'pricing_selector', 4, true, '{}'),
  ('a3333333-0005-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'included_excluded', 5, true, '{}'),
  ('a3333333-0006-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'map', 6, true, '{}'),
  ('a3333333-0007-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'reviews', 7, true, '{}'),
  ('a3333333-0008-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'terms', 8, true, '{}');

-- Translations for Cabaret
INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('a3333333-0001-0000-0000-000000000001', 'en', 'Siam Cabaret Show Phuket', '{"subtitle": "World-famous ladyboy cabaret show with stunning performances", "imageUrl": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200", "location": "Patong Beach, Phuket", "duration": "1.5 hours", "rating": 4.7, "reviewCount": 1243, "badges": ["Entertainment", "Must See"]}'),
  ('a3333333-0002-0000-0000-000000000001', 'en', 'Show Highlights', '{"items": ["Spectacular costumes", "International music performances", "Broadway-style production", "World-class performers", "Photo opportunities after show", "Air-conditioned theater"]}'),
  ('a3333333-0003-0000-0000-000000000001', 'en', 'Select Show Time', '{}'),
  ('a3333333-0004-0000-0000-000000000001', 'en', 'Select Seats', '{}'),
  ('a3333333-0005-0000-0000-000000000001', 'en', 'What''s Included', '{"included": ["Show ticket", "Seat as selected", "Air-conditioned venue"], "excluded": ["Hotel transfers", "Drinks", "Tips for performers"]}'),
  ('a3333333-0006-0000-0000-000000000001', 'en', 'Venue Location', '{"address": "Siam Niramit Theatre, Patong Beach", "meetingPoint": "Please arrive 30 minutes before show time", "latitude": 7.8961, "longitude": 98.2963}'),
  ('a3333333-0007-0000-0000-000000000001', 'en', 'Reviews', '{"averageRating": 4.7, "totalReviews": 1243, "reviews": [{"author": "Michael T.", "rating": 5, "date": "December 2025", "comment": "Incredible show! The costumes and performances were amazing.", "country": "Germany"}, {"author": "Lisa K.", "rating": 5, "date": "December 2025", "comment": "A must-see in Phuket. VIP seats are worth it!", "country": "Canada"}]}'),
  ('a3333333-0008-0000-0000-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation up to 24 hours before the show. No refund within 24 hours.", "refundPolicy": "Full refund if show is cancelled by venue."}');

-- Availability for Cabaret (multiple show times)
INSERT INTO tour_availability (tour_id, date, time_slot, capacity, booked, enabled) VALUES
  ('33333333-3333-3333-3333-333333333333', '2026-01-15', '18:00', 200, 45, true),
  ('33333333-3333-3333-3333-333333333333', '2026-01-15', '20:30', 200, 30, true),
  ('33333333-3333-3333-3333-333333333333', '2026-01-16', '18:00', 200, 20, true),
  ('33333333-3333-3333-3333-333333333333', '2026-01-16', '20:30', 200, 15, true),
  ('33333333-3333-3333-3333-333333333333', '2026-01-17', '18:00', 200, 0, true),
  ('33333333-3333-3333-3333-333333333333', '2026-01-17', '20:30', 200, 0, true);

-- Upsells for Cabaret
INSERT INTO upsells (id, tour_id, status, pricing_type, retail_price, net_price, currency, "order") VALUES
  ('c3333333-0001-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'active', 'per_booking', 600, 400, 'THB', 1),
  ('c3333333-0002-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'active', 'per_person', 250, 150, 'THB', 2);

INSERT INTO upsell_translations (upsell_id, language, title, description) VALUES
  ('c3333333-0001-0000-0000-000000000001', 'en', 'Hotel Transfer', 'Round-trip transfer from your hotel'),
  ('c3333333-0002-0000-0000-000000000001', 'en', 'Photo with Performers', 'Professional photo opportunity with the stars');
