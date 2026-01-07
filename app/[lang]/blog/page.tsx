import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Language } from '@/types';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Travel Blog | Tour Booking',
    description: 'Discover travel tips, destination guides, and inspiring adventure stories.',
  };
}

// Sample blog posts (in production, these would come from the database)
const blogPosts = [
  {
    id: 1,
    slug: 'top-10-things-to-do-in-phuket',
    title: 'Top 10 Things to Do in Phuket',
    excerpt: 'Discover the best attractions, beaches, and hidden gems in Thailand\'s most popular island destination.',
    image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&h=500&fit=crop',
    date: '2026-01-01',
    category: 'Destination Guides',
    readTime: '8 min read',
  },
  {
    id: 2,
    slug: 'essential-packing-tips',
    title: 'Essential Packing Tips for Tropical Adventures',
    excerpt: 'Learn what to pack for your next tropical getaway with our comprehensive packing guide.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=500&fit=crop',
    date: '2025-12-15',
    category: 'Travel Tips',
    readTime: '5 min read',
  },
  {
    id: 3,
    slug: 'thai-street-food-guide',
    title: 'A Culinary Journey Through Thai Street Food',
    excerpt: 'Explore the vibrant world of Thai street food and discover must-try dishes on your visit.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop',
    date: '2025-12-01',
    category: 'Culture & Food',
    readTime: '6 min read',
  },
  {
    id: 4,
    slug: 'island-hopping-guide',
    title: 'Ultimate Island Hopping Guide: Thailand Edition',
    excerpt: 'Plan the perfect island hopping adventure with our complete guide to Thailand\'s best islands.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop',
    date: '2025-11-20',
    category: 'Adventure Stories',
    readTime: '10 min read',
  },
  {
    id: 5,
    slug: 'sustainable-travel-tips',
    title: 'How to Travel Sustainably in Southeast Asia',
    excerpt: 'Tips and practices for reducing your environmental impact while exploring Southeast Asia.',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=500&fit=crop',
    date: '2025-11-10',
    category: 'Travel Tips',
    readTime: '7 min read',
  },
  {
    id: 6,
    slug: 'best-diving-spots',
    title: 'Best Diving Spots in the Andaman Sea',
    excerpt: 'Discover world-class diving destinations and underwater wonders in the Andaman Sea.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=500&fit=crop',
    date: '2025-10-25',
    category: 'Adventure Stories',
    readTime: '9 min read',
  },
];

const categories = ['All', 'Travel Tips', 'Destination Guides', 'Adventure Stories', 'Culture & Food'];

export default async function BlogPage({ params }: PageProps) {
  const { lang } = await params;
  const language = lang as Language;

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-rose-50">
        <Container className="py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-rose-100 px-4 py-1.5 text-sm font-medium text-rose-700">
              Our Blog
            </span>
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Travel Blog
            </h1>
            <p className="text-gray-600">
              Discover travel tips, destination guides, and inspiring stories from our adventures around the world.
            </p>
          </div>
        </Container>
      </section>

      {/* Category Filter */}
      <section className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <Container>
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  category === 'All'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </Container>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <article key={post.id} className="card bg-white shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">{post.readTime}</span>
                  </div>
                  <h2 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    <Link href={`/${language}/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <time className="text-xs text-gray-500">
                      {new Date(post.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                    <Link
                      href={`/${language}/blog/${post.slug}`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
                    >
                      Read more
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 text-center">
            <button className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400">
              Load More Articles
            </button>
          </div>
        </Container>
      </section>

      {/* Newsletter CTA */}
      <section className="border-t border-gray-100 bg-gradient-to-r from-rose-600 to-rose-700 py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
              Subscribe to Our Newsletter
            </h2>
            <p className="mb-8 text-rose-100">
              Get the latest travel tips and exclusive offers delivered to your inbox.
            </p>
            <form className="flex flex-col gap-3 sm:flex-row sm:gap-0">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-full sm:rounded-r-none border-0 px-6 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="rounded-full sm:rounded-l-none bg-gray-900 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-4 text-xs text-rose-200">
              No spam, unsubscribe at any time.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}



