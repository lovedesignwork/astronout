import { Language, DEFAULT_LANGUAGE } from '@/types';

/**
 * Resolve translation from an array of translations
 */
export function resolveTranslation<T extends { language: Language }>(
  translations: T[],
  requestedLang: Language,
  fallbackLang: Language = DEFAULT_LANGUAGE
): T | null {
  // Try requested language
  const requested = translations.find((t) => t.language === requestedLang);
  if (requested) return requested;

  // Try fallback language
  const fallback = translations.find((t) => t.language === fallbackLang);
  if (fallback) return fallback;

  // Return first available
  return translations[0] || null;
}

/**
 * Resolve a single field from translation map
 */
export function resolveTranslationField(
  map: { [key in Language]?: string } | null | undefined,
  requestedLang: Language,
  fallbackLang: Language = DEFAULT_LANGUAGE
): string {
  if (!map) return '';
  return map[requestedLang] || map[fallbackLang] || Object.values(map)[0] || '';
}

/**
 * Get all translations for a block, organized by language
 */
export function getTranslationsByLanguage<T extends { language: Language }>(
  translations: T[]
): Map<Language, T> {
  const map = new Map<Language, T>();
  translations.forEach((t) => map.set(t.language, t));
  return map;
}

/**
 * Static UI translations
 */
