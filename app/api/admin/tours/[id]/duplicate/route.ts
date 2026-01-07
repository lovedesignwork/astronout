import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// Helper to verify admin auth
async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, error: 'Unauthorized' };
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    return { authorized: false, error: 'Unauthorized' };
  }

  return { authorized: true };
}

// Helper to get tour by ID or tour_number
async function getTourByIdOrNumber(supabase: Awaited<ReturnType<typeof createAdminClient>>, idOrNumber: string) {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);
  
  if (isUUID) {
    return supabase.from('tours').select('*').eq('id', idOrNumber).single();
  } else {
    return supabase.from('tours').select('*').eq('tour_number', idOrNumber).single();
  }
}

// POST - Duplicate a tour
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const { id: idOrNumber } = await params;
    const supabase = await createAdminClient();

    // Get original tour (supports both UUID and tour_number)
    const { data: originalTour, error: tourError } = await getTourByIdOrNumber(supabase, idOrNumber);

    if (tourError || !originalTour) {
      return NextResponse.json(
        { success: false, error: 'Tour not found' },
        { status: 404 }
      );
    }

    const tourId = originalTour.id; // Use the actual UUID for all related queries

    // Generate new slug
    let newSlug = `${originalTour.slug}-copy`;
    let slugCounter = 1;
    
    // Check if slug exists and increment counter
    while (true) {
      const { data: existingTour } = await supabase
        .from('tours')
        .select('id')
        .eq('slug', newSlug)
        .single();

      if (!existingTour) break;
      
      slugCounter++;
      newSlug = `${originalTour.slug}-copy-${slugCounter}`;
    }

    // Create new tour
    const { id: _id, created_at: _created, updated_at: _updated, ...tourData } = originalTour;
    const { data: newTour, error: createError } = await supabase
      .from('tours')
      .insert({
        ...tourData,
        slug: newSlug,
        status: 'draft',
      })
      .select()
      .single();

    if (createError || !newTour) {
      return NextResponse.json(
        { success: false, error: createError?.message || 'Failed to create tour' },
        { status: 500 }
      );
    }

    // Copy tour blocks
    const { data: originalBlocks } = await supabase
      .from('tour_blocks')
      .select('*')
      .eq('tour_id', tourId)
      .order('order', { ascending: true });

    if (originalBlocks && originalBlocks.length > 0) {
      const blockIdMap: Record<string, string> = {};

      for (const block of originalBlocks) {
        const { id: originalBlockId, created_at: _bc, updated_at: _bu, ...blockData } = block;
        
        const { data: newBlock, error: blockError } = await supabase
          .from('tour_blocks')
          .insert({
            ...blockData,
            tour_id: newTour.id,
          })
          .select()
          .single();

        if (newBlock && !blockError) {
          blockIdMap[originalBlockId] = newBlock.id;

          // Copy block translations
          const { data: translations } = await supabase
            .from('tour_block_translations')
            .select('*')
            .eq('block_id', originalBlockId);

          if (translations && translations.length > 0) {
            const newTranslations = translations.map((t) => {
              const { id: _tid, created_at: _tc, updated_at: _tu, ...tData } = t;
              return {
                ...tData,
                block_id: newBlock.id,
              };
            });

            // Update title for hero block
            if (block.block_type === 'hero') {
              newTranslations.forEach((t) => {
                if (t.title) {
                  t.title = `${t.title} (Copy)`;
                }
              });
            }

            await supabase.from('tour_block_translations').insert(newTranslations);
          }
        }
      }
    }

    // Copy tour pricing
    const { data: originalPricing } = await supabase
      .from('tour_pricing')
      .select('*')
      .eq('tour_id', tourId)
      .single();

    if (originalPricing) {
      const { id: _pid, created_at: _pc, updated_at: _pu, ...pricingData } = originalPricing;
      await supabase.from('tour_pricing').insert({
        ...pricingData,
        tour_id: newTour.id,
      });
    }

    // Copy upsells
    const { data: originalUpsells } = await supabase
      .from('upsells')
      .select('*')
      .eq('tour_id', tourId);

    if (originalUpsells && originalUpsells.length > 0) {
      for (const upsell of originalUpsells) {
        const { id: originalUpsellId, created_at: _uc, updated_at: _uu, ...upsellData } = upsell;
        
        const { data: newUpsell } = await supabase
          .from('upsells')
          .insert({
            ...upsellData,
            tour_id: newTour.id,
          })
          .select()
          .single();

        if (newUpsell) {
          // Copy upsell translations
          const { data: upsellTranslations } = await supabase
            .from('upsell_translations')
            .select('*')
            .eq('upsell_id', originalUpsellId);

          if (upsellTranslations && upsellTranslations.length > 0) {
            const newTranslations = upsellTranslations.map((t) => {
              const { id: _tid, created_at: _tc, updated_at: _tu, ...tData } = t;
              return {
                ...tData,
                upsell_id: newUpsell.id,
              };
            });

            await supabase.from('upsell_translations').insert(newTranslations);
          }
        }
      }
    }

    // Copy tour packages
    const { data: originalPackages } = await supabase
      .from('tour_packages')
      .select('*, upsells:package_upsells(*)')
      .eq('tour_id', tourId);

    if (originalPackages && originalPackages.length > 0) {
      for (const pkg of originalPackages) {
        const { id: originalPkgId, created_at: _pkgc, updated_at: _pkgu, upsells: pkgUpsells, ...pkgData } = pkg;
        
        const { data: newPkg } = await supabase
          .from('tour_packages')
          .insert({
            ...pkgData,
            tour_id: newTour.id,
          })
          .select()
          .single();

        if (newPkg && pkgUpsells && pkgUpsells.length > 0) {
          const newPkgUpsells = pkgUpsells.map((u: Record<string, unknown>) => {
            const { id: _uid, created_at: _upc, updated_at: _upu, package_id: _pkgId, ...uData } = u;
            return {
              ...uData,
              package_id: newPkg.id,
            };
          });

          await supabase.from('package_upsells').insert(newPkgUpsells);
        }
      }
    }

    // Copy SEO entity if exists
    const { data: originalSeo } = await supabase
      .from('seo_entities')
      .select('*')
      .eq('entity_type', 'tour')
      .eq('entity_id', tourId)
      .single();

    if (originalSeo) {
      const { id: originalSeoId, created_at: _seoc, updated_at: _seou, ...seoData } = originalSeo;
      
      const { data: newSeo } = await supabase
        .from('seo_entities')
        .insert({
          ...seoData,
          entity_id: newTour.id,
          slug: newSlug,
        })
        .select()
        .single();

      if (newSeo) {
        // Copy SEO translations
        const { data: seoTranslations } = await supabase
          .from('seo_translations')
          .select('*')
          .eq('seo_entity_id', originalSeoId);

        if (seoTranslations && seoTranslations.length > 0) {
          const newTranslations = seoTranslations.map((t) => {
            const { id: _tid, created_at: _tc, updated_at: _tu, ...tData } = t;
            return {
              ...tData,
              seo_entity_id: newSeo.id,
            };
          });

          await supabase.from('seo_translations').insert(newTranslations);
        }
      }
    }

    return NextResponse.json({
      success: true,
      tour: newTour,
      message: 'Tour duplicated successfully',
    });
  } catch (error) {
    console.error('Error duplicating tour:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to duplicate tour' },
      { status: 500 }
    );
  }
}




