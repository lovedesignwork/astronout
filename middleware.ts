import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPPORTED_LANGUAGES = ['en', 'zh', 'ru', 'ko', 'ja', 'fr', 'it', 'es', 'id'];
const DEFAULT_LANGUAGE = 'en';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files, api routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/admin')
  ) {
    return NextResponse.next();
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
     * - api routes
     * - admin routes (auth handled in page)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api|admin).*)',
  ],
};




