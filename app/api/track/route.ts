import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Use service role for tracking (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface GeoData {
  country: string;
  countryCode: string;
  city: string;
}

interface TrackingPayload {
  pagePath: string;
  sessionId: string;
  referrer?: string;
  screenWidth?: number;
  screenHeight?: number;
  language?: string;
  userAgent?: string;
  type: 'pageview' | 'heartbeat';
}

// Parse user agent to extract device type, browser, and OS
function parseUserAgent(ua: string): { deviceType: string; browser: string; os: string } {
  const uaLower = ua.toLowerCase();
  
  // Device type detection
  let deviceType = 'desktop';
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
    deviceType = 'mobile';
  } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = 'tablet';
  }
  
  // Browser detection
  let browser = 'Unknown';
  if (uaLower.includes('edg/')) browser = 'Edge';
  else if (uaLower.includes('chrome') && !uaLower.includes('edg')) browser = 'Chrome';
  else if (uaLower.includes('safari') && !uaLower.includes('chrome')) browser = 'Safari';
  else if (uaLower.includes('firefox')) browser = 'Firefox';
  else if (uaLower.includes('opera') || uaLower.includes('opr')) browser = 'Opera';
  else if (uaLower.includes('msie') || uaLower.includes('trident')) browser = 'IE';
  
  // OS detection
  let os = 'Unknown';
  if (uaLower.includes('windows')) os = 'Windows';
  else if (uaLower.includes('mac os') || uaLower.includes('macos')) os = 'macOS';
  else if (uaLower.includes('linux') && !uaLower.includes('android')) os = 'Linux';
  else if (uaLower.includes('android')) os = 'Android';
  else if (uaLower.includes('iphone') || uaLower.includes('ipad')) os = 'iOS';
  
  return { deviceType, browser, os };
}

// Extract domain from referrer URL
function extractDomain(referrer: string | undefined): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    // Skip if referrer is same domain
    if (url.hostname === process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '')) {
      return null;
    }
    return url.hostname;
  } catch {
    return null;
  }
}

// Hash IP address for privacy
function hashIP(ip: string): string {
  // Remove last octet for additional privacy before hashing
  const parts = ip.split('.');
  if (parts.length === 4) {
    parts[3] = '0';
  }
  const anonymizedIP = parts.join('.');
  return crypto.createHash('sha256').update(anonymizedIP).digest('hex').substring(0, 16);
}

// Get country from IP using free ip-api.com service
async function getGeoFromIP(ip: string): Promise<GeoData | null> {
  // Skip geolocation for local/private IPs
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return { country: 'Local', countryCode: 'XX', city: 'Local' };
  }
  
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city`, {
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.status === 'success') {
      return {
        country: data.country || 'Unknown',
        countryCode: data.countryCode || 'XX',
        city: data.city || 'Unknown',
      };
    }
    return null;
  } catch {
    // Silently fail - don't block tracking if geolocation fails
    return null;
  }
}

// Get client IP from request
function getClientIP(request: NextRequest): string {
  // Try various headers in order of preference
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return '127.0.0.1';
}

export async function POST(request: NextRequest) {
  try {
    const body: TrackingPayload = await request.json();
    const { pagePath, sessionId, referrer, screenWidth, screenHeight, language, userAgent, type } = body;
    
    if (!pagePath || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);
    const ua = userAgent || request.headers.get('user-agent') || '';
    const { deviceType, browser, os } = parseUserAgent(ua);
    const referrerDomain = extractDomain(referrer);
    
    // Get geolocation data - don't await, fire and forget for speed
    // For local development, just use local data immediately
    const isLocalIP = clientIP === '127.0.0.1' || clientIP === '::1' || 
                      clientIP.startsWith('192.168.') || clientIP.startsWith('10.') || 
                      clientIP.startsWith('172.');
    const geoData: GeoData | null = isLocalIP 
      ? { country: 'Local', countryCode: 'XX', city: 'Local' }
      : null; // Skip external API call for now to improve speed
    
    if (type === 'heartbeat') {
      // Update or insert active session
      const { error } = await supabase
        .from('active_sessions')
        .upsert({
          session_id: sessionId,
          page_path: pagePath,
          country_code: geoData?.countryCode,
          country_name: geoData?.country,
          device_type: deviceType,
          last_seen: new Date().toISOString(),
        }, {
          onConflict: 'session_id',
        });
      
      // Silently ignore table not found errors
      if (error && error.code !== 'PGRST205' && error.code !== '42P01') {
        console.error('Error updating active session:', error);
      }
      
      return NextResponse.json({ success: true, type: 'heartbeat' });
    }
    
    // Record page visit
    const { error } = await supabase
      .from('page_visits')
      .insert({
        page_path: pagePath,
        visitor_ip_hash: ipHash,
        country_code: geoData?.countryCode,
        country_name: geoData?.country,
        city: geoData?.city,
        device_type: deviceType,
        browser,
        operating_system: os,
        referrer: referrer || null,
        referrer_domain: referrerDomain,
        session_id: sessionId,
        user_agent: ua.substring(0, 500), // Limit UA length
        screen_width: screenWidth,
        screen_height: screenHeight,
        language: language?.substring(0, 10),
      });
    
    // Silently ignore table not found errors
    if (error && error.code !== 'PGRST205' && error.code !== '42P01') {
      console.error('Error recording page visit:', error);
      return NextResponse.json({ error: 'Failed to record visit' }, { status: 500 });
    }
    
    // Also update active session on pageview - fire and forget
    (async () => {
      try {
        await supabase
          .from('active_sessions')
          .upsert({
            session_id: sessionId,
            page_path: pagePath,
            country_code: geoData?.countryCode,
            country_name: geoData?.country,
            device_type: deviceType,
            last_seen: new Date().toISOString(),
          }, {
            onConflict: 'session_id',
          });
      } catch {
        // Ignore errors silently
      }
    })();
    
    return NextResponse.json({ success: true, type: 'pageview' });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

