import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET - List all categories
export async function GET() {
  try {
    const supabase = await createAdminClient();

    const { data: categories, error } = await supabase
      .from('tour_categories')
      .select('*')
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

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Get the highest order number
    const { data: maxOrderResult } = await supabase
      .from('tour_categories')
      .select('order')
      .order('order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrderResult?.order ?? -1) + 1;

    const { data: category, error } = await supabase
      .from('tour_categories')
      .insert({
        name,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        description: description || null,
        order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'A category with this slug already exists' },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 });
  }
}




