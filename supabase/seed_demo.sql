-- =====================================================
-- DEMO DATA FOR ASTRONOUT PLATFORM
-- 20 Phuket Tours + 30 Bookings
-- =====================================================

-- Clear existing demo data (keep original 3 tours)
DELETE FROM bookings WHERE tour_id NOT IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');
DELETE FROM tours WHERE id NOT IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');

-- =====================================================
-- TOUR 4: James Bond Island Speedboat (flat_per_person)
-- =====================================================
INSERT INTO tours (id, slug, status, pricing_engine) VALUES
  ('44444444-4444-4444-4444-444444444444', 'james-bond-island-speedboat', 'published', 'flat_per_person');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('44444444-4444-4444-4444-444444444444', '{"type": "flat_per_person", "retail_price": 2200, "net_price": 1700, "currency": "THB", "min_pax": 1, "max_pax": 8}');

INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled) VALUES
  ('b4000010-0001-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'hero', 1, true),
  ('b4000010-0002-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'highlights', 2, true),
  ('b4000010-0003-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'itinerary', 3, true),
  ('b4000010-0004-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'availability_selector', 4, true),
  ('b4000010-0005-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'pricing_selector', 5, true),
  ('b4000010-0006-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'included_excluded', 6, true),
  ('b4000010-0007-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'what_to_bring', 7, true),
  ('b4000010-0008-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'safety_info', 8, true),
  ('b4000010-0009-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'map', 9, true),
  ('b4000010-0010-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'reviews', 10, true),
  ('b4000010-0011-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'upsells', 11, true),
  ('b4000010-0012-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'terms', 12, true);

INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('b4000010-0001-0001-0001-000000000001', 'en', 'James Bond Island by Speedboat', '{"subtitle": "Visit the iconic Phang Nga Bay filming location", "imageUrl": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200", "location": "Phang Nga Bay, Thailand", "duration": "Full Day (7 hours)", "rating": 4.8, "reviewCount": 567, "badges": ["Iconic", "Bestseller"]}'),
  ('b4000010-0001-0001-0001-000000000001', 'zh', '詹姆斯邦德岛快艇游', '{"subtitle": "参观标志性的攀牙湾拍摄地", "imageUrl": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200", "location": "泰国攀牙湾", "duration": "全天 (7小时)", "rating": 4.8, "reviewCount": 567, "badges": ["标志性", "畅销"]}'),
  ('b4000010-0002-0001-0001-000000000001', 'en', 'Tour Highlights', '{"items": ["Visit James Bond Island (Ko Tapu)", "Canoe through sea caves", "Explore Panyee floating village", "Swimming at Hong Island", "Lunch included", "Photo opportunities"]}'),
  ('b4000010-0003-0001-0001-000000000001', 'en', 'Itinerary', '{"items": [{"time": "08:00", "title": "Hotel Pickup", "description": "Pickup from Phuket hotels"}, {"time": "09:30", "title": "Ao Po Pier", "description": "Board speedboat"}, {"time": "10:30", "title": "James Bond Island", "description": "Explore the famous limestone karst"}, {"time": "12:00", "title": "Panyee Village", "description": "Seafood lunch at floating village"}, {"time": "14:00", "title": "Hong Island", "description": "Swimming and kayaking"}, {"time": "16:00", "title": "Return", "description": "Head back to pier"}, {"time": "17:30", "title": "Hotel Drop-off", "description": "Return to hotel"}]}'),
  ('b4000010-0004-0001-0001-000000000001', 'en', 'Select Date', '{}'),
  ('b4000010-0005-0001-0001-000000000001', 'en', 'Select Tickets', '{}'),
  ('b4000010-0006-0001-0001-000000000001', 'en', 'What''s Included', '{"included": ["Hotel transfers", "Speedboat", "National park fees", "Kayak/Canoe", "Lunch", "Drinking water", "Guide", "Insurance"], "excluded": ["Personal expenses", "Tips", "Alcoholic drinks"]}'),
  ('b4000010-0007-0001-0001-000000000001', 'en', 'What to Bring', '{"items": ["Swimwear", "Sunscreen", "Towel", "Camera", "Cash", "Hat"], "note": "Waterproof bags recommended"}'),
  ('b4000010-0008-0001-0001-000000000001', 'en', 'Safety Information', '{"items": ["Life jackets provided", "Experienced boat crew", "First aid kit on board"], "restrictions": ["Not suitable for pregnant women", "Children under 4"]}'),
  ('b4000010-0009-0001-0001-000000000001', 'en', 'Meeting Point', '{"address": "Ao Po Grand Marina", "latitude": 8.0511, "longitude": 98.4347}'),
  ('b4000010-0010-0001-0001-000000000001', 'en', 'Reviews', '{"averageRating": 4.8, "totalReviews": 567}'),
  ('b4000010-0011-0001-0001-000000000001', 'en', 'Add-ons', '{}'),
  ('b4000010-0012-0001-0001-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation 48 hours before. 50% refund within 24-48 hours."}');

INSERT INTO upsells (id, tour_id, status, pricing_type, retail_price, net_price, currency, "order") VALUES
  ('a4000010-0001-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'active', 'per_booking', 700, 450, 'THB', 1),
  ('a4000010-0002-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'active', 'per_person', 250, 150, 'THB', 2);

INSERT INTO upsell_translations (upsell_id, language, title, description) VALUES
  ('a4000010-0001-0001-0001-000000000001', 'en', 'Private Longtail Boat Tour', 'Explore hidden lagoons by private longtail'),
  ('a4000010-0002-0001-0001-000000000001', 'en', 'Seafood Upgrade', 'Premium seafood lunch upgrade');

-- =====================================================
-- TOUR 5: Phuket ATV Adventure (flat_per_person)
-- =====================================================
INSERT INTO tours (id, slug, status, pricing_engine) VALUES
  ('55555555-5555-5555-5555-555555555555', 'phuket-atv-adventure', 'published', 'flat_per_person');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('55555555-5555-5555-5555-555555555555', '{"type": "flat_per_person", "retail_price": 1500, "net_price": 1100, "currency": "THB", "min_pax": 1, "max_pax": 6}');

INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled) VALUES
  ('b5000010-0001-0001-0001-000000000001', '55555555-5555-5555-5555-555555555555', 'hero', 1, true),
  ('b5000010-0002-0001-0001-000000000001', '55555555-5555-5555-5555-555555555555', 'highlights', 2, true),
  ('b5000010-0003-0001-0001-000000000001', '55555555-5555-5555-5555-555555555555', 'availability_selector', 3, true),
  ('b5000010-0004-0001-0001-000000000001', '55555555-5555-5555-5555-555555555555', 'pricing_selector', 4, true),
  ('b5000010-0005-0001-0001-000000000001', '55555555-5555-5555-5555-555555555555', 'included_excluded', 5, true),
  ('b5000010-0006-0001-0001-000000000001', '55555555-5555-5555-5555-555555555555', 'safety_info', 6, true),
  ('b5000010-0007-0001-0001-000000000001', '55555555-5555-5555-5555-555555555555', 'upsells', 7, true),
  ('b5000010-0008-0001-0001-000000000001', '55555555-5555-5555-5555-555555555555', 'terms', 8, true);

INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('b5000010-0001-0001-0001-000000000001', 'en', 'Phuket ATV Adventure', '{"subtitle": "Off-road jungle adventure through Phuket hills", "imageUrl": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200", "location": "Chalong, Phuket", "duration": "2 hours", "rating": 4.7, "reviewCount": 423, "badges": ["Adventure", "Thrill"]}'),
  ('b5000010-0002-0001-0001-000000000001', 'en', 'Tour Highlights', '{"items": ["Ride through jungle trails", "Muddy terrain adventure", "Scenic viewpoints", "Professional instruction", "Safety equipment included"]}'),
  ('b5000010-0003-0001-0001-000000000001', 'en', 'Select Date', '{}'),
  ('b5000010-0004-0001-0001-000000000001', 'en', 'Select Tickets', '{}'),
  ('b5000010-0005-0001-0001-000000000001', 'en', 'What''s Included', '{"included": ["ATV rental", "Helmet", "Gloves", "Guide", "Insurance", "Drinking water"], "excluded": ["Hotel transfer", "Tips"]}'),
  ('b5000010-0006-0001-0001-000000000001', 'en', 'Safety Information', '{"items": ["Minimum age 16 to drive", "Maximum weight 120kg", "Closed shoes required"], "restrictions": ["Pregnant women", "Back problems"]}'),
  ('b5000010-0007-0001-0001-000000000001', 'en', 'Add-ons', '{}'),
  ('b5000010-0008-0001-0001-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation 24 hours before."}');

INSERT INTO upsells (id, tour_id, status, pricing_type, retail_price, net_price, currency, "order") VALUES
  ('a5000010-0001-0001-0001-000000000001', '55555555-5555-5555-5555-555555555555', 'active', 'per_booking', 400, 250, 'THB', 1),
  ('a5000010-0002-0001-0001-000000000001', '55555555-5555-5555-5555-555555555555', 'active', 'per_person', 300, 200, 'THB', 2);

INSERT INTO upsell_translations (upsell_id, language, title, description) VALUES
  ('a5000010-0001-0001-0001-000000000001', 'en', 'Hotel Transfer', 'Round-trip hotel transfer'),
  ('a5000010-0002-0001-0001-000000000001', 'en', 'GoPro Rental', 'Capture your adventure on camera');

-- =====================================================
-- TOUR 6: Elephant Sanctuary Visit (adult_child)
-- =====================================================
INSERT INTO tours (id, slug, status, pricing_engine) VALUES
  ('66666666-6666-6666-6666-666666666666', 'phuket-elephant-sanctuary', 'published', 'adult_child');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('66666666-6666-6666-6666-666666666666', '{"type": "adult_child", "adult_retail_price": 3500, "adult_net_price": 2800, "child_retail_price": 2000, "child_net_price": 1600, "currency": "THB", "child_age_max": 11, "min_pax": 1, "max_pax": 10}');

INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled) VALUES
  ('b6000010-0001-0001-0001-000000000001', '66666666-6666-6666-6666-666666666666', 'hero', 1, true),
  ('b6000010-0002-0001-0001-000000000001', '66666666-6666-6666-6666-666666666666', 'highlights', 2, true),
  ('b6000010-0003-0001-0001-000000000001', '66666666-6666-6666-6666-666666666666', 'itinerary', 3, true),
  ('b6000010-0004-0001-0001-000000000001', '66666666-6666-6666-6666-666666666666', 'availability_selector', 4, true),
  ('b6000010-0005-0001-0001-000000000001', '66666666-6666-6666-6666-666666666666', 'pricing_selector', 5, true),
  ('b6000010-0006-0001-0001-000000000001', '66666666-6666-6666-6666-666666666666', 'included_excluded', 6, true),
  ('b6000010-0007-0001-0001-000000000001', '66666666-6666-6666-6666-666666666666', 'what_to_bring', 7, true),
  ('b6000010-0008-0001-0001-000000000001', '66666666-6666-6666-6666-666666666666', 'reviews', 8, true),
  ('b6000010-0009-0001-0001-000000000001', '66666666-6666-6666-6666-666666666666', 'upsells', 9, true),
  ('b6000010-0010-0001-0001-000000000001', '66666666-6666-6666-6666-666666666666', 'terms', 10, true);

INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('b6000010-0001-0001-0001-000000000001', 'en', 'Phuket Elephant Sanctuary', '{"subtitle": "Ethical elephant experience in natural habitat", "imageUrl": "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1200", "location": "Phuket, Thailand", "duration": "Half Day (4 hours)", "rating": 4.9, "reviewCount": 892, "badges": ["Ethical", "Family Friendly"]}'),
  ('b6000010-0001-0001-0001-000000000001', 'zh', '普吉岛大象保护区', '{"subtitle": "在自然栖息地的道德大象体验", "imageUrl": "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1200", "location": "泰国普吉岛", "duration": "半天 (4小时)", "rating": 4.9, "reviewCount": 892, "badges": ["道德", "适合家庭"]}'),
  ('b6000010-0002-0001-0001-000000000001', 'en', 'Tour Highlights', '{"items": ["Feed rescued elephants", "Walk with elephants in jungle", "Learn about elephant conservation", "Mud bath with elephants", "Vegetarian Thai lunch", "No riding - ethical only"]}'),
  ('b6000010-0003-0001-0001-000000000001', 'en', 'Itinerary', '{"items": [{"time": "08:00", "title": "Hotel Pickup", "description": "Pickup from hotel"}, {"time": "09:00", "title": "Arrival & Orientation", "description": "Learn about the sanctuary"}, {"time": "09:30", "title": "Meet the Elephants", "description": "Feeding and interaction"}, {"time": "11:00", "title": "Jungle Walk", "description": "Walk alongside elephants"}, {"time": "12:00", "title": "Mud Bath", "description": "Help bathe the elephants"}, {"time": "13:00", "title": "Lunch", "description": "Thai vegetarian lunch"}, {"time": "14:00", "title": "Return", "description": "Drop-off at hotel"}]}'),
  ('b6000010-0004-0001-0001-000000000001', 'en', 'Select Date', '{}'),
  ('b6000010-0005-0001-0001-000000000001', 'en', 'Select Tickets', '{}'),
  ('b6000010-0006-0001-0001-000000000001', 'en', 'What''s Included', '{"included": ["Hotel transfers", "Sanctuary entrance", "Elephant food", "Lunch", "Guide", "Insurance"], "excluded": ["Personal expenses", "Tips"]}'),
  ('b6000010-0007-0001-0001-000000000001', 'en', 'What to Bring', '{"items": ["Comfortable clothes (will get muddy)", "Sandals", "Change of clothes", "Sunscreen", "Camera"], "note": "Lockers available at sanctuary"}'),
  ('b6000010-0008-0001-0001-000000000001', 'en', 'Reviews', '{"averageRating": 4.9, "totalReviews": 892}'),
  ('b6000010-0009-0001-0001-000000000001', 'en', 'Add-ons', '{}'),
  ('b6000010-0010-0001-0001-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation 48 hours before."}');

INSERT INTO upsells (id, tour_id, status, pricing_type, retail_price, net_price, currency, "order") VALUES
  ('a6000010-0001-0001-0001-000000000001', '66666666-6666-6666-6666-666666666666', 'active', 'per_person', 500, 350, 'THB', 1);

INSERT INTO upsell_translations (upsell_id, language, title, description) VALUES
  ('a6000010-0001-0001-0001-000000000001', 'en', 'Photo Package', 'Professional photos of your experience');

-- =====================================================
-- TOUR 7: Similan Islands Diving (adult_child)
-- =====================================================
INSERT INTO tours (id, slug, status, pricing_engine) VALUES
  ('77777777-7777-7777-7777-777777777777', 'similan-islands-diving', 'published', 'adult_child');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('77777777-7777-7777-7777-777777777777', '{"type": "adult_child", "adult_retail_price": 4500, "adult_net_price": 3600, "child_retail_price": 3000, "child_net_price": 2400, "currency": "THB", "child_age_max": 11, "min_pax": 1, "max_pax": 6}');

INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled) VALUES
  ('b7000010-0001-0001-0001-000000000001', '77777777-7777-7777-7777-777777777777', 'hero', 1, true),
  ('b7000010-0002-0001-0001-000000000001', '77777777-7777-7777-7777-777777777777', 'highlights', 2, true),
  ('b7000010-0003-0001-0001-000000000001', '77777777-7777-7777-7777-777777777777', 'itinerary', 3, true),
  ('b7000010-0004-0001-0001-000000000001', '77777777-7777-7777-7777-777777777777', 'availability_selector', 4, true),
  ('b7000010-0005-0001-0001-000000000001', '77777777-7777-7777-7777-777777777777', 'pricing_selector', 5, true),
  ('b7000010-0006-0001-0001-000000000001', '77777777-7777-7777-7777-777777777777', 'included_excluded', 6, true),
  ('b7000010-0007-0001-0001-000000000001', '77777777-7777-7777-7777-777777777777', 'safety_info', 7, true),
  ('b7000010-0008-0001-0001-000000000001', '77777777-7777-7777-7777-777777777777', 'upsells', 8, true),
  ('b7000010-0009-0001-0001-000000000001', '77777777-7777-7777-7777-777777777777', 'terms', 9, true);

INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('b7000010-0001-0001-0001-000000000001', 'en', 'Similan Islands Snorkeling & Diving', '{"subtitle": "Crystal clear waters and vibrant coral reefs", "imageUrl": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200", "location": "Similan Islands, Thailand", "duration": "Full Day (10 hours)", "rating": 4.9, "reviewCount": 634, "badges": ["Premium", "Marine Life"]}'),
  ('b7000010-0002-0001-0001-000000000001', 'en', 'Tour Highlights', '{"items": ["3 snorkeling spots", "Crystal clear visibility", "Tropical fish & coral", "Beach time on Similan", "Breakfast & lunch included", "Professional guides"]}'),
  ('b7000010-0003-0001-0001-000000000001', 'en', 'Itinerary', '{"items": [{"time": "05:30", "title": "Hotel Pickup", "description": "Early morning pickup"}, {"time": "07:00", "title": "Khao Lak Pier", "description": "Breakfast and departure"}, {"time": "09:00", "title": "Similan Island 4", "description": "First snorkeling spot"}, {"time": "11:00", "title": "Similan Island 8", "description": "Beach time and lunch"}, {"time": "13:00", "title": "Similan Island 9", "description": "Snorkeling at Sail Rock"}, {"time": "15:00", "title": "Return Journey", "description": "Head back to pier"}, {"time": "18:00", "title": "Hotel Drop-off", "description": "Return to hotel"}]}'),
  ('b7000010-0004-0001-0001-000000000001', 'en', 'Select Date', '{}'),
  ('b7000010-0005-0001-0001-000000000001', 'en', 'Select Tickets', '{}'),
  ('b7000010-0006-0001-0001-000000000001', 'en', 'What''s Included', '{"included": ["Hotel transfers", "Speedboat", "National park fees", "Snorkeling gear", "Breakfast & lunch", "Guide", "Insurance"], "excluded": ["Diving equipment", "Tips", "Personal expenses"]}'),
  ('b7000010-0007-0001-0001-000000000001', 'en', 'Safety Information', '{"items": ["Life jackets mandatory", "Experienced crew", "First aid available"], "restrictions": ["Not recommended for non-swimmers", "Pregnant women"]}'),
  ('b7000010-0008-0001-0001-000000000001', 'en', 'Add-ons', '{}'),
  ('b7000010-0009-0001-0001-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation 72 hours before. Weather dependent."}');

INSERT INTO upsells (id, tour_id, status, pricing_type, retail_price, net_price, currency, "order") VALUES
  ('a7000010-0001-0001-0001-000000000001', '77777777-7777-7777-7777-777777777777', 'active', 'per_person', 1500, 1000, 'THB', 1),
  ('a7000010-0002-0001-0001-000000000001', '77777777-7777-7777-7777-777777777777', 'active', 'per_booking', 400, 250, 'THB', 2);

INSERT INTO upsell_translations (upsell_id, language, title, description) VALUES
  ('a7000010-0001-0001-0001-000000000001', 'en', 'Discover Scuba Diving', 'Try diving with instructor (no certification needed)'),
  ('a7000010-0002-0001-0001-000000000001', 'en', 'Underwater Camera', 'Waterproof camera rental');

-- =====================================================
-- TOUR 8: Thai Cooking Class (adult_child)
-- =====================================================
INSERT INTO tours (id, slug, status, pricing_engine) VALUES
  ('88888888-8888-8888-8888-888888888888', 'phuket-thai-cooking-class', 'published', 'adult_child');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('88888888-8888-8888-8888-888888888888', '{"type": "adult_child", "adult_retail_price": 2000, "adult_net_price": 1500, "child_retail_price": 1200, "child_net_price": 900, "currency": "THB", "child_age_max": 11, "min_pax": 1, "max_pax": 8}');

INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled) VALUES
  ('b8000010-0001-0001-0001-000000000001', '88888888-8888-8888-8888-888888888888', 'hero', 1, true),
  ('b8000010-0002-0001-0001-000000000001', '88888888-8888-8888-8888-888888888888', 'highlights', 2, true),
  ('b8000010-0003-0001-0001-000000000001', '88888888-8888-8888-8888-888888888888', 'itinerary', 3, true),
  ('b8000010-0004-0001-0001-000000000001', '88888888-8888-8888-8888-888888888888', 'availability_selector', 4, true),
  ('b8000010-0005-0001-0001-000000000001', '88888888-8888-8888-8888-888888888888', 'pricing_selector', 5, true),
  ('b8000010-0006-0001-0001-000000000001', '88888888-8888-8888-8888-888888888888', 'included_excluded', 6, true),
  ('b8000010-0007-0001-0001-000000000001', '88888888-8888-8888-8888-888888888888', 'reviews', 7, true),
  ('b8000010-0008-0001-0001-000000000001', '88888888-8888-8888-8888-888888888888', 'terms', 8, true);

INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('b8000010-0001-0001-0001-000000000001', 'en', 'Phuket Thai Cooking Class', '{"subtitle": "Learn authentic Thai cuisine from local chefs", "imageUrl": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200", "location": "Phuket Town", "duration": "Half Day (4 hours)", "rating": 4.8, "reviewCount": 445, "badges": ["Cultural", "Hands-on"]}'),
  ('b8000010-0002-0001-0001-000000000001', 'en', 'Tour Highlights', '{"items": ["Market tour", "Cook 4 Thai dishes", "Learn secret recipes", "Eat what you cook", "Recipe book included", "Vegetarian options"]}'),
  ('b8000010-0003-0001-0001-000000000001', 'en', 'Itinerary', '{"items": [{"time": "09:00", "title": "Market Visit", "description": "Tour local market for ingredients"}, {"time": "10:00", "title": "Cooking School", "description": "Arrive at cooking school"}, {"time": "10:30", "title": "Cooking Class", "description": "Learn and cook 4 dishes"}, {"time": "13:00", "title": "Enjoy Your Meal", "description": "Eat your creations"}]}'),
  ('b8000010-0004-0001-0001-000000000001', 'en', 'Select Date', '{}'),
  ('b8000010-0005-0001-0001-000000000001', 'en', 'Select Tickets', '{}'),
  ('b8000010-0006-0001-0001-000000000001', 'en', 'What''s Included', '{"included": ["Hotel pickup (Phuket Town area)", "All ingredients", "Recipe book", "Apron", "Certificate"], "excluded": ["Hotel pickup outside Phuket Town", "Tips"]}'),
  ('b8000010-0007-0001-0001-000000000001', 'en', 'Reviews', '{"averageRating": 4.8, "totalReviews": 445}'),
  ('b8000010-0008-0001-0001-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation 24 hours before."}');

INSERT INTO upsells (id, tour_id, status, pricing_type, retail_price, net_price, currency, "order") VALUES
  ('a8000010-0001-0001-0001-000000000001', '88888888-8888-8888-8888-888888888888', 'active', 'per_booking', 500, 350, 'THB', 1);

INSERT INTO upsell_translations (upsell_id, language, title, description) VALUES
  ('a8000010-0001-0001-0001-000000000001', 'en', 'Extended Transfer', 'Hotel pickup from Patong/Kata/Karon');

-- =====================================================
-- TOUR 9: Phuket Fantasea Show (seat_based)
-- =====================================================
INSERT INTO tours (id, slug, status, pricing_engine) VALUES
  ('99999999-9999-9999-9999-999999999999', 'phuket-fantasea-show', 'published', 'seat_based');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('99999999-9999-9999-9999-999999999999', '{"type": "seat_based", "currency": "THB", "seats": [{"seat_type": "Gold Seat", "retail_price": 2200, "net_price": 1700, "capacity": 100}, {"seat_type": "Standard Seat", "retail_price": 1800, "net_price": 1400, "capacity": 300}]}');

INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled) VALUES
  ('b9000010-0001-0001-0001-000000000001', '99999999-9999-9999-9999-999999999999', 'hero', 1, true),
  ('b9000010-0002-0001-0001-000000000001', '99999999-9999-9999-9999-999999999999', 'highlights', 2, true),
  ('b9000010-0003-0001-0001-000000000001', '99999999-9999-9999-9999-999999999999', 'availability_selector', 3, true),
  ('b9000010-0004-0001-0001-000000000001', '99999999-9999-9999-9999-999999999999', 'pricing_selector', 4, true),
  ('b9000010-0005-0001-0001-000000000001', '99999999-9999-9999-9999-999999999999', 'included_excluded', 5, true),
  ('b9000010-0006-0001-0001-000000000001', '99999999-9999-9999-9999-999999999999', 'map', 6, true),
  ('b9000010-0007-0001-0001-000000000001', '99999999-9999-9999-9999-999999999999', 'reviews', 7, true),
  ('b9000010-0008-0001-0001-000000000001', '99999999-9999-9999-9999-999999999999', 'upsells', 8, true),
  ('b9000010-0009-0001-0001-000000000001', '99999999-9999-9999-9999-999999999999', 'terms', 9, true);

INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('b9000010-0001-0001-0001-000000000001', 'en', 'Phuket FantaSea Show', '{"subtitle": "Thailand''s ultimate cultural theme park", "imageUrl": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200", "location": "Kamala Beach, Phuket", "duration": "Evening (5 hours)", "rating": 4.6, "reviewCount": 1523, "badges": ["Entertainment", "Family"]}'),
  ('b9000010-0002-0001-0001-000000000001', 'en', 'Show Highlights', '{"items": ["Las Vegas-style show", "Elephants on stage", "Acrobatics & magic", "Thai culture showcase", "Shopping village", "Buffet dinner available"]}'),
  ('b9000010-0003-0001-0001-000000000001', 'en', 'Select Show Date', '{}'),
  ('b9000010-0004-0001-0001-000000000001', 'en', 'Select Seats', '{}'),
  ('b9000010-0005-0001-0001-000000000001', 'en', 'What''s Included', '{"included": ["Show ticket", "Seat as selected"], "excluded": ["Hotel transfer", "Dinner", "Drinks"]}'),
  ('b9000010-0006-0001-0001-000000000001', 'en', 'Venue Location', '{"address": "FantaSea, Kamala Beach", "latitude": 7.9547, "longitude": 98.2832}'),
  ('b9000010-0007-0001-0001-000000000001', 'en', 'Reviews', '{"averageRating": 4.6, "totalReviews": 1523}'),
  ('b9000010-0008-0001-0001-000000000001', 'en', 'Add-ons', '{}'),
  ('b9000010-0009-0001-0001-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation 24 hours before. No cameras allowed in theater."}');

INSERT INTO upsells (id, tour_id, status, pricing_type, retail_price, net_price, currency, "order") VALUES
  ('a9000010-0001-0001-0001-000000000001', '99999999-9999-9999-9999-999999999999', 'active', 'per_person', 900, 650, 'THB', 1),
  ('a9000010-0002-0001-0001-000000000001', '99999999-9999-9999-9999-999999999999', 'active', 'per_booking', 600, 400, 'THB', 2);

INSERT INTO upsell_translations (upsell_id, language, title, description) VALUES
  ('a9000010-0001-0001-0001-000000000001', 'en', 'Buffet Dinner', 'International buffet before the show'),
  ('a9000010-0002-0001-0001-000000000001', 'en', 'Hotel Transfer', 'Round-trip hotel transfer');

-- =====================================================
-- TOUR 10: Sunset Dinner Cruise (seat_based)
-- =====================================================
INSERT INTO tours (id, slug, status, pricing_engine) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'phuket-sunset-dinner-cruise', 'published', 'seat_based');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"type": "seat_based", "currency": "THB", "seats": [{"seat_type": "Premium Deck", "retail_price": 3500, "net_price": 2800, "capacity": 20}, {"seat_type": "Main Deck", "retail_price": 2500, "net_price": 2000, "capacity": 50}]}');

INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled) VALUES
  ('ba000010-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'hero', 1, true),
  ('ba000010-0002-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'highlights', 2, true),
  ('ba000010-0003-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'itinerary', 3, true),
  ('ba000010-0004-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'availability_selector', 4, true),
  ('ba000010-0005-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'pricing_selector', 5, true),
  ('ba000010-0006-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'included_excluded', 6, true),
  ('ba000010-0007-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'reviews', 7, true),
  ('ba000010-0008-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'terms', 8, true);

INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('ba000010-0001-0001-0001-000000000001', 'en', 'Phuket Sunset Dinner Cruise', '{"subtitle": "Romantic sunset cruise with gourmet dinner", "imageUrl": "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=1200", "location": "Phuket Marina", "duration": "3 hours", "rating": 4.7, "reviewCount": 389, "badges": ["Romantic", "Sunset"]}'),
  ('ba000010-0002-0001-0001-000000000001', 'en', 'Tour Highlights', '{"items": ["Stunning sunset views", "4-course dinner", "Live music", "Open bar (2 hours)", "Cruise around islands", "Photo opportunities"]}'),
  ('ba000010-0003-0001-0001-000000000001', 'en', 'Itinerary', '{"items": [{"time": "17:00", "title": "Check-in", "description": "Arrive at marina"}, {"time": "17:30", "title": "Departure", "description": "Set sail"}, {"time": "18:00", "title": "Sunset", "description": "Watch the sunset"}, {"time": "19:00", "title": "Dinner", "description": "4-course meal"}, {"time": "20:30", "title": "Return", "description": "Arrive back at marina"}]}'),
  ('ba000010-0004-0001-0001-000000000001', 'en', 'Select Date', '{}'),
  ('ba000010-0005-0001-0001-000000000001', 'en', 'Select Deck', '{}'),
  ('ba000010-0006-0001-0001-000000000001', 'en', 'What''s Included', '{"included": ["4-course dinner", "Open bar (2 hrs)", "Live music", "Sunset cruise"], "excluded": ["Hotel transfer", "Tips"]}'),
  ('ba000010-0007-0001-0001-000000000001', 'en', 'Reviews', '{"averageRating": 4.7, "totalReviews": 389}'),
  ('ba000010-0008-0001-0001-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation 48 hours before. Weather dependent."}');

INSERT INTO upsells (id, tour_id, status, pricing_type, retail_price, net_price, currency, "order") VALUES
  ('aa000010-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'active', 'per_booking', 800, 550, 'THB', 1),
  ('aa000010-0002-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'active', 'per_booking', 1500, 1000, 'THB', 2);

INSERT INTO upsell_translations (upsell_id, language, title, description) VALUES
  ('aa000010-0001-0001-0001-000000000001', 'en', 'Hotel Transfer', 'Round-trip hotel transfer'),
  ('aa000010-0002-0001-0001-000000000001', 'en', 'Celebration Package', 'Champagne, cake, and flowers');

-- =====================================================
-- TOUR 11: Muay Thai Boxing Class (flat_per_person)
-- =====================================================
INSERT INTO tours (id, slug, status, pricing_engine) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'phuket-muay-thai-class', 'published', 'flat_per_person');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '{"type": "flat_per_person", "retail_price": 1200, "net_price": 900, "currency": "THB", "min_pax": 1, "max_pax": 10}');

INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled) VALUES
  ('bb000010-0001-0001-0001-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'hero', 1, true),
  ('bb000010-0002-0001-0001-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'highlights', 2, true),
  ('bb000010-0003-0001-0001-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'availability_selector', 3, true),
  ('bb000010-0004-0001-0001-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pricing_selector', 4, true),
  ('bb000010-0005-0001-0001-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'included_excluded', 5, true),
  ('bb000010-0006-0001-0001-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'safety_info', 6, true),
  ('bb000010-0007-0001-0001-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'terms', 7, true);

INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('bb000010-0001-0001-0001-000000000001', 'en', 'Muay Thai Boxing Class', '{"subtitle": "Learn the art of Thai boxing from champions", "imageUrl": "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1200", "location": "Phuket", "duration": "2 hours", "rating": 4.8, "reviewCount": 267, "badges": ["Fitness", "Cultural"]}'),
  ('bb000010-0002-0001-0001-000000000001', 'en', 'Tour Highlights', '{"items": ["Professional trainers", "All skill levels welcome", "Learn basic techniques", "Pad work training", "Equipment provided", "Certificate included"]}'),
  ('bb000010-0003-0001-0001-000000000001', 'en', 'Select Date', '{}'),
  ('bb000010-0004-0001-0001-000000000001', 'en', 'Select Tickets', '{}'),
  ('bb000010-0005-0001-0001-000000000001', 'en', 'What''s Included', '{"included": ["2-hour training", "Equipment", "Trainer", "Water", "Certificate"], "excluded": ["Hotel transfer", "Tips"]}'),
  ('bb000010-0006-0001-0001-000000000001', 'en', 'Safety Information', '{"items": ["Suitable for all fitness levels", "Warm-up included"], "restrictions": ["Heart conditions", "Recent injuries"]}'),
  ('bb000010-0007-0001-0001-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation 24 hours before."}');

-- =====================================================
-- TOUR 12: Phuket Old Town Walking Tour (flat_per_person)
-- =====================================================
INSERT INTO tours (id, slug, status, pricing_engine) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'phuket-old-town-walking-tour', 'published', 'flat_per_person');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '{"type": "flat_per_person", "retail_price": 800, "net_price": 600, "currency": "THB", "min_pax": 2, "max_pax": 12}');

INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled) VALUES
  ('bc000010-0001-0001-0001-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'hero', 1, true),
  ('bc000010-0002-0001-0001-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'highlights', 2, true),
  ('bc000010-0003-0001-0001-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'itinerary', 3, true),
  ('bc000010-0004-0001-0001-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'availability_selector', 4, true),
  ('bc000010-0005-0001-0001-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'pricing_selector', 5, true),
  ('bc000010-0006-0001-0001-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'included_excluded', 6, true),
  ('bc000010-0007-0001-0001-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'map', 7, true),
  ('bc000010-0008-0001-0001-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'terms', 8, true);

INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('bc000010-0001-0001-0001-000000000001', 'en', 'Phuket Old Town Walking Tour', '{"subtitle": "Discover Sino-Portuguese heritage and street art", "imageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200", "location": "Phuket Old Town", "duration": "3 hours", "rating": 4.7, "reviewCount": 312, "badges": ["Cultural", "Walking"]}'),
  ('bc000010-0002-0001-0001-000000000001', 'en', 'Tour Highlights', '{"items": ["Sino-Portuguese architecture", "Famous street art", "Local temples", "Food tasting", "Photo spots", "Local stories"]}'),
  ('bc000010-0003-0001-0001-000000000001', 'en', 'Itinerary', '{"items": [{"time": "09:00", "title": "Meeting Point", "description": "Meet at Clock Tower"}, {"time": "09:15", "title": "Thalang Road", "description": "Explore historic buildings"}, {"time": "10:00", "title": "Shrine Visit", "description": "Visit Chinese shrines"}, {"time": "10:45", "title": "Street Art", "description": "Discover murals"}, {"time": "11:30", "title": "Food Tasting", "description": "Try local snacks"}, {"time": "12:00", "title": "End", "description": "Tour ends at Soi Romanee"}]}'),
  ('bc000010-0004-0001-0001-000000000001', 'en', 'Select Date', '{}'),
  ('bc000010-0005-0001-0001-000000000001', 'en', 'Select Tickets', '{}'),
  ('bc000010-0006-0001-0001-000000000001', 'en', 'What''s Included', '{"included": ["English-speaking guide", "Food tasting", "Bottled water"], "excluded": ["Hotel transfer", "Additional food"]}'),
  ('bc000010-0007-0001-0001-000000000001', 'en', 'Meeting Point', '{"address": "Phuket Old Town Clock Tower", "latitude": 7.8847, "longitude": 98.3923}'),
  ('bc000010-0008-0001-0001-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation 24 hours before."}');

-- =====================================================
-- TOUR 13: Kayaking Phang Nga Bay (adult_child)
-- =====================================================
INSERT INTO tours (id, slug, status, pricing_engine) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'phang-nga-bay-kayaking', 'published', 'adult_child');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '{"type": "adult_child", "adult_retail_price": 2800, "adult_net_price": 2200, "child_retail_price": 1800, "child_net_price": 1400, "currency": "THB", "child_age_max": 11, "min_pax": 1, "max_pax": 8}');

INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled) VALUES
  ('bd000010-0001-0001-0001-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'hero', 1, true),
  ('bd000010-0002-0001-0001-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'highlights', 2, true),
  ('bd000010-0003-0001-0001-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'itinerary', 3, true),
  ('bd000010-0004-0001-0001-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'availability_selector', 4, true),
  ('bd000010-0005-0001-0001-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'pricing_selector', 5, true),
  ('bd000010-0006-0001-0001-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'included_excluded', 6, true),
  ('bd000010-0007-0001-0001-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'what_to_bring', 7, true),
  ('bd000010-0008-0001-0001-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'upsells', 8, true),
  ('bd000010-0009-0001-0001-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'terms', 9, true);

INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('bd000010-0001-0001-0001-000000000001', 'en', 'Phang Nga Bay Sea Kayaking', '{"subtitle": "Paddle through hidden lagoons and sea caves", "imageUrl": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200", "location": "Phang Nga Bay", "duration": "Full Day (8 hours)", "rating": 4.8, "reviewCount": 478, "badges": ["Adventure", "Nature"]}'),
  ('bd000010-0002-0001-0001-000000000001', 'en', 'Tour Highlights', '{"items": ["Kayak through sea caves", "Hidden lagoons (hongs)", "Mangrove forests", "Limestone karsts", "Wildlife spotting", "Lunch included"]}'),
  ('bd000010-0003-0001-0001-000000000001', 'en', 'Itinerary', '{"items": [{"time": "07:30", "title": "Hotel Pickup", "description": "Pickup from hotel"}, {"time": "09:00", "title": "Ao Po Pier", "description": "Board boat"}, {"time": "10:00", "title": "First Hong", "description": "Kayak into hidden lagoon"}, {"time": "11:30", "title": "Sea Caves", "description": "Explore caves by kayak"}, {"time": "12:30", "title": "Lunch", "description": "Lunch on boat"}, {"time": "14:00", "title": "More Kayaking", "description": "Visit more hongs"}, {"time": "16:00", "title": "Return", "description": "Head back to pier"}, {"time": "17:30", "title": "Hotel Drop-off", "description": "Return to hotel"}]}'),
  ('bd000010-0004-0001-0001-000000000001', 'en', 'Select Date', '{}'),
  ('bd000010-0005-0001-0001-000000000001', 'en', 'Select Tickets', '{}'),
  ('bd000010-0006-0001-0001-000000000001', 'en', 'What''s Included', '{"included": ["Hotel transfers", "Kayak & paddle", "Life jacket", "Guide", "Lunch", "National park fees", "Insurance"], "excluded": ["Personal expenses", "Tips"]}'),
  ('bd000010-0007-0001-0001-000000000001', 'en', 'What to Bring', '{"items": ["Swimwear", "Sunscreen", "Hat", "Dry bag for valuables", "Camera"], "note": "You will get wet!"}'),
  ('bd000010-0008-0001-0001-000000000001', 'en', 'Add-ons', '{}'),
  ('bd000010-0009-0001-0001-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation 48 hours before."}');

INSERT INTO upsells (id, tour_id, status, pricing_type, retail_price, net_price, currency, "order") VALUES
  ('ad000010-0001-0001-0001-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'active', 'per_person', 300, 200, 'THB', 1);

INSERT INTO upsell_translations (upsell_id, language, title, description) VALUES
  ('ad000010-0001-0001-0001-000000000001', 'en', 'Waterproof Camera', 'Capture your kayaking adventure');

-- =====================================================
-- TOUR 14: Phuket Spa & Massage (flat_per_person)
-- =====================================================
INSERT INTO tours (id, slug, status, pricing_engine) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'phuket-luxury-spa', 'published', 'flat_per_person');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '{"type": "flat_per_person", "retail_price": 2500, "net_price": 1900, "currency": "THB", "min_pax": 1, "max_pax": 4}');

INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled) VALUES
  ('be000010-0001-0001-0001-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'hero', 1, true),
  ('be000010-0002-0001-0001-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'highlights', 2, true),
  ('be000010-0003-0001-0001-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'availability_selector', 3, true),
  ('be000010-0004-0001-0001-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'pricing_selector', 4, true),
  ('be000010-0005-0001-0001-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'included_excluded', 5, true),
  ('be000010-0006-0001-0001-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'reviews', 6, true),
  ('be000010-0007-0001-0001-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'terms', 7, true);

INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('be000010-0001-0001-0001-000000000001', 'en', 'Phuket Luxury Spa Experience', '{"subtitle": "Rejuvenate with traditional Thai treatments", "imageUrl": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200", "location": "Patong Beach", "duration": "3 hours", "rating": 4.9, "reviewCount": 534, "badges": ["Relaxation", "Luxury"]}'),
  ('be000010-0002-0001-0001-000000000001', 'en', 'Package Highlights', '{"items": ["2-hour Thai massage", "Herbal steam", "Aromatherapy", "Foot reflexology", "Complimentary tea", "Private room"]}'),
  ('be000010-0003-0001-0001-000000000001', 'en', 'Select Date', '{}'),
  ('be000010-0004-0001-0001-000000000001', 'en', 'Select Tickets', '{}'),
  ('be000010-0005-0001-0001-000000000001', 'en', 'What''s Included', '{"included": ["2-hour massage", "Herbal steam", "Aromatherapy", "Tea & refreshments", "Shower facilities"], "excluded": ["Hotel transfer", "Tips"]}'),
  ('be000010-0006-0001-0001-000000000001', 'en', 'Reviews', '{"averageRating": 4.9, "totalReviews": 534}'),
  ('be000010-0007-0001-0001-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation 24 hours before."}');

INSERT INTO upsells (id, tour_id, status, pricing_type, retail_price, net_price, currency, "order") VALUES
  ('ae000010-0001-0001-0001-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'active', 'per_person', 800, 550, 'THB', 1),
  ('ae000010-0002-0001-0001-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'active', 'per_booking', 400, 250, 'THB', 2);

INSERT INTO upsell_translations (upsell_id, language, title, description) VALUES
  ('ae000010-0001-0001-0001-000000000001', 'en', 'Facial Treatment', 'Add a 45-min facial treatment'),
  ('ae000010-0002-0001-0001-000000000001', 'en', 'Hotel Pickup', 'Round-trip hotel transfer');

-- =====================================================
-- TOUR 15: Big Buddha Temple Tour (adult_child)
-- =====================================================
INSERT INTO tours (id, slug, status, pricing_engine) VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'phuket-big-buddha-tour', 'published', 'adult_child');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '{"type": "adult_child", "adult_retail_price": 1200, "adult_net_price": 900, "child_retail_price": 800, "child_net_price": 600, "currency": "THB", "child_age_max": 11, "min_pax": 1, "max_pax": 10}');

INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled) VALUES
  ('bf000010-0001-0001-0001-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'hero', 1, true),
  ('bf000010-0002-0001-0001-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'highlights', 2, true),
  ('bf000010-0003-0001-0001-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'itinerary', 3, true),
  ('bf000010-0004-0001-0001-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'availability_selector', 4, true),
  ('bf000010-0005-0001-0001-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'pricing_selector', 5, true),
  ('bf000010-0006-0001-0001-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'included_excluded', 6, true),
  ('bf000010-0007-0001-0001-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'map', 7, true),
  ('bf000010-0008-0001-0001-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'terms', 8, true);

INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('bf000010-0001-0001-0001-000000000001', 'en', 'Big Buddha & Temple Tour', '{"subtitle": "Visit Phuket''s most iconic landmark", "imageUrl": "https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200", "location": "Chalong, Phuket", "duration": "Half Day (4 hours)", "rating": 4.6, "reviewCount": 723, "badges": ["Cultural", "Landmark"]}'),
  ('bf000010-0002-0001-0001-000000000001', 'en', 'Tour Highlights', '{"items": ["45m Big Buddha statue", "Wat Chalong temple", "Panoramic views", "Learn about Buddhism", "Photo opportunities", "Local guide"]}'),
  ('bf000010-0003-0001-0001-000000000001', 'en', 'Itinerary', '{"items": [{"time": "09:00", "title": "Hotel Pickup", "description": "Pickup from hotel"}, {"time": "09:45", "title": "Wat Chalong", "description": "Visit famous temple"}, {"time": "11:00", "title": "Big Buddha", "description": "Explore the landmark"}, {"time": "12:30", "title": "Viewpoint", "description": "Panoramic photos"}, {"time": "13:00", "title": "Return", "description": "Drop-off at hotel"}]}'),
  ('bf000010-0004-0001-0001-000000000001', 'en', 'Select Date', '{}'),
  ('bf000010-0005-0001-0001-000000000001', 'en', 'Select Tickets', '{}'),
  ('bf000010-0006-0001-0001-000000000001', 'en', 'What''s Included', '{"included": ["Hotel transfers", "English guide", "Temple entrance", "Bottled water"], "excluded": ["Donations", "Tips", "Lunch"]}'),
  ('bf000010-0007-0001-0001-000000000001', 'en', 'Meeting Point', '{"address": "Big Buddha, Chalong", "latitude": 7.8276, "longitude": 98.3139}'),
  ('bf000010-0008-0001-0001-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation 24 hours before. Modest dress required."}');

-- =====================================================
-- TOUR 16: Night Market Food Tour (flat_per_person)
-- =====================================================
INSERT INTO tours (id, slug, status, pricing_engine) VALUES
  ('11111111-2222-3333-4444-555555555555', 'phuket-night-market-food-tour', 'published', 'flat_per_person');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('11111111-2222-3333-4444-555555555555', '{"type": "flat_per_person", "retail_price": 1500, "net_price": 1100, "currency": "THB", "min_pax": 2, "max_pax": 8}');

INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled) VALUES
  ('b1600010-0001-0001-0001-000000000001', '11111111-2222-3333-4444-555555555555', 'hero', 1, true),
  ('b1600010-0002-0001-0001-000000000001', '11111111-2222-3333-4444-555555555555', 'highlights', 2, true),
  ('b1600010-0003-0001-0001-000000000001', '11111111-2222-3333-4444-555555555555', 'itinerary', 3, true),
  ('b1600010-0004-0001-0001-000000000001', '11111111-2222-3333-4444-555555555555', 'availability_selector', 4, true),
  ('b1600010-0005-0001-0001-000000000001', '11111111-2222-3333-4444-555555555555', 'pricing_selector', 5, true),
  ('b1600010-0006-0001-0001-000000000001', '11111111-2222-3333-4444-555555555555', 'included_excluded', 6, true),
  ('b1600010-0007-0001-0001-000000000001', '11111111-2222-3333-4444-555555555555', 'terms', 7, true);

INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('b1600010-0001-0001-0001-000000000001', 'en', 'Phuket Night Market Food Tour', '{"subtitle": "Taste authentic Thai street food", "imageUrl": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200", "location": "Phuket Town", "duration": "3 hours", "rating": 4.8, "reviewCount": 356, "badges": ["Food", "Night Tour"]}'),
  ('b1600010-0002-0001-0001-000000000001', 'en', 'Tour Highlights', '{"items": ["10+ food tastings", "Local night market", "Hidden food gems", "Thai desserts", "Local drinks", "Foodie guide"]}'),
  ('b1600010-0003-0001-0001-000000000001', 'en', 'Itinerary', '{"items": [{"time": "18:00", "title": "Meeting Point", "description": "Meet at market entrance"}, {"time": "18:15", "title": "Street Food", "description": "Start food tasting"}, {"time": "19:30", "title": "Main Dishes", "description": "Try local specialties"}, {"time": "20:30", "title": "Desserts", "description": "Thai sweets"}, {"time": "21:00", "title": "End", "description": "Tour ends"}]}'),
  ('b1600010-0004-0001-0001-000000000001', 'en', 'Select Date', '{}'),
  ('b1600010-0005-0001-0001-000000000001', 'en', 'Select Tickets', '{}'),
  ('b1600010-0006-0001-0001-000000000001', 'en', 'What''s Included', '{"included": ["10+ food tastings", "Local guide", "Drinks"], "excluded": ["Hotel transfer", "Additional food"]}'),
  ('b1600010-0007-0001-0001-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation 24 hours before."}');

-- =====================================================
-- TOUR 17: Coral Island Day Trip (adult_child)
-- =====================================================
INSERT INTO tours (id, slug, status, pricing_engine) VALUES
  ('22222222-3333-4444-5555-666666666666', 'coral-island-day-trip', 'published', 'adult_child');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('22222222-3333-4444-5555-666666666666', '{"type": "adult_child", "adult_retail_price": 1800, "adult_net_price": 1400, "child_retail_price": 1200, "child_net_price": 900, "currency": "THB", "child_age_max": 11, "min_pax": 1, "max_pax": 10}');

INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled) VALUES
  ('b1700010-0001-0001-0001-000000000001', '22222222-3333-4444-5555-666666666666', 'hero', 1, true),
  ('b1700010-0002-0001-0001-000000000001', '22222222-3333-4444-5555-666666666666', 'highlights', 2, true),
  ('b1700010-0003-0001-0001-000000000001', '22222222-3333-4444-5555-666666666666', 'availability_selector', 3, true),
  ('b1700010-0004-0001-0001-000000000001', '22222222-3333-4444-5555-666666666666', 'pricing_selector', 4, true),
  ('b1700010-0005-0001-0001-000000000001', '22222222-3333-4444-5555-666666666666', 'included_excluded', 5, true),
  ('b1700010-0006-0001-0001-000000000001', '22222222-3333-4444-5555-666666666666', 'upsells', 6, true),
  ('b1700010-0007-0001-0001-000000000001', '22222222-3333-4444-5555-666666666666', 'terms', 7, true);

INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('b1700010-0001-0001-0001-000000000001', 'en', 'Coral Island Day Trip', '{"subtitle": "Beach paradise just 15 minutes from Phuket", "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200", "location": "Coral Island", "duration": "Full Day", "rating": 4.7, "reviewCount": 512, "badges": ["Beach", "Family"]}'),
  ('b1700010-0002-0001-0001-000000000001', 'en', 'Tour Highlights', '{"items": ["White sand beach", "Clear water swimming", "Water sports available", "Snorkeling", "Beach lunch", "Relaxation time"]}'),
  ('b1700010-0003-0001-0001-000000000001', 'en', 'Select Date', '{}'),
  ('b1700010-0004-0001-0001-000000000001', 'en', 'Select Tickets', '{}'),
  ('b1700010-0005-0001-0001-000000000001', 'en', 'What''s Included', '{"included": ["Speedboat transfer", "Beach chair", "Lunch", "Snorkeling gear", "Insurance"], "excluded": ["Water sports", "Tips", "Drinks"]}'),
  ('b1700010-0006-0001-0001-000000000001', 'en', 'Add-ons', '{}'),
  ('b1700010-0007-0001-0001-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation 24 hours before."}');

INSERT INTO upsells (id, tour_id, status, pricing_type, retail_price, net_price, currency, "order") VALUES
  ('a1700010-0001-0001-0001-000000000001', '22222222-3333-4444-5555-666666666666', 'active', 'per_person', 800, 550, 'THB', 1),
  ('a1700010-0002-0001-0001-000000000001', '22222222-3333-4444-5555-666666666666', 'active', 'per_person', 1200, 800, 'THB', 2);

INSERT INTO upsell_translations (upsell_id, language, title, description) VALUES
  ('a1700010-0001-0001-0001-000000000001', 'en', 'Parasailing', 'Fly over the island'),
  ('a1700010-0002-0001-0001-000000000001', 'en', 'Jet Ski', '30-minute jet ski rental');

-- =====================================================
-- TOUR 18: Phuket Pub Crawl (seat_based)
-- =====================================================
INSERT INTO tours (id, slug, status, pricing_engine) VALUES
  ('33333333-4444-5555-6666-777777777777', 'phuket-pub-crawl', 'published', 'seat_based');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('33333333-4444-5555-6666-777777777777', '{"type": "seat_based", "currency": "THB", "seats": [{"seat_type": "VIP Package", "retail_price": 2500, "net_price": 1900, "capacity": 20}, {"seat_type": "Standard Package", "retail_price": 1500, "net_price": 1100, "capacity": 50}]}');

INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled) VALUES
  ('b1800010-0001-0001-0001-000000000001', '33333333-4444-5555-6666-777777777777', 'hero', 1, true),
  ('b1800010-0002-0001-0001-000000000001', '33333333-4444-5555-6666-777777777777', 'highlights', 2, true),
  ('b1800010-0003-0001-0001-000000000001', '33333333-4444-5555-6666-777777777777', 'availability_selector', 3, true),
  ('b1800010-0004-0001-0001-000000000001', '33333333-4444-5555-6666-777777777777', 'pricing_selector', 4, true),
  ('b1800010-0005-0001-0001-000000000001', '33333333-4444-5555-6666-777777777777', 'included_excluded', 5, true),
  ('b1800010-0006-0001-0001-000000000001', '33333333-4444-5555-6666-777777777777', 'safety_info', 6, true),
  ('b1800010-0007-0001-0001-000000000001', '33333333-4444-5555-6666-777777777777', 'terms', 7, true);

INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('b1800010-0001-0001-0001-000000000001', 'en', 'Phuket Pub Crawl', '{"subtitle": "Experience Patong nightlife with new friends", "imageUrl": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200", "location": "Patong Beach", "duration": "5 hours", "rating": 4.5, "reviewCount": 234, "badges": ["Nightlife", "Social"]}'),
  ('b1800010-0002-0001-0001-000000000001', 'en', 'Tour Highlights', '{"items": ["4 bars/clubs", "Free drinks at each venue", "Skip the lines", "Party games", "New friends", "Party host"]}'),
  ('b1800010-0003-0001-0001-000000000001', 'en', 'Select Date', '{}'),
  ('b1800010-0004-0001-0001-000000000001', 'en', 'Select Package', '{}'),
  ('b1800010-0005-0001-0001-000000000001', 'en', 'What''s Included', '{"included": ["4 venue entries", "1 drink per venue", "Party host", "Games & prizes"], "excluded": ["Additional drinks", "Hotel transfer"]}'),
  ('b1800010-0006-0001-0001-000000000001', 'en', 'Safety Information', '{"items": ["Minimum age 20", "ID required", "Drink responsibly"], "restrictions": ["Under 20 years old"]}'),
  ('b1800010-0007-0001-0001-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation 24 hours before."}');

-- =====================================================
-- TOUR 19: Phuket Golf Day (seat_based)
-- =====================================================
INSERT INTO tours (id, slug, status, pricing_engine) VALUES
  ('44444444-5555-6666-7777-888888888888', 'phuket-golf-day', 'published', 'seat_based');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('44444444-5555-6666-7777-888888888888', '{"type": "seat_based", "currency": "THB", "seats": [{"seat_type": "Premium Course", "retail_price": 5500, "net_price": 4200, "capacity": 20}, {"seat_type": "Standard Course", "retail_price": 3500, "net_price": 2700, "capacity": 40}]}');

INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled) VALUES
  ('b1900010-0001-0001-0001-000000000001', '44444444-5555-6666-7777-888888888888', 'hero', 1, true),
  ('b1900010-0002-0001-0001-000000000001', '44444444-5555-6666-7777-888888888888', 'highlights', 2, true),
  ('b1900010-0003-0001-0001-000000000001', '44444444-5555-6666-7777-888888888888', 'availability_selector', 3, true),
  ('b1900010-0004-0001-0001-000000000001', '44444444-5555-6666-7777-888888888888', 'pricing_selector', 4, true),
  ('b1900010-0005-0001-0001-000000000001', '44444444-5555-6666-7777-888888888888', 'included_excluded', 5, true),
  ('b1900010-0006-0001-0001-000000000001', '44444444-5555-6666-7777-888888888888', 'terms', 6, true);

INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('b1900010-0001-0001-0001-000000000001', 'en', 'Phuket Golf Day', '{"subtitle": "Play world-class courses with ocean views", "imageUrl": "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200", "location": "Phuket", "duration": "Full Day", "rating": 4.8, "reviewCount": 189, "badges": ["Golf", "Premium"]}'),
  ('b1900010-0002-0001-0001-000000000001', 'en', 'Tour Highlights', '{"items": ["18-hole championship course", "Golf cart included", "Caddy service", "Club rental available", "Lunch at clubhouse", "Hotel transfer"]}'),
  ('b1900010-0003-0001-0001-000000000001', 'en', 'Select Date', '{}'),
  ('b1900010-0004-0001-0001-000000000001', 'en', 'Select Course', '{}'),
  ('b1900010-0005-0001-0001-000000000001', 'en', 'What''s Included', '{"included": ["Green fee", "Golf cart", "Caddy", "Hotel transfer", "Lunch"], "excluded": ["Club rental", "Tips", "Drinks"]}'),
  ('b1900010-0006-0001-0001-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation 48 hours before."}');

INSERT INTO upsells (id, tour_id, status, pricing_type, retail_price, net_price, currency, "order") VALUES
  ('a1900010-0001-0001-0001-000000000001', '44444444-5555-6666-7777-888888888888', 'active', 'per_booking', 800, 550, 'THB', 1);

INSERT INTO upsell_translations (upsell_id, language, title, description) VALUES
  ('a1900010-0001-0001-0001-000000000001', 'en', 'Club Rental', 'Premium golf club set rental');

-- =====================================================
-- TOUR 20: Phuket Yacht Charter (seat_based)
-- =====================================================
INSERT INTO tours (id, slug, status, pricing_engine) VALUES
  ('55555555-6666-7777-8888-999999999999', 'phuket-yacht-charter', 'published', 'seat_based');

INSERT INTO tour_pricing (tour_id, config) VALUES
  ('55555555-6666-7777-8888-999999999999', '{"type": "seat_based", "currency": "THB", "seats": [{"seat_type": "Full Day Charter", "retail_price": 45000, "net_price": 35000, "capacity": 1}, {"seat_type": "Half Day Charter", "retail_price": 28000, "net_price": 22000, "capacity": 1}]}');

INSERT INTO tour_blocks (id, tour_id, block_type, "order", enabled) VALUES
  ('b2000010-0001-0001-0001-000000000001', '55555555-6666-7777-8888-999999999999', 'hero', 1, true),
  ('b2000010-0002-0001-0001-000000000001', '55555555-6666-7777-8888-999999999999', 'highlights', 2, true),
  ('b2000010-0003-0001-0001-000000000001', '55555555-6666-7777-8888-999999999999', 'availability_selector', 3, true),
  ('b2000010-0004-0001-0001-000000000001', '55555555-6666-7777-8888-999999999999', 'pricing_selector', 4, true),
  ('b2000010-0005-0001-0001-000000000001', '55555555-6666-7777-8888-999999999999', 'included_excluded', 5, true),
  ('b2000010-0006-0001-0001-000000000001', '55555555-6666-7777-8888-999999999999', 'reviews', 6, true),
  ('b2000010-0007-0001-0001-000000000001', '55555555-6666-7777-8888-999999999999', 'terms', 7, true);

INSERT INTO tour_block_translations (block_id, language, title, content) VALUES
  ('b2000010-0001-0001-0001-000000000001', 'en', 'Private Yacht Charter', '{"subtitle": "Luxury yacht experience around Phuket islands", "imageUrl": "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200", "location": "Phuket Marina", "duration": "Half/Full Day", "rating": 4.9, "reviewCount": 156, "badges": ["Luxury", "Private"]}'),
  ('b2000010-0002-0001-0001-000000000001', 'en', 'Tour Highlights', '{"items": ["Private luxury yacht", "Captain & crew", "Island hopping", "Snorkeling equipment", "Gourmet lunch", "Open bar"]}'),
  ('b2000010-0003-0001-0001-000000000001', 'en', 'Select Date', '{}'),
  ('b2000010-0004-0001-0001-000000000001', 'en', 'Select Charter', '{}'),
  ('b2000010-0005-0001-0001-000000000001', 'en', 'What''s Included', '{"included": ["Private yacht (up to 10 guests)", "Captain & crew", "Fuel", "Snorkeling gear", "Gourmet lunch", "Open bar", "Towels"], "excluded": ["Marina transfer", "Tips"]}'),
  ('b2000010-0006-0001-0001-000000000001', 'en', 'Reviews', '{"averageRating": 4.9, "totalReviews": 156}'),
  ('b2000010-0007-0001-0001-000000000001', 'en', 'Terms & Conditions', '{"cancellationPolicy": "Free cancellation 72 hours before. 50% refund within 48-72 hours."}');

INSERT INTO upsells (id, tour_id, status, pricing_type, retail_price, net_price, currency, "order") VALUES
  ('a2000010-0001-0001-0001-000000000001', '55555555-6666-7777-8888-999999999999', 'active', 'per_booking', 5000, 3500, 'THB', 1),
  ('a2000010-0002-0001-0001-000000000001', '55555555-6666-7777-8888-999999999999', 'active', 'per_booking', 3000, 2000, 'THB', 2);

INSERT INTO upsell_translations (upsell_id, language, title, description) VALUES
  ('a2000010-0001-0001-0001-000000000001', 'en', 'Jet Ski', 'Jet ski for the day'),
  ('a2000010-0002-0001-0001-000000000001', 'en', 'Champagne Package', 'Premium champagne & canapés');

-- =====================================================
-- AVAILABILITY FOR ALL NEW TOURS (Next 30 days)
-- =====================================================
DO $$
DECLARE
  tour_ids UUID[] := ARRAY[
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666',
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888888',
    '99999999-9999-9999-9999-999999999999',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    '11111111-2222-3333-4444-555555555555',
    '22222222-3333-4444-5555-666666666666',
    '33333333-4444-5555-6666-777777777777',
    '44444444-5555-6666-7777-888888888888',
    '55555555-6666-7777-8888-999999999999'
  ];
  tour_id UUID;
  d DATE;
BEGIN
  FOREACH tour_id IN ARRAY tour_ids LOOP
    FOR d IN SELECT generate_series(CURRENT_DATE, CURRENT_DATE + 30, '1 day'::interval)::date LOOP
      INSERT INTO tour_availability (tour_id, date, time_slot, capacity, booked, enabled)
      VALUES 
        (tour_id, d, '09:00', 20, floor(random() * 8)::int, true),
        (tour_id, d, '14:00', 20, floor(random() * 5)::int, true)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Also add availability for original 3 tours for next 30 days
DO $$
DECLARE
  tour_ids UUID[] := ARRAY[
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333'
  ];
  tour_id UUID;
  d DATE;
BEGIN
  FOREACH tour_id IN ARRAY tour_ids LOOP
    FOR d IN SELECT generate_series(CURRENT_DATE, CURRENT_DATE + 30, '1 day'::interval)::date LOOP
      INSERT INTO tour_availability (tour_id, date, time_slot, capacity, booked, enabled)
      VALUES 
        (tour_id, d, '09:00', 25, floor(random() * 10)::int, true),
        (tour_id, d, '14:00', 25, floor(random() * 8)::int, true)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- =====================================================
-- 30 DEMO BOOKINGS
-- =====================================================

-- Booking 1: Confirmed - Zipline
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000001-0001-0001-0001-000000000001', 'AST-2025-0001', '11111111-1111-1111-1111-111111111111', CURRENT_DATE - 2, 'John Smith', 'john.smith@email.com', '+1-555-0101', 'US', 3600, 2800, 'THB', 'confirmed', 'en', 'vt-001', 'Anniversary trip', CURRENT_TIMESTAMP - INTERVAL '5 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000001-0001-0001-0001-000000000001', 'tour', '11111111-1111-1111-1111-111111111111', 'Phuket Zipline Adventure', 2, 1800, 1400, 3600, 2800, '{"adults": 2}');

-- Booking 2: Confirmed - Phi Phi Islands
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000002-0001-0001-0001-000000000001', 'AST-2025-0002', '22222222-2222-2222-2222-222222222222', CURRENT_DATE - 1, 'Emma Wilson', 'emma.wilson@email.com', '+44-7700-0102', 'UK', 8500, 6800, 'THB', 'confirmed', 'en', 'vt-002', 'Family vacation', CURRENT_TIMESTAMP - INTERVAL '7 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000002-0001-0001-0001-000000000001', 'tour', '22222222-2222-2222-2222-222222222222', 'Phi Phi Islands Boat Tour', 2, 2500, 2000, 5000, 4000, '{"adults": 2}'),
  ('b0000002-0001-0001-0001-000000000001', 'tour', '22222222-2222-2222-2222-222222222222', 'Phi Phi Islands Boat Tour (Child)', 2, 1500, 1200, 3000, 2400, '{"children": 2}'),
  ('b0000002-0001-0001-0001-000000000001', 'upsell', 'c2222222-0002-0000-0000-000000000001', 'Underwater Camera Rental', 1, 300, 150, 300, 150, null);

-- Booking 3: Confirmed - Cabaret Show
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000003-0001-0001-0001-000000000001', 'AST-2025-0003', '33333333-3333-3333-3333-333333333333', CURRENT_DATE + 1, 'Hans Mueller', 'hans.m@email.de', '+49-170-0103', 'DE', 3600, 2800, 'THB', 'confirmed', 'en', 'vt-003', null, CURRENT_TIMESTAMP - INTERVAL '3 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000003-0001-0001-0001-000000000001', 'tour', '33333333-3333-3333-3333-333333333333', 'Siam Cabaret Show - VIP', 2, 1500, 1200, 3000, 2400, '{"seat_type": "VIP", "qty": 2}'),
  ('b0000003-0001-0001-0001-000000000001', 'upsell', 'c3333333-0001-0000-0000-000000000001', 'Hotel Transfer', 1, 600, 400, 600, 400, null);

-- Booking 4: Confirmed - James Bond Island
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000004-0001-0001-0001-000000000001', 'AST-2025-0004', '44444444-4444-4444-4444-444444444444', CURRENT_DATE + 2, 'Marie Dupont', 'marie.d@email.fr', '+33-6-0104', 'FR', 4400, 3400, 'THB', 'confirmed', 'fr', 'vt-004', 'Honeymoon', CURRENT_TIMESTAMP - INTERVAL '10 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000004-0001-0001-0001-000000000001', 'tour', '44444444-4444-4444-4444-444444444444', 'James Bond Island Speedboat', 2, 2200, 1700, 4400, 3400, '{"adults": 2}');

-- Booking 5: Confirmed - Elephant Sanctuary
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000005-0001-0001-0001-000000000001', 'AST-2025-0005', '66666666-6666-6666-6666-666666666666', CURRENT_DATE + 3, 'Yuki Tanaka', 'yuki.t@email.jp', '+81-90-0105', 'JP', 9000, 7200, 'THB', 'confirmed', 'ja', 'vt-005', null, CURRENT_TIMESTAMP - INTERVAL '4 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000005-0001-0001-0001-000000000001', 'tour', '66666666-6666-6666-6666-666666666666', 'Elephant Sanctuary (Adult)', 2, 3500, 2800, 7000, 5600, '{"adults": 2}'),
  ('b0000005-0001-0001-0001-000000000001', 'tour', '66666666-6666-6666-6666-666666666666', 'Elephant Sanctuary (Child)', 1, 2000, 1600, 2000, 1600, '{"children": 1}');

-- Booking 6: Confirmed - Similan Diving
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000006-0001-0001-0001-000000000001', 'AST-2025-0006', '77777777-7777-7777-7777-777777777777', CURRENT_DATE + 4, 'Carlos Garcia', 'carlos.g@email.es', '+34-600-0106', 'ES', 10500, 8200, 'THB', 'confirmed', 'es', 'vt-006', 'Diving certification', CURRENT_TIMESTAMP - INTERVAL '6 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000006-0001-0001-0001-000000000001', 'tour', '77777777-7777-7777-7777-777777777777', 'Similan Islands Snorkeling', 2, 4500, 3600, 9000, 7200, '{"adults": 2}'),
  ('b0000006-0001-0001-0001-000000000001', 'upsell', 'a7000010-0001-0001-0001-000000000001', 'Discover Scuba Diving', 1, 1500, 1000, 1500, 1000, null);

-- Booking 7: Confirmed - Cooking Class
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000007-0001-0001-0001-000000000001', 'AST-2025-0007', '88888888-8888-8888-8888-888888888888', CURRENT_DATE - 3, 'Sarah Johnson', 'sarah.j@email.com', '+1-555-0107', 'US', 5200, 3900, 'THB', 'confirmed', 'en', 'vt-007', 'Vegetarian', CURRENT_TIMESTAMP - INTERVAL '8 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000007-0001-0001-0001-000000000001', 'tour', '88888888-8888-8888-8888-888888888888', 'Thai Cooking Class (Adult)', 2, 2000, 1500, 4000, 3000, '{"adults": 2}'),
  ('b0000007-0001-0001-0001-000000000001', 'tour', '88888888-8888-8888-8888-888888888888', 'Thai Cooking Class (Child)', 1, 1200, 900, 1200, 900, '{"children": 1}');

-- Booking 8: Confirmed - FantaSea
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000008-0001-0001-0001-000000000001', 'AST-2025-0008', '99999999-9999-9999-9999-999999999999', CURRENT_DATE + 5, 'Wei Chen', 'wei.chen@email.cn', '+86-138-0108', 'CN', 7200, 5500, 'THB', 'confirmed', 'zh', 'vt-008', null, CURRENT_TIMESTAMP - INTERVAL '2 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000008-0001-0001-0001-000000000001', 'tour', '99999999-9999-9999-9999-999999999999', 'FantaSea Gold Seat', 2, 2200, 1700, 4400, 3400, '{"seat_type": "Gold", "qty": 2}'),
  ('b0000008-0001-0001-0001-000000000001', 'upsell', 'a9000010-0001-0001-0001-000000000001', 'Buffet Dinner', 2, 900, 650, 1800, 1300, null),
  ('b0000008-0001-0001-0001-000000000001', 'upsell', 'a9000010-0002-0001-0001-000000000001', 'Hotel Transfer', 1, 600, 400, 600, 400, null);

-- Booking 9: Confirmed - Sunset Cruise
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000009-0001-0001-0001-000000000001', 'AST-2025-0009', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE + 6, 'Isabella Rossi', 'isabella.r@email.it', '+39-333-0109', 'IT', 8500, 6600, 'THB', 'confirmed', 'it', 'vt-009', 'Birthday celebration', CURRENT_TIMESTAMP - INTERVAL '9 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000009-0001-0001-0001-000000000001', 'tour', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sunset Cruise Premium Deck', 2, 3500, 2800, 7000, 5600, '{"seat_type": "Premium", "qty": 2}'),
  ('b0000009-0001-0001-0001-000000000001', 'upsell', 'aa000010-0002-0001-0001-000000000001', 'Celebration Package', 1, 1500, 1000, 1500, 1000, null);

-- Booking 10: Confirmed - ATV
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000010-0001-0001-0001-000000000001', 'AST-2025-0010', '55555555-5555-5555-5555-555555555555', CURRENT_DATE - 4, 'Alex Brown', 'alex.b@email.com', '+61-400-0110', 'AU', 3400, 2500, 'THB', 'confirmed', 'en', 'vt-010', null, CURRENT_TIMESTAMP - INTERVAL '11 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000010-0001-0001-0001-000000000001', 'tour', '55555555-5555-5555-5555-555555555555', 'ATV Adventure', 2, 1500, 1100, 3000, 2200, '{"adults": 2}'),
  ('b0000010-0001-0001-0001-000000000001', 'upsell', 'a5000010-0001-0001-0001-000000000001', 'Hotel Transfer', 1, 400, 250, 400, 250, null);

-- Booking 11: Confirmed - Muay Thai
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000011-0001-0001-0001-000000000001', 'AST-2025-0011', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', CURRENT_DATE + 7, 'Mike Thompson', 'mike.t@email.com', '+1-555-0111', 'US', 2400, 1800, 'THB', 'confirmed', 'en', 'vt-011', 'Beginner level', CURRENT_TIMESTAMP - INTERVAL '1 day');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000011-0001-0001-0001-000000000001', 'tour', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Muay Thai Class', 2, 1200, 900, 2400, 1800, '{"adults": 2}');

-- Booking 12: Confirmed - Old Town Tour
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000012-0001-0001-0001-000000000001', 'AST-2025-0012', 'cccccccc-cccc-cccc-cccc-cccccccccccc', CURRENT_DATE - 5, 'Anna Schmidt', 'anna.s@email.de', '+49-170-0112', 'DE', 1600, 1200, 'THB', 'confirmed', 'en', 'vt-012', null, CURRENT_TIMESTAMP - INTERVAL '12 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000012-0001-0001-0001-000000000001', 'tour', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Old Town Walking Tour', 2, 800, 600, 1600, 1200, '{"adults": 2}');

-- Booking 13: Confirmed - Kayaking
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000013-0001-0001-0001-000000000001', 'AST-2025-0013', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + 8, 'David Lee', 'david.l@email.com', '+82-10-0113', 'KR', 7400, 5800, 'THB', 'confirmed', 'ko', 'vt-013', null, CURRENT_TIMESTAMP - INTERVAL '5 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000013-0001-0001-0001-000000000001', 'tour', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Phang Nga Kayaking (Adult)', 2, 2800, 2200, 5600, 4400, '{"adults": 2}'),
  ('b0000013-0001-0001-0001-000000000001', 'tour', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Phang Nga Kayaking (Child)', 1, 1800, 1400, 1800, 1400, '{"children": 1}');

-- Booking 14: Confirmed - Spa
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000014-0001-0001-0001-000000000001', 'AST-2025-0014', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', CURRENT_DATE + 1, 'Sophie Martin', 'sophie.m@email.fr', '+33-6-0114', 'FR', 5800, 4300, 'THB', 'confirmed', 'fr', 'vt-014', 'Couples package', CURRENT_TIMESTAMP - INTERVAL '3 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000014-0001-0001-0001-000000000001', 'tour', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Luxury Spa Experience', 2, 2500, 1900, 5000, 3800, '{"adults": 2}'),
  ('b0000014-0001-0001-0001-000000000001', 'upsell', 'ae000010-0001-0001-0001-000000000001', 'Facial Treatment', 1, 800, 550, 800, 550, null);

-- Booking 15: Confirmed - Big Buddha
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000015-0001-0001-0001-000000000001', 'AST-2025-0015', 'ffffffff-ffff-ffff-ffff-ffffffffffff', CURRENT_DATE - 6, 'Robert Wilson', 'robert.w@email.com', '+1-555-0115', 'US', 2800, 2100, 'THB', 'confirmed', 'en', 'vt-015', null, CURRENT_TIMESTAMP - INTERVAL '14 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000015-0001-0001-0001-000000000001', 'tour', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Big Buddha Tour (Adult)', 2, 1200, 900, 2400, 1800, '{"adults": 2}'),
  ('b0000015-0001-0001-0001-000000000001', 'tour', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Big Buddha Tour (Child)', 1, 800, 600, 800, 600, '{"children": 1}');

-- Booking 16: Pending - Night Market Food
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000016-0001-0001-0001-000000000001', 'AST-2025-0016', '11111111-2222-3333-4444-555555555555', CURRENT_DATE + 2, 'Lisa Anderson', 'lisa.a@email.com', '+1-555-0116', 'US', 3000, 2200, 'THB', 'pending', 'en', 'vt-016', null, CURRENT_TIMESTAMP - INTERVAL '1 day');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000016-0001-0001-0001-000000000001', 'tour', '11111111-2222-3333-4444-555555555555', 'Night Market Food Tour', 2, 1500, 1100, 3000, 2200, '{"adults": 2}');

-- Booking 17: Pending - Coral Island
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000017-0001-0001-0001-000000000001', 'AST-2025-0017', '22222222-3333-4444-5555-666666666666', CURRENT_DATE + 3, 'James Taylor', 'james.t@email.co.uk', '+44-7700-0117', 'UK', 6000, 4600, 'THB', 'pending', 'en', 'vt-017', 'Need parasailing', CURRENT_TIMESTAMP - INTERVAL '2 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000017-0001-0001-0001-000000000001', 'tour', '22222222-3333-4444-5555-666666666666', 'Coral Island (Adult)', 2, 1800, 1400, 3600, 2800, '{"adults": 2}'),
  ('b0000017-0001-0001-0001-000000000001', 'tour', '22222222-3333-4444-5555-666666666666', 'Coral Island (Child)', 2, 1200, 900, 2400, 1800, '{"children": 2}');

-- Booking 18: Pending - Pub Crawl
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000018-0001-0001-0001-000000000001', 'AST-2025-0018', '33333333-4444-5555-6666-777777777777', CURRENT_DATE + 4, 'Mark Davis', 'mark.d@email.com', '+61-400-0118', 'AU', 5000, 3800, 'THB', 'pending', 'en', 'vt-018', 'Birthday party', CURRENT_TIMESTAMP - INTERVAL '1 day');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000018-0001-0001-0001-000000000001', 'tour', '33333333-4444-5555-6666-777777777777', 'Pub Crawl VIP', 2, 2500, 1900, 5000, 3800, '{"seat_type": "VIP", "qty": 2}');

-- Booking 19: Pending - Golf
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000019-0001-0001-0001-000000000001', 'AST-2025-0019', '44444444-5555-6666-7777-888888888888', CURRENT_DATE + 5, 'Peter Johansson', 'peter.j@email.se', '+46-70-0119', 'SE', 11800, 8950, 'THB', 'pending', 'en', 'vt-019', 'Need club rental', CURRENT_TIMESTAMP - INTERVAL '3 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000019-0001-0001-0001-000000000001', 'tour', '44444444-5555-6666-7777-888888888888', 'Golf Premium Course', 2, 5500, 4200, 11000, 8400, '{"seat_type": "Premium", "qty": 2}'),
  ('b0000019-0001-0001-0001-000000000001', 'upsell', 'a1900010-0001-0001-0001-000000000001', 'Club Rental', 1, 800, 550, 800, 550, null);

-- Booking 20: Pending - Yacht
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000020-0001-0001-0001-000000000001', 'AST-2025-0020', '55555555-6666-7777-8888-999999999999', CURRENT_DATE + 7, 'Richard King', 'richard.k@email.com', '+1-555-0120', 'US', 50000, 38500, 'THB', 'pending', 'en', 'vt-020', 'Corporate event - 8 guests', CURRENT_TIMESTAMP - INTERVAL '2 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000020-0001-0001-0001-000000000001', 'tour', '55555555-6666-7777-8888-999999999999', 'Yacht Full Day Charter', 1, 45000, 35000, 45000, 35000, '{"seat_type": "Full Day", "qty": 1}'),
  ('b0000020-0001-0001-0001-000000000001', 'upsell', 'a2000010-0001-0001-0001-000000000001', 'Jet Ski', 1, 5000, 3500, 5000, 3500, null);

-- Booking 21: Pending - Zipline
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000021-0001-0001-0001-000000000001', 'AST-2025-0021', '11111111-1111-1111-1111-111111111111', CURRENT_DATE + 6, 'Jennifer White', 'jennifer.w@email.com', '+1-555-0121', 'US', 5400, 4200, 'THB', 'pending', 'en', 'vt-021', null, CURRENT_TIMESTAMP - INTERVAL '4 hours');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000021-0001-0001-0001-000000000001', 'tour', '11111111-1111-1111-1111-111111111111', 'Zipline Adventure', 3, 1800, 1400, 5400, 4200, '{"adults": 3}');

-- Booking 22: Pending Payment - Phi Phi
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000022-0001-0001-0001-000000000001', 'AST-2025-0022', '22222222-2222-2222-2222-222222222222', CURRENT_DATE + 4, 'Thomas Berg', 'thomas.b@email.no', '+47-900-0122', 'NO', 5000, 4000, 'THB', 'pending_payment', 'en', 'vt-022', null, CURRENT_TIMESTAMP - INTERVAL '6 hours');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000022-0001-0001-0001-000000000001', 'tour', '22222222-2222-2222-2222-222222222222', 'Phi Phi Islands (Adult)', 2, 2500, 2000, 5000, 4000, '{"adults": 2}');

-- Booking 23: Pending Payment - Elephant
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000023-0001-0001-0001-000000000001', 'AST-2025-0023', '66666666-6666-6666-6666-666666666666', CURRENT_DATE + 5, 'Michelle Brown', 'michelle.b@email.ca', '+1-604-0123', 'CA', 7000, 5600, 'THB', 'pending_payment', 'en', 'vt-023', 'Family trip', CURRENT_TIMESTAMP - INTERVAL '8 hours');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000023-0001-0001-0001-000000000001', 'tour', '66666666-6666-6666-6666-666666666666', 'Elephant Sanctuary (Adult)', 2, 3500, 2800, 7000, 5600, '{"adults": 2}');

-- Booking 24: Completed - Zipline (past)
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000024-0001-0001-0001-000000000001', 'AST-2025-0024', '11111111-1111-1111-1111-111111111111', CURRENT_DATE - 10, 'Kevin O''Brien', 'kevin.ob@email.ie', '+353-87-0124', 'IE', 3600, 2800, 'THB', 'completed', 'en', 'vt-024', 'Great experience!', CURRENT_TIMESTAMP - INTERVAL '15 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000024-0001-0001-0001-000000000001', 'tour', '11111111-1111-1111-1111-111111111111', 'Zipline Adventure', 2, 1800, 1400, 3600, 2800, '{"adults": 2}');

-- Booking 25: Completed - Phi Phi (past)
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000025-0001-0001-0001-000000000001', 'AST-2025-0025', '22222222-2222-2222-2222-222222222222', CURRENT_DATE - 12, 'Natalie Green', 'natalie.g@email.com', '+1-555-0125', 'US', 8000, 6400, 'THB', 'completed', 'en', 'vt-025', null, CURRENT_TIMESTAMP - INTERVAL '18 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000025-0001-0001-0001-000000000001', 'tour', '22222222-2222-2222-2222-222222222222', 'Phi Phi Islands (Adult)', 2, 2500, 2000, 5000, 4000, '{"adults": 2}'),
  ('b0000025-0001-0001-0001-000000000001', 'tour', '22222222-2222-2222-2222-222222222222', 'Phi Phi Islands (Child)', 2, 1500, 1200, 3000, 2400, '{"children": 2}');

-- Booking 26: Completed - James Bond (past)
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000026-0001-0001-0001-000000000001', 'AST-2025-0026', '44444444-4444-4444-4444-444444444444', CURRENT_DATE - 8, 'Daniel Kim', 'daniel.k@email.com', '+82-10-0126', 'KR', 6600, 5100, 'THB', 'completed', 'ko', 'vt-026', null, CURRENT_TIMESTAMP - INTERVAL '12 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000026-0001-0001-0001-000000000001', 'tour', '44444444-4444-4444-4444-444444444444', 'James Bond Island', 3, 2200, 1700, 6600, 5100, '{"adults": 3}');

-- Booking 27: Completed - Cooking Class (past)
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000027-0001-0001-0001-000000000001', 'AST-2025-0027', '88888888-8888-8888-8888-888888888888', CURRENT_DATE - 14, 'Laura Martinez', 'laura.m@email.es', '+34-600-0127', 'ES', 4000, 3000, 'THB', 'completed', 'es', 'vt-027', 'Loved the Pad Thai!', CURRENT_TIMESTAMP - INTERVAL '20 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000027-0001-0001-0001-000000000001', 'tour', '88888888-8888-8888-8888-888888888888', 'Thai Cooking Class', 2, 2000, 1500, 4000, 3000, '{"adults": 2}');

-- Booking 28: Completed - Spa (past)
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000028-0001-0001-0001-000000000001', 'AST-2025-0028', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', CURRENT_DATE - 7, 'Amanda Clark', 'amanda.c@email.com', '+1-555-0128', 'US', 5000, 3800, 'THB', 'completed', 'en', 'vt-028', 'Very relaxing', CURRENT_TIMESTAMP - INTERVAL '10 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000028-0001-0001-0001-000000000001', 'tour', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Luxury Spa', 2, 2500, 1900, 5000, 3800, '{"adults": 2}');

-- Booking 29: Cancelled - Similan
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000029-0001-0001-0001-000000000001', 'AST-2025-0029', '77777777-7777-7777-7777-777777777777', CURRENT_DATE + 3, 'Chris Evans', 'chris.e@email.com', '+1-555-0129', 'US', 9000, 7200, 'THB', 'cancelled', 'en', 'vt-029', 'Flight cancelled', CURRENT_TIMESTAMP - INTERVAL '5 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000029-0001-0001-0001-000000000001', 'tour', '77777777-7777-7777-7777-777777777777', 'Similan Islands', 2, 4500, 3600, 9000, 7200, '{"adults": 2}');

-- Booking 30: Cancelled - Yacht
INSERT INTO bookings (id, reference, tour_id, booking_date, customer_name, customer_email, customer_phone, customer_nationality, total_retail, total_net, currency, status, language, voucher_token, notes, created_at) VALUES
  ('b0000030-0001-0001-0001-000000000001', 'AST-2025-0030', '55555555-6666-7777-8888-999999999999', CURRENT_DATE + 10, 'Victoria Adams', 'victoria.a@email.co.uk', '+44-7700-0130', 'UK', 28000, 22000, 'THB', 'cancelled', 'en', 'vt-030', 'Weather concerns', CURRENT_TIMESTAMP - INTERVAL '8 days');

INSERT INTO booking_items (booking_id, item_type, item_id, item_name, quantity, retail_price_snapshot, net_price_snapshot, subtotal_retail, subtotal_net, metadata) VALUES
  ('b0000030-0001-0001-0001-000000000001', 'tour', '55555555-6666-7777-8888-999999999999', 'Yacht Half Day Charter', 1, 28000, 22000, 28000, 22000, '{"seat_type": "Half Day", "qty": 1}');

