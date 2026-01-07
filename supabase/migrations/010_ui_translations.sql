-- =====================================================
-- UI TRANSLATIONS TABLE
-- Stores all UI text translations for the frontend
-- =====================================================

CREATE TABLE ui_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  translation_key TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('booking', 'navigation', 'forms', 'general', 'errors')),
  en TEXT NOT NULL,
  zh TEXT,
  ru TEXT,
  ko TEXT,
  ja TEXT,
  fr TEXT,
  it TEXT,
  es TEXT,
  "id" TEXT, -- Indonesian (quoted because 'id' is reserved)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(translation_key)
);

CREATE INDEX idx_ui_translations_key ON ui_translations(translation_key);
CREATE INDEX idx_ui_translations_category ON ui_translations(category);

-- Enable RLS
ALTER TABLE ui_translations ENABLE ROW LEVEL SECURITY;

-- Public can read all translations
CREATE POLICY "Public can read ui_translations"
  ON ui_translations FOR SELECT
  USING (true);

-- Admins have full access
CREATE POLICY "Admins have full access to ui_translations"
  ON ui_translations FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_ui_translations_updated_at 
  BEFORE UPDATE ON ui_translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA - All existing UI translations
-- =====================================================

INSERT INTO ui_translations (translation_key, category, en, zh, ru, ko, ja, fr, it, es, "id") VALUES
  -- Booking category
  ('book_now', 'booking', 'Book Now', '立即预订', 'Забронировать', '지금 예약', '今すぐ予約', 'Réserver', 'Prenota ora', 'Reservar ahora', 'Pesan Sekarang'),
  ('select_date', 'booking', 'Select Date', '选择日期', 'Выберите дату', '날짜 선택', '日付を選択', 'Choisir la date', 'Seleziona data', 'Seleccionar fecha', 'Pilih Tanggal'),
  ('select_time', 'booking', 'Select Time', '选择时间', 'Выберите время', '시간 선택', '時間を選択', 'Choisir l''heure', 'Seleziona ora', 'Seleccionar hora', 'Pilih Waktu'),
  ('adults', 'booking', 'Adults', '成人', 'Взрослые', '성인', '大人', 'Adultes', 'Adulti', 'Adultos', 'Dewasa'),
  ('children', 'booking', 'Children', '儿童', 'Дети', '어린이', '子供', 'Enfants', 'Bambini', 'Niños', 'Anak-anak'),
  ('total', 'booking', 'Total', '总计', 'Итого', '총액', '合計', 'Total', 'Totale', 'Total', 'Total'),
  ('add_to_cart', 'booking', 'Add to Cart', '添加到购物车', 'В корзину', '장바구니에 추가', 'カートに追加', 'Ajouter au panier', 'Aggiungi al carrello', 'Añadir al carrito', 'Tambah ke Keranjang'),
  ('checkout', 'booking', 'Checkout', '结账', 'Оформить', '결제', 'チェックアウト', 'Paiement', 'Checkout', 'Pagar', 'Checkout'),
  ('your_booking', 'booking', 'Your Booking', '您的预订', 'Ваше бронирование', '예약 내용', 'ご予約内容', 'Votre réservation', 'La tua prenotazione', 'Tu reserva', 'Pesanan Anda'),
  ('confirm_booking', 'booking', 'Confirm Booking', '确认预订', 'Подтвердить', '예약 확인', '予約を確定', 'Confirmer', 'Conferma', 'Confirmar', 'Konfirmasi'),
  ('booking_confirmed', 'booking', 'Booking Confirmed', '预订已确认', 'Бронирование подтверждено', '예약 확정', '予約確定', 'Réservation confirmée', 'Prenotazione confermata', 'Reserva confirmada', 'Pesanan Dikonfirmasi'),
  ('booking_reference', 'booking', 'Booking Reference', '预订参考号', 'Номер бронирования', '예약 번호', '予約番号', 'Référence', 'Riferimento', 'Referencia', 'Nomor Referensi'),
  ('download_voucher', 'booking', 'Download Voucher', '下载凭证', 'Скачать ваучер', '바우처 다운로드', 'バウチャーをダウンロード', 'Télécharger le voucher', 'Scarica voucher', 'Descargar voucher', 'Unduh Voucher'),
  ('per_person', 'booking', 'per person', '每人', 'с человека', '1인당', '1人あたり', 'par personne', 'a persona', 'por persona', 'per orang'),
  ('per_booking', 'booking', 'per booking', '每次预订', 'за бронирование', '예약당', '予約あたり', 'par réservation', 'a prenotazione', 'por reserva', 'per pemesanan'),
  ('select_seats', 'booking', 'Select Seats', '选择座位', 'Выбрать места', '좌석 선택', '座席を選択', 'Choisir les places', 'Seleziona posti', 'Seleccionar asientos', 'Pilih Kursi'),
  ('vip', 'booking', 'VIP', 'VIP', 'VIP', 'VIP', 'VIP', 'VIP', 'VIP', 'VIP', 'VIP'),
  ('standard', 'booking', 'Standard', '标准', 'Стандарт', '일반', 'スタンダード', 'Standard', 'Standard', 'Estándar', 'Standar'),
  ('available', 'booking', 'Available', '可用', 'Доступно', '예약 가능', '予約可能', 'Disponible', 'Disponibile', 'Disponible', 'Tersedia'),
  ('sold_out', 'booking', 'Sold Out', '售罄', 'Распродано', '매진', '完売', 'Complet', 'Esaurito', 'Agotado', 'Habis'),
  
  -- Forms category
  ('customer_details', 'forms', 'Customer Details', '客户信息', 'Данные клиента', '고객 정보', 'お客様情報', 'Coordonnées', 'Dati cliente', 'Datos del cliente', 'Data Pelanggan'),
  ('name', 'forms', 'Name', '姓名', 'Имя', '이름', '名前', 'Nom', 'Nome', 'Nombre', 'Nama'),
  ('email', 'forms', 'Email', '邮箱', 'Email', '이메일', 'メール', 'Email', 'Email', 'Email', 'Email'),
  ('phone', 'forms', 'Phone', '电话', 'Телефон', '전화번호', '電話番号', 'Téléphone', 'Telefono', 'Teléfono', 'Telepon'),
  ('nationality', 'forms', 'Nationality', '国籍', 'Гражданство', '국적', '国籍', 'Nationalité', 'Nazionalità', 'Nacionalidad', 'Kewarganegaraan'),
  ('payment', 'forms', 'Payment', '支付', 'Оплата', '결제', 'お支払い', 'Paiement', 'Pagamento', 'Pago', 'Pembayaran'),
  
  -- Navigation/Content category
  ('included', 'navigation', 'Included', '包含', 'Включено', '포함', '含まれるもの', 'Inclus', 'Incluso', 'Incluido', 'Termasuk'),
  ('not_included', 'navigation', 'Not Included', '不包含', 'Не включено', '불포함', '含まれないもの', 'Non inclus', 'Non incluso', 'No incluido', 'Tidak Termasuk'),
  ('what_to_bring', 'navigation', 'What to Bring', '携带物品', 'Что взять с собой', '준비물', '持ち物', 'À apporter', 'Cosa portare', 'Qué llevar', 'Yang Harus Dibawa'),
  ('safety_info', 'navigation', 'Safety Information', '安全信息', 'Безопасность', '안전 정보', '安全情報', 'Sécurité', 'Sicurezza', 'Seguridad', 'Informasi Keamanan'),
  ('meeting_point', 'navigation', 'Meeting Point', '集合地点', 'Место встречи', '만남 장소', '集合場所', 'Point de rendez-vous', 'Punto d''incontro', 'Punto de encuentro', 'Titik Pertemuan'),
  ('itinerary', 'navigation', 'Itinerary', '行程', 'Маршрут', '일정', '旅程', 'Itinéraire', 'Itinerario', 'Itinerario', 'Rencana Perjalanan'),
  ('reviews', 'navigation', 'Reviews', '评价', 'Отзывы', '리뷰', 'レビュー', 'Avis', 'Recensioni', 'Reseñas', 'Ulasan'),
  ('terms', 'navigation', 'Terms & Conditions', '条款与条件', 'Условия', '이용약관', '利用規約', 'Conditions', 'Termini', 'Términos', 'Syarat & Ketentuan'),
  
  -- General category
  ('loading', 'general', 'Loading...', '加载中...', 'Загрузка...', '로딩 중...', '読み込み中...', 'Chargement...', 'Caricamento...', 'Cargando...', 'Memuat...'),
  ('error', 'errors', 'Error', '错误', 'Ошибка', '오류', 'エラー', 'Erreur', 'Errore', 'Error', 'Error'),
  ('retry', 'general', 'Retry', '重试', 'Повторить', '다시 시도', '再試行', 'Réessayer', 'Riprova', 'Reintentar', 'Coba Lagi');




