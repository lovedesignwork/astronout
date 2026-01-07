import { NextRequest, NextResponse } from 'next/server';
import { getStaticPage } from '@/lib/data/static-pages';
import { Language, DEFAULT_LANGUAGE } from '@/types';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET - Fetch a single static page (public endpoint)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    
    // Get language from query param or default to English
    const searchParams = request.nextUrl.searchParams;
    const language = (searchParams.get('lang') || DEFAULT_LANGUAGE) as Language;

    const page = await getStaticPage(slug, language);

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error('Error fetching static page:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}




