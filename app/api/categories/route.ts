import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - List all categories (public endpoint)
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: categories, error } = await supabase
      .from('tour_categories')
      .select('id, name, slug, description, order')
      .order('order', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, categories: categories || [] });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
  }
}




