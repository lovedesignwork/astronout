-- =====================================================
-- VISITOR ANALYTICS TABLES
-- =====================================================

-- Page visits table - stores each page view
CREATE TABLE page_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path TEXT NOT NULL,
  visitor_ip_hash TEXT, -- Hashed for privacy
  country_code TEXT,
  country_name TEXT,
  city TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  browser TEXT,
  operating_system TEXT,
  referrer TEXT,
  referrer_domain TEXT,
  session_id TEXT NOT NULL,
  user_agent TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  language TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_page_visits_created_at ON page_visits(created_at DESC);
CREATE INDEX idx_page_visits_page_path ON page_visits(page_path);
CREATE INDEX idx_page_visits_country_code ON page_visits(country_code);
CREATE INDEX idx_page_visits_session_id ON page_visits(session_id);
CREATE INDEX idx_page_visits_device_type ON page_visits(device_type);
CREATE INDEX idx_page_visits_referrer_domain ON page_visits(referrer_domain);

-- For date-based queries, we use created_at directly (range queries work well with the timestamp index)

-- Active sessions table - for real-time visitor count
CREATE TABLE active_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  page_path TEXT NOT NULL,
  country_code TEXT,
  country_name TEXT,
  device_type TEXT,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cleanup queries
CREATE INDEX idx_active_sessions_last_seen ON active_sessions(last_seen);
CREATE INDEX idx_active_sessions_session_id ON active_sessions(session_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

-- Public can insert page visits (for tracking)
CREATE POLICY "Public can insert page visits"
  ON page_visits FOR INSERT
  WITH CHECK (true);

-- Admins can read all visits
CREATE POLICY "Admins can read page visits"
  ON page_visits FOR SELECT
  USING (is_admin());

-- Admins can delete visits (for cleanup/GDPR)
CREATE POLICY "Admins can delete page visits"
  ON page_visits FOR DELETE
  USING (is_admin());

-- Public can insert/update active sessions (for heartbeat)
CREATE POLICY "Public can insert active sessions"
  ON active_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update active sessions"
  ON active_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Public can delete their own session
CREATE POLICY "Public can delete active sessions"
  ON active_sessions FOR DELETE
  USING (true);

-- Admins can read active sessions
CREATE POLICY "Admins can read active sessions"
  ON active_sessions FOR SELECT
  USING (is_admin());

-- =====================================================
-- CLEANUP FUNCTION - Remove stale sessions (older than 2 minutes)
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_stale_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM active_sessions
  WHERE last_seen < NOW() - INTERVAL '2 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ANALYTICS HELPER FUNCTIONS
-- =====================================================

-- Get visitor count for a date range
CREATE OR REPLACE FUNCTION get_visitor_stats(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  total_visits BIGINT,
  unique_sessions BIGINT,
  unique_countries BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_visits,
    COUNT(DISTINCT session_id)::BIGINT as unique_sessions,
    COUNT(DISTINCT country_code)::BIGINT as unique_countries
  FROM page_visits
  WHERE DATE(created_at) BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get daily visitor counts
CREATE OR REPLACE FUNCTION get_daily_visitors(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  visit_date DATE,
  total_visits BIGINT,
  unique_sessions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at) as visit_date,
    COUNT(*)::BIGINT as total_visits,
    COUNT(DISTINCT session_id)::BIGINT as unique_sessions
  FROM page_visits
  WHERE DATE(created_at) BETWEEN start_date AND end_date
  GROUP BY DATE(created_at)
  ORDER BY visit_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get visitors by country
CREATE OR REPLACE FUNCTION get_visitors_by_country(
  start_date DATE,
  end_date DATE,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  country_code TEXT,
  country_name TEXT,
  visit_count BIGINT,
  unique_visitors BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pv.country_code,
    pv.country_name,
    COUNT(*)::BIGINT as visit_count,
    COUNT(DISTINCT pv.session_id)::BIGINT as unique_visitors
  FROM page_visits pv
  WHERE DATE(pv.created_at) BETWEEN start_date AND end_date
    AND pv.country_code IS NOT NULL
  GROUP BY pv.country_code, pv.country_name
  ORDER BY visit_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get top pages
CREATE OR REPLACE FUNCTION get_top_pages(
  start_date DATE,
  end_date DATE,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  page_path TEXT,
  visit_count BIGINT,
  unique_visitors BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pv.page_path,
    COUNT(*)::BIGINT as visit_count,
    COUNT(DISTINCT pv.session_id)::BIGINT as unique_visitors
  FROM page_visits pv
  WHERE DATE(pv.created_at) BETWEEN start_date AND end_date
  GROUP BY pv.page_path
  ORDER BY visit_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get device breakdown
CREATE OR REPLACE FUNCTION get_device_breakdown(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  device_type TEXT,
  visit_count BIGINT,
  percentage NUMERIC
) AS $$
DECLARE
  total BIGINT;
BEGIN
  SELECT COUNT(*) INTO total
  FROM page_visits
  WHERE DATE(created_at) BETWEEN start_date AND end_date;

  RETURN QUERY
  SELECT
    COALESCE(pv.device_type, 'unknown') as device_type,
    COUNT(*)::BIGINT as visit_count,
    ROUND((COUNT(*)::NUMERIC / NULLIF(total, 0)) * 100, 1) as percentage
  FROM page_visits pv
  WHERE DATE(pv.created_at) BETWEEN start_date AND end_date
  GROUP BY pv.device_type
  ORDER BY visit_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get browser breakdown
CREATE OR REPLACE FUNCTION get_browser_breakdown(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  browser TEXT,
  visit_count BIGINT,
  percentage NUMERIC
) AS $$
DECLARE
  total BIGINT;
BEGIN
  SELECT COUNT(*) INTO total
  FROM page_visits
  WHERE DATE(created_at) BETWEEN start_date AND end_date;

  RETURN QUERY
  SELECT
    COALESCE(pv.browser, 'Unknown') as browser,
    COUNT(*)::BIGINT as visit_count,
    ROUND((COUNT(*)::NUMERIC / NULLIF(total, 0)) * 100, 1) as percentage
  FROM page_visits pv
  WHERE DATE(pv.created_at) BETWEEN start_date AND end_date
  GROUP BY pv.browser
  ORDER BY visit_count DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get traffic sources
CREATE OR REPLACE FUNCTION get_traffic_sources(
  start_date DATE,
  end_date DATE,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  source TEXT,
  visit_count BIGINT,
  percentage NUMERIC
) AS $$
DECLARE
  total BIGINT;
BEGIN
  SELECT COUNT(*) INTO total
  FROM page_visits
  WHERE DATE(created_at) BETWEEN start_date AND end_date;

  RETURN QUERY
  SELECT
    CASE 
      WHEN pv.referrer_domain IS NULL OR pv.referrer_domain = '' THEN 'Direct'
      ELSE pv.referrer_domain
    END as source,
    COUNT(*)::BIGINT as visit_count,
    ROUND((COUNT(*)::NUMERIC / NULLIF(total, 0)) * 100, 1) as percentage
  FROM page_visits pv
  WHERE DATE(pv.created_at) BETWEEN start_date AND end_date
  GROUP BY 
    CASE 
      WHEN pv.referrer_domain IS NULL OR pv.referrer_domain = '' THEN 'Direct'
      ELSE pv.referrer_domain
    END
  ORDER BY visit_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get hourly distribution (peak hours)
CREATE OR REPLACE FUNCTION get_hourly_distribution(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  hour_of_day INTEGER,
  visit_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXTRACT(HOUR FROM created_at)::INTEGER as hour_of_day,
    COUNT(*)::BIGINT as visit_count
  FROM page_visits
  WHERE DATE(created_at) BETWEEN start_date AND end_date
  GROUP BY EXTRACT(HOUR FROM created_at)
  ORDER BY hour_of_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get active visitor count
CREATE OR REPLACE FUNCTION get_active_visitors()
RETURNS BIGINT AS $$
BEGIN
  -- First cleanup stale sessions
  PERFORM cleanup_stale_sessions();
  
  RETURN (SELECT COUNT(*) FROM active_sessions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

