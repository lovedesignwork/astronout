import { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import { SUPPORTED_LANGUAGES } from '@/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://astronout.co';
  const sitemap: MetadataRoute.Sitemap = [];

  // Static pages for each language
  const staticPages = ['', '/tours', '/about', '/contact'];
  
  for (const lang of SUPPORTED_LANGUAGES) {
    for (const page of staticPages) {
      sitemap.push({
        url: `${baseUrl}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1 : 0.8,
      });
    }
  }

  // Dynamic tour pages
  try {
    const supabase = await createAdminClient();
    const { data: tours } = await supabase
      .from('tours')
      .select('slug, updated_at')
      .eq('status', 'published');

    if (tours) {
      for (const tour of tours) {
        for (const lang of SUPPORTED_LANGUAGES) {
          sitemap.push({
            url: `${baseUrl}/${lang}/tours/${tour.slug}`,
            lastModified: new Date(tour.updated_at),
            changeFrequency: 'weekly',
            priority: 0.9,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return sitemap;
}




