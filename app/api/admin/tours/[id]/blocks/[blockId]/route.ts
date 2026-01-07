import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// PUT - Update block
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  try {
    const { blockId } = await params;
    const body = await request.json();
    const supabase = await createAdminClient();

    // Update block enabled status if provided
    if (body.enabled !== undefined) {
      const { error: blockError } = await supabase
        .from('tour_blocks')
        .update({ enabled: body.enabled, updated_at: new Date().toISOString() })
        .eq('id', blockId);

      if (blockError) {
        return NextResponse.json({ success: false, error: blockError.message }, { status: 400 });
      }
    }

    // Update translation if title or content provided
    if (body.title !== undefined || body.content !== undefined) {
      const language = body.language || 'en';
      
      // Check if translation exists
      const { data: existingTrans } = await supabase
        .from('tour_block_translations')
        .select('id')
        .eq('block_id', blockId)
        .eq('language', language)
        .single();

      if (existingTrans) {
        // Update existing translation
        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (body.title !== undefined) updateData.title = body.title;
        if (body.content !== undefined) updateData.content = body.content;

        const { error: transError } = await supabase
          .from('tour_block_translations')
          .update(updateData)
          .eq('id', existingTrans.id);

        if (transError) {
          return NextResponse.json({ success: false, error: transError.message }, { status: 400 });
        }
      } else {
        // Create new translation
        const { error: transError } = await supabase
          .from('tour_block_translations')
          .insert({
            block_id: blockId,
            language,
            title: body.title || '',
            content: body.content || {},
          });

        if (transError) {
          return NextResponse.json({ success: false, error: transError.message }, { status: 400 });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating block:', error);
    return NextResponse.json({ success: false, error: 'Failed to update block' }, { status: 500 });
  }
}

// DELETE - Delete block
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  try {
    const { blockId } = await params;
    const supabase = await createAdminClient();

    // Delete translations first
    await supabase.from('tour_block_translations').delete().eq('block_id', blockId);

    // Delete the block
    const { error } = await supabase.from('tour_blocks').delete().eq('id', blockId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting block:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete block' }, { status: 500 });
  }
}
