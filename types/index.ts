// Language types
export type Language = 'en' | 'zh' | 'ru' | 'ko' | 'ja' | 'fr' | 'it' | 'es' | 'id';

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'zh', 'ru', 'ko', 'ja', 'fr', 'it', 'es', 'id'];

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  zh: '中文',
  ru: 'Русский',
  ko: '한국어',
  ja: '日本語',
  fr: 'Français',
  it: 'Italiano',
  es: 'Español',
  id: 'Bahasa Indonesia',
};

export const DEFAULT_LANGUAGE: Language = 'en';

// Pricing engine types
export type PricingEngine = 'flat_per_person' | 'adult_child' | 'seat_based';

export type TranslationMap = {
  [key in Language]?: string;
};

// Tour types
export interface Tour {
  id: string;
  tour_number: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  pricing_engine: PricingEngine;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// =====================================================
// TOUR CATEGORIES TYPES
// =====================================================

export interface TourCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

// =====================================================
// SPECIAL LABELS TYPES (corner badges)
// =====================================================

export interface SpecialLabel {
  id: string;
  name: string;
  slug: string;
  background_color: string;
  text_color: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface TourWithDetails extends Tour {
  blocks: TourBlockWithTranslation[];
  pricing: TourPricing | null;
  upsells: UpsellWithTranslation[];
  categories?: TourCategory[];
  specialLabels?: SpecialLabel[];
}

// Block types
export type BlockType =
  | 'hero'
  | 'highlights'
  | 'pricing_selector'
  | 'availability_selector'
  | 'itinerary'
  | 'included_excluded'
  | 'what_to_bring'
  | 'safety_info'
  | 'map'
  | 'reviews'
  | 'upsells'
  | 'terms';

export interface TourBlock {
  id: string;
  tour_id: string;
  block_type: BlockType;
  order: number;
  enabled: boolean;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TourBlockTranslation {
  id: string;
  block_id: string;
  language: Language;
  title: string | null;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TourBlockWithTranslation extends TourBlock {
  title: string;
  content: Record<string, unknown>;
  translations?: TourBlockTranslation[];
}

// Pricing types
export interface TourPricing {
  id: string;
  tour_id: string;
  config: PricingConfig;
  created_at: string;
  updated_at: string;
}

export type PricingConfig =
  | FlatPerPersonPricing
  | AdultChildPricing
  | SeatBasedPricing;

export interface FlatPerPersonPricing {
  type: 'flat_per_person';
  retail_price: number;
  net_price: number;
  currency: string;
  min_pax?: number;
  max_pax?: number;
}

export interface AdultChildPricing {
  type: 'adult_child';
  adult_retail_price: number;
  adult_net_price: number;
  child_retail_price: number;
  child_net_price: number;
  currency: string;
  child_age_max?: number;
  min_pax?: number;
  max_pax?: number;
}

export interface SeatBasedPricing {
  type: 'seat_based';
  seats: SeatType[];
  currency: string;
}

export interface SeatType {
  seat_type: string;
  retail_price: number;
  net_price: number;
  capacity?: number;
}

// Availability types
export interface TourAvailability {
  id: string;
  tour_id: string;
  date: string;
  time_slot: string | null;
  capacity: number;
  booked: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Upsell types
export type UpsellPricingType = 'per_person' | 'per_booking' | 'flat';

export interface Upsell {
  id: string;
  tour_id: string;
  status: 'active' | 'inactive';
  pricing_type: UpsellPricingType;
  retail_price: number;
  net_price: number;
  currency: string;
  max_quantity?: number;
  created_at: string;
  updated_at: string;
}

export interface UpsellTranslation {
  id: string;
  upsell_id: string;
  language: Language;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpsellWithTranslation extends Upsell {
  title: string;
  description: string | null;
  translations?: UpsellTranslation[];
}

// Booking types
export type BookingStatus = 'pending' | 'pending_payment' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  reference: string;
  tour_id: string;
  availability_id: string | null;
  booking_date: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_nationality: string | null;
  total_retail: number;
  total_net: number;
  currency: string;
  status: BookingStatus;
  language: Language;
  voucher_token: string;
  notes: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingItem {
  id: string;
  booking_id: string;
  item_type: 'tour' | 'upsell';
  item_id: string;
  item_name: string;
  quantity: number;
  retail_price_snapshot: number;
  net_price_snapshot: number;
  subtotal_retail: number;
  subtotal_net: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface BookingWithItems extends Booking {
  items: BookingItem[];
  tour?: Tour;
}

// Admin types
export type AdminRole = 'admin' | 'operator';

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  created_at: string;
  updated_at: string;
}

// SEO types
export type SEOEntityType = 'tour' | 'page' | 'category';

export interface SEOEntity {
  id: string;
  entity_type: SEOEntityType;
  entity_id: string | null;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface SEOTranslation {
  id: string;
  seo_entity_id: string;
  language: Language;
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  canonical_url_override: string | null;
  noindex: boolean;
  nofollow: boolean;
  structured_data_override_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Redirect {
  id: string;
  from_path: string;
  to_path: string;
  status_code: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Selection payload (normalized output from pricing engines)
export interface PriceBreakdownItem {
  type?: 'adult' | 'child' | 'infant' | 'seat' | 'package';
  label: string;
  quantity: number;
  unit_price?: number;
  amount: number;
  unitRetailPrice?: number;
  unitNetPrice?: number;
  totalRetail?: number;
  totalNet?: number;
}

export interface TourSelection {
  tourId?: string;
  tourSlug?: string;
  tourName?: string;
  date?: string;
  time?: string;
  pax?: {
    adult?: number;
    child?: number;
    total: number;
  };
  seat?: {
    type: string;
    qty: number;
  };
  priceBreakdown?: PriceBreakdownItem[];
  breakdown?: PriceBreakdownItem[];
  totalRetail?: number;
  totalNet?: number;
  currency?: string;
}

export interface UpsellSelection {
  upsellId: string;
  title: string;
  pricingType: UpsellPricingType;
  quantity: number;
  unitRetailPrice: number;
  unitNetPrice: number;
  totalRetail: number;
  totalNet: number;
}

export interface BookingSelection {
  tour: TourSelection;
  upsells: UpsellSelection[];
  grandTotalRetail: number;
  grandTotalNet: number;
  currency: string;
}

// Create booking payload
export interface CreateBookingPayload {
  tourId: string;
  availabilityId?: string;
  bookingDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerNationality?: string;
  language: Language;
  selection: BookingSelection;
  notes?: string;
}

// =====================================================
// TOUR PACKAGES TYPES
// =====================================================

export type PackagePricingType = 'per_person' | 'adult_child' | 'per_seat' | 'per_ticket';

export interface PackagePricingConfig {
  // Per Person pricing
  retail_price?: number;
  net_price?: number;
  // Adult & Child pricing
  adult_retail_price?: number;
  adult_net_price?: number;
  child_retail_price?: number;
  child_net_price?: number;
  child_age_max?: number;
  // Per Seat pricing
  seats?: {
    seat_type: string;
    retail_price: number;
    net_price: number;
    capacity?: number;
  }[];
  // Common
  currency?: string;
  min_pax?: number;
  max_pax?: number;
}

export interface CalendarConfig {
  weekend_only?: boolean;
  allowed_days?: number[]; // 0=Sunday, 1=Monday, etc.
  blocked_dates?: string[]; // ISO date strings
  time_slots?: string[];
}

export interface PackageUpsell {
  id: string;
  package_id: string;
  title: string;
  description: string | null;
  pricing_type: 'per_booking' | 'per_person';
  price: number;
  order: number;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TourPackage {
  id: string;
  tour_id: string;
  title: string;
  description: string | null;
  pricing_type: PackagePricingType;
  pricing_config: PackagePricingConfig;
  included_items: string[];
  calendar_enabled: boolean;
  calendar_config: CalendarConfig;
  pickup_enabled: boolean;
  order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  upsells?: PackageUpsell[];
}

// =====================================================
// MEDIA TYPES
// =====================================================

export type MediaType = 'image' | 'video';

export interface MainMedia {
  id: string;
  type: MediaType;
  url: string;
  thumbnail_url?: string;
  video_embed_code?: string;
  order: number;
}

export interface GoogleReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  avatar_url?: string;
}

// =====================================================
// EXTENDED TOUR TYPE WITH ALL SETTINGS
// =====================================================

export interface TourSettings {
  // Images section
  hero_background_image: string | null;
  featured_images: string[];
  main_media: MainMedia[];
  additional_photos: string[];
  
  // Video section
  video_embed_code: string | null;
  video_section_title: string;
  
  // Google Reviews section
  google_reviews: GoogleReview[];
  google_rating: number | null;
  google_review_count: number | null;
  
  // Itinerary section
  itinerary_title: string;
  itinerary_images: string[];
  
  // Section toggles
  description_enabled: boolean;
  images_enabled: boolean;
  packages_enabled: boolean;
  itinerary_enabled: boolean;
  video_enabled: boolean;
  google_reviews_enabled: boolean;
  safety_info_enabled: boolean;
  need_help_enabled: boolean;
}

export interface TourWithSettings extends Tour, TourSettings {
  packages?: TourPackage[];
}

export interface TourWithAllDetails extends TourWithSettings {
  blocks: TourBlockWithTranslation[];
  pricing: TourPricing | null;
  upsells: UpsellWithTranslation[];
  availability: TourAvailability[];
  packages: TourPackage[];
  categories?: TourCategory[];
  specialLabels?: SpecialLabel[];
}

// =====================================================
// STATIC PAGES TYPES
// =====================================================

export type StaticPageType = 'content' | 'form' | 'accordion' | 'listing';
export type StaticPageStatus = 'draft' | 'published';

export interface StaticPage {
  id: string;
  slug: string;
  status: StaticPageStatus;
  page_type: StaticPageType;
  icon: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface StaticPageTranslation {
  id: string;
  page_id: string;
  language: Language;
  title: string;
  content: Record<string, unknown>;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaticPageWithTranslation extends StaticPage {
  title: string;
  content: Record<string, unknown>;
  meta_title: string | null;
  meta_description: string | null;
  translations?: StaticPageTranslation[];
}

// =====================================================
// STRIPE PAYMENT TYPES
// =====================================================

export type StripeMode = 'test' | 'live';

export interface StripePaymentMethods {
  card: boolean;
  google_pay: boolean;
  apple_pay: boolean;
  promptpay: boolean;
}

export interface StripeSettings {
  mode: StripeMode;
  test_publishable_key: string;
  test_secret_key: string;
  live_publishable_key: string;
  live_secret_key: string;
  webhook_secret: string;
  payment_methods: StripePaymentMethods;
}

export interface CreatePaymentIntentPayload {
  bookingId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  tourName: string;
  bookingReference: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  publishableKey: string;
  paymentMethods: StripePaymentMethods;
}