export const UI_TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    book_now: 'Book Now',
    select_date: 'Select Date',
    select_time: 'Select Time',
    adults: 'Adults',
    children: 'Children',
    total: 'Total',
    add_to_cart: 'Add to Cart',
    checkout: 'Checkout',
    your_booking: 'Your Booking',
    customer_details: 'Customer Details',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    nationality: 'Nationality',
    payment: 'Payment',
    confirm_booking: 'Confirm Booking',
    booking_confirmed: 'Booking Confirmed',
    booking_reference: 'Booking Reference',
    download_voucher: 'Download Voucher',
    included: 'Included',
    not_included: 'Not Included',
    what_to_bring: 'What to Bring',
    safety_info: 'Safety Information',
    meeting_point: 'Meeting Point',
    itinerary: 'Itinerary',
    reviews: 'Reviews',
    terms: 'Terms & Conditions',
    per_person: 'per person',
    per_booking: 'per booking',
    select_seats: 'Select Seats',
    vip: 'VIP',
    standard: 'Standard',
    available: 'Available',
    sold_out: 'Sold Out',
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
  },
  zh: {
    book_now: '立即预订',
    select_date: '选择日期',
    select_time: '选择时间',
    adults: '成人',
    children: '儿童',
    total: '总计',
    add_to_cart: '添加到购物车',
    checkout: '结账',
    your_booking: '您的预订',
    customer_details: '客户信息',
    name: '姓名',
    email: '邮箱',
    phone: '电话',
    nationality: '国籍',
    payment: '支付',
    confirm_booking: '确认预订',
    booking_confirmed: '预订已确认',
    booking_reference: '预订参考号',
    download_voucher: '下载凭证',
    included: '包含',
    not_included: '不包含',
    what_to_bring: '携带物品',
    safety_info: '安全信息',
    meeting_point: '集合地点',
    itinerary: '行程',
    reviews: '评价',
    terms: '条款与条件',
    per_person: '每人',
    per_booking: '每次预订',
    select_seats: '选择座位',
    vip: 'VIP',
    standard: '标准',
    available: '可用',
    sold_out: '售罄',
    loading: '加载中...',
    error: '错误',
    retry: '重试',
  },
  ru: {
    book_now: 'Забронировать',
    select_date: 'Выберите дату',
    select_time: 'Выберите время',
    adults: 'Взрослые',
    children: 'Дети',
    total: 'Итого',
    add_to_cart: 'В корзину',
    checkout: 'Оформить',
    your_booking: 'Ваше бронирование',
    customer_details: 'Данные клиента',
    name: 'Имя',
    email: 'Email',
    phone: 'Телефон',
    nationality: 'Гражданство',
    payment: 'Оплата',
    confirm_booking: 'Подтвердить',
    booking_confirmed: 'Бронирование подтверждено',
    booking_reference: 'Номер бронирования',
    download_voucher: 'Скачать ваучер',
    included: 'Включено',
    not_included: 'Не включено',
    what_to_bring: 'Что взять с собой',
    safety_info: 'Безопасность',
    meeting_point: 'Место встречи',
    itinerary: 'Маршрут',
    reviews: 'Отзывы',
    terms: 'Условия',
    per_person: 'с человека',
    per_booking: 'за бронирование',
    select_seats: 'Выбрать места',
    vip: 'VIP',
    standard: 'Стандарт',
    available: 'Доступно',
    sold_out: 'Распродано',
    loading: 'Загрузка...',
    error: 'Ошибка',
    retry: 'Повторить',
  },
  ko: {
    book_now: '지금 예약',
    select_date: '날짜 선택',
    select_time: '시간 선택',
    adults: '성인',
    children: '어린이',
    total: '총액',
    add_to_cart: '장바구니에 추가',
    checkout: '결제',
    your_booking: '예약 내용',
    customer_details: '고객 정보',
    name: '이름',
    email: '이메일',
    phone: '전화번호',
    nationality: '국적',
    payment: '결제',
    confirm_booking: '예약 확인',
    booking_confirmed: '예약 확정',
    booking_reference: '예약 번호',
    download_voucher: '바우처 다운로드',
    included: '포함',
    not_included: '불포함',
    what_to_bring: '준비물',
    safety_info: '안전 정보',
    meeting_point: '만남 장소',
    itinerary: '일정',
    reviews: '리뷰',
    terms: '이용약관',
    per_person: '1인당',
    per_booking: '예약당',
    select_seats: '좌석 선택',
    vip: 'VIP',
    standard: '일반',
    available: '예약 가능',
    sold_out: '매진',
    loading: '로딩 중...',
    error: '오류',
    retry: '다시 시도',
  },
  ja: {
    book_now: '今すぐ予約',
    select_date: '日付を選択',
    select_time: '時間を選択',
    adults: '大人',
    children: '子供',
    total: '合計',
    add_to_cart: 'カートに追加',
    checkout: 'チェックアウト',
    your_booking: 'ご予約内容',
    customer_details: 'お客様情報',
    name: '名前',
    email: 'メール',
    phone: '電話番号',
    nationality: '国籍',
    payment: 'お支払い',
    confirm_booking: '予約を確定',
    booking_confirmed: '予約確定',
    booking_reference: '予約番号',
    download_voucher: 'バウチャーをダウンロード',
    included: '含まれるもの',
    not_included: '含まれないもの',
    what_to_bring: '持ち物',
    safety_info: '安全情報',
    meeting_point: '集合場所',
    itinerary: '旅程',
    reviews: 'レビュー',
    terms: '利用規約',
    per_person: '1人あたり',
    per_booking: '予約あたり',
    select_seats: '座席を選択',
    vip: 'VIP',
    standard: 'スタンダード',
    available: '予約可能',
    sold_out: '完売',
    loading: '読み込み中...',
    error: 'エラー',
    retry: '再試行',
  },
  fr: {
    book_now: 'Réserver',
    select_date: 'Choisir la date',
    select_time: 'Choisir l\'heure',
    adults: 'Adultes',
    children: 'Enfants',
    total: 'Total',
    add_to_cart: 'Ajouter au panier',
    checkout: 'Paiement',
    your_booking: 'Votre réservation',
    customer_details: 'Coordonnées',
    name: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    nationality: 'Nationalité',
    payment: 'Paiement',
    confirm_booking: 'Confirmer',
    booking_confirmed: 'Réservation confirmée',
    booking_reference: 'Référence',
    download_voucher: 'Télécharger le voucher',
    included: 'Inclus',
    not_included: 'Non inclus',
    what_to_bring: 'À apporter',
    safety_info: 'Sécurité',
    meeting_point: 'Point de rendez-vous',
    itinerary: 'Itinéraire',
    reviews: 'Avis',
    terms: 'Conditions',
    per_person: 'par personne',
    per_booking: 'par réservation',
    select_seats: 'Choisir les places',
    vip: 'VIP',
    standard: 'Standard',
    available: 'Disponible',
    sold_out: 'Complet',
    loading: 'Chargement...',
    error: 'Erreur',
    retry: 'Réessayer',
  },
  it: {
    book_now: 'Prenota ora',
    select_date: 'Seleziona data',
    select_time: 'Seleziona ora',
    adults: 'Adulti',
    children: 'Bambini',
    total: 'Totale',
    add_to_cart: 'Aggiungi al carrello',
    checkout: 'Checkout',
    your_booking: 'La tua prenotazione',
    customer_details: 'Dati cliente',
    name: 'Nome',
    email: 'Email',
    phone: 'Telefono',
    nationality: 'Nazionalità',
    payment: 'Pagamento',
    confirm_booking: 'Conferma',
    booking_confirmed: 'Prenotazione confermata',
    booking_reference: 'Riferimento',
    download_voucher: 'Scarica voucher',
    included: 'Incluso',
    not_included: 'Non incluso',
    what_to_bring: 'Cosa portare',
    safety_info: 'Sicurezza',
    meeting_point: 'Punto d\'incontro',
    itinerary: 'Itinerario',
    reviews: 'Recensioni',
    terms: 'Termini',
    per_person: 'a persona',
    per_booking: 'a prenotazione',
    select_seats: 'Seleziona posti',
    vip: 'VIP',
    standard: 'Standard',
    available: 'Disponibile',
    sold_out: 'Esaurito',
    loading: 'Caricamento...',
    error: 'Errore',
    retry: 'Riprova',
  },
  es: {
    book_now: 'Reservar ahora',
    select_date: 'Seleccionar fecha',
    select_time: 'Seleccionar hora',
    adults: 'Adultos',
    children: 'Niños',
    total: 'Total',
    add_to_cart: 'Añadir al carrito',
    checkout: 'Pagar',
    your_booking: 'Tu reserva',
    customer_details: 'Datos del cliente',
    name: 'Nombre',
    email: 'Email',
    phone: 'Teléfono',
    nationality: 'Nacionalidad',
    payment: 'Pago',
    confirm_booking: 'Confirmar',
    booking_confirmed: 'Reserva confirmada',
    booking_reference: 'Referencia',
    download_voucher: 'Descargar voucher',
    included: 'Incluido',
    not_included: 'No incluido',
    what_to_bring: 'Qué llevar',
    safety_info: 'Seguridad',
    meeting_point: 'Punto de encuentro',
    itinerary: 'Itinerario',
    reviews: 'Reseñas',
    terms: 'Términos',
    per_person: 'por persona',
    per_booking: 'por reserva',
    select_seats: 'Seleccionar asientos',
    vip: 'VIP',
    standard: 'Estándar',
    available: 'Disponible',
    sold_out: 'Agotado',
    loading: 'Cargando...',
    error: 'Error',
    retry: 'Reintentar',
  },
  id: {
    book_now: 'Pesan Sekarang',
    select_date: 'Pilih Tanggal',
    select_time: 'Pilih Waktu',
    adults: 'Dewasa',
    children: 'Anak-anak',
    total: 'Total',
    add_to_cart: 'Tambah ke Keranjang',
    checkout: 'Checkout',
    your_booking: 'Pesanan Anda',
    customer_details: 'Data Pelanggan',
    name: 'Nama',
    email: 'Email',
    phone: 'Telepon',
    nationality: 'Kewarganegaraan',
    payment: 'Pembayaran',
    confirm_booking: 'Konfirmasi',
    booking_confirmed: 'Pesanan Dikonfirmasi',
    booking_reference: 'Nomor Referensi',
    download_voucher: 'Unduh Voucher',
    included: 'Termasuk',
    not_included: 'Tidak Termasuk',
    what_to_bring: 'Yang Harus Dibawa',
    safety_info: 'Informasi Keamanan',
    meeting_point: 'Titik Pertemuan',
    itinerary: 'Rencana Perjalanan',
    reviews: 'Ulasan',
    terms: 'Syarat & Ketentuan',
    per_person: 'per orang',
    per_booking: 'per pemesanan',
    select_seats: 'Pilih Kursi',
    vip: 'VIP',
    standard: 'Standar',
    available: 'Tersedia',
    sold_out: 'Habis',
    loading: 'Memuat...',
    error: 'Error',
    retry: 'Coba Lagi',
  },
};

/**
 * Synchronous translation function using static fallback translations
 * This is used during SSR and as a fallback when database translations aren't loaded
 */
export function t(key: string, lang: Language): string {
  return UI_TRANSLATIONS[lang]?.[key] || UI_TRANSLATIONS.en[key] || key;
}

/**
 * Get translation with custom translations map (for use with database-loaded translations)
 */
export function tWithMap(
  key: string,
  lang: Language,
  translations: Record<Language, Record<string, string>>
): string {
  return translations[lang]?.[key] || translations.en?.[key] || UI_TRANSLATIONS[lang]?.[key] || UI_TRANSLATIONS.en[key] || key;
}

/**
 * Merge database translations with static fallbacks
 */
export function mergeTranslations(
  dbTranslations: Record<Language, Record<string, string>>
): Record<Language, Record<string, string>> {
  const merged: Record<Language, Record<string, string>> = { ...UI_TRANSLATIONS };
  
  (Object.keys(dbTranslations) as Language[]).forEach(lang => {
    merged[lang] = {
      ...UI_TRANSLATIONS[lang],
      ...dbTranslations[lang],
    };
  });
  
  return merged;
}


