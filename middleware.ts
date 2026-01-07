import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const SUPPORTED_LANGUAGES = ['en', 'zh', 'ru', 'ko', 'ja', 'fr', 'it', 'es', 'id'];
const DEFAULT_LANGUAGE = 'en';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files, api routes (except admin check), and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Handle admin routes - check authentication
  if (pathname.startsWith('/admin')) {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Create Supabase client for auth check
    const response = NextResponse.next();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options) {
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (!adminUser) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  // Check if pathname already has language prefix
  const pathnameHasLang = SUPPORTED_LANGUAGES.some(
    (lang) => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`
  );

  if (pathnameHasLang) {
    return NextResponse.next();
  }

  // Detect language
  let detectedLang = DEFAULT_LANGUAGE;

  // 1. Check cookie first
  const langCookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (langCookie && SUPPORTED_LANGUAGES.includes(langCookie)) {
    detectedLang = langCookie;
  } else {
    // 2. Check Accept-Language header
    const acceptLang = request.headers.get('accept-language');
    if (acceptLang) {
      const browserLang = acceptLang.split(',')[0].split('-')[0].toLowerCase();
      if (SUPPORTED_LANGUAGES.includes(browserLang)) {
        detectedLang = browserLang;
      }
    }
  }

  // Redirect to language-prefixed URL
  const newUrl = new URL(`/${detectedLang}${pathname || '/'}`, request.url);
  newUrl.search = request.nextUrl.search;
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};




