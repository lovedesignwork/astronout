import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPPORTED_LANGUAGES = ['en', 'zh', 'ru', 'ko', 'ja', 'fr', 'it', 'es', 'id'];
const DEFAULT_LANGUAGE = 'en';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if pathname already has language prefix
  const pathnameHasLang = SUPPORTED_LANGUAGES.some(
    (lang) => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`
  );

  if (pathnameHasLang) {
    return NextResponse.next();
  }

  // Redirect root to /en
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};




