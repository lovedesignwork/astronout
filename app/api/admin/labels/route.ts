import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET - List all special labels
export async function GET() {
  try {
    const supabase = await createAdminClient();

    const { data: labels, error } = await supabase
      .from('special_labels')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, labels: labels || [] });
  } catch (error) {
    console.error('Error fetching labels:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch labels' }, { status: 500 });
  }
}

// POST - Create new special label
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, background_color, text_color } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Get the highest order number
    const { data: maxOrderResult } = await supabase
      .from('special_labels')
      .select('order')
      .order('order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrderResult?.order ?? -1) + 1;

    const { data: label, error } = await supabase
      .from('special_labels')
      .insert({
        name,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        background_color: background_color || '#f97316',
        text_color: text_color || '#ffffff',
        order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'A label with this slug already exists' },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, label });
  } catch (error) {
    console.error('Error creating label:', error);
    return NextResponse.json({ success: false, error: 'Failed to create label' }, { status: 500 });
  }
}



