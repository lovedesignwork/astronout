import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { TourPackage, PackageUpsell } from '@/types';

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

// Helper to resolve tour ID from UUID or tour_number
async function resolveTourId(supabase: Awaited<ReturnType<typeof createAdminClient>>, idOrNumber: string): Promise<string | null> {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);
  
  if (isUUID) {
    return idOrNumber;
  }
  
  const { data: tour } = await supabase
    .from('tours')
    .select('id')
    .eq('tour_number', idOrNumber)
    .single();
  
  return tour?.id || null;
}

// GET - Get all packages for a tour
export async function GET(
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

    // Resolve tour ID from UUID or tour_number
    const tourId = await resolveTourId(supabase, idOrNumber);
    if (!tourId) {
      return NextResponse.json({ success: false, error: 'Tour not found' }, { status: 404 });
    }

    const { data: packages, error } = await supabase
      .from('tour_packages')
      .select(`
        *,
        upsells:package_upsells(*)
      `)
      .eq('tour_id', tourId)
      .order('order', { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, packages });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}

// PUT - Update all packages for a tour (replace all)
export async function PUT(
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
    const { packages } = await request.json() as { packages: TourPackage[] };
    const supabase = await createAdminClient();

    // Resolve tour ID from UUID or tour_number
    const tourId = await resolveTourId(supabase, idOrNumber);
    if (!tourId) {
      return NextResponse.json({ success: false, error: 'Tour not found' }, { status: 404 });
    }

    // Get existing packages
    const { data: existingPackages } = await supabase
      .from('tour_packages')
      .select('id')
      .eq('tour_id', tourId);

    const existingIds = (existingPackages || []).map(p => p.id);
    const newIds = packages.filter(p => !p.id.startsWith('new-')).map(p => p.id);
    const idsToDelete = existingIds.filter(id => !newIds.includes(id));

    // Delete removed packages
    if (idsToDelete.length > 0) {
      // Delete upsells first
      await supabase
        .from('package_upsells')
        .delete()
        .in('package_id', idsToDelete);

      // Delete packages
      await supabase
        .from('tour_packages')
        .delete()
        .in('id', idsToDelete);
    }

    // Upsert packages
    const savedPackages: TourPackage[] = [];
    const errors: string[] = [];

    for (const pkg of packages) {
      const isNew = pkg.id.startsWith('new-');
      const packageData = {
        tour_id: tourId,
        title: pkg.title,
        description: pkg.description,
        pricing_type: pkg.pricing_type,
        pricing_config: pkg.pricing_config,
        included_items: pkg.included_items,
        calendar_enabled: pkg.calendar_enabled,
        calendar_config: pkg.calendar_config,
        pickup_enabled: pkg.pickup_enabled,
        order: pkg.order,
        enabled: pkg.enabled,
      };

      let savedPackage: TourPackage;

      if (isNew) {
        // Insert new package
        const { data, error } = await supabase
          .from('tour_packages')
          .insert(packageData)
          .select()
          .single();

        if (error) {
          console.error('Error inserting package:', error);
          errors.push(`Failed to create package "${pkg.title}": ${error.message}`);
          continue;
        }
        savedPackage = data as TourPackage;
      } else {
        // Update existing package
        const { data, error } = await supabase
          .from('tour_packages')
          .update(packageData)
          .eq('id', pkg.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating package:', error);
          errors.push(`Failed to update package "${pkg.title}": ${error.message}`);
          continue;
        }
        savedPackage = data as TourPackage;
      }

      // Handle upsells
      if (pkg.upsells && pkg.upsells.length > 0) {
        // Delete existing upsells for this package
        await supabase
          .from('package_upsells')
          .delete()
          .eq('package_id', savedPackage.id);

        // Insert new upsells
        const upsellsToInsert = pkg.upsells.map((u: PackageUpsell, index: number) => ({
          package_id: savedPackage.id,
          title: u.title,
          description: u.description,
          pricing_type: u.pricing_type,
          price: u.price,
          order: index,
          enabled: u.enabled,
        }));

        const { data: savedUpsells } = await supabase
          .from('package_upsells')
          .insert(upsellsToInsert)
          .select();

        savedPackage.upsells = savedUpsells as PackageUpsell[];
      } else {
        // Delete all upsells for this package
        await supabase
          .from('package_upsells')
          .delete()
          .eq('package_id', savedPackage.id);
        savedPackage.upsells = [];
      }

      savedPackages.push(savedPackage);
    }

    // Return errors if any packages failed
    if (errors.length > 0 && savedPackages.length === 0) {
      return NextResponse.json({ success: false, error: errors.join('; ') }, { status: 500 });
    }

    // Revalidate cache so frontend reflects changes (Next.js 16 requires profile arg)
    await revalidateTag('tours', 'default');
    await revalidateTag(`tour-${tourId}`, 'default');

    return NextResponse.json({ 
      success: true, 
      packages: savedPackages,
      warnings: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error updating packages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update packages' },
      { status: 500 }
    );
  }
}

// POST - Create a new package
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
    const body = await request.json();
    const supabase = await createAdminClient();

    // Resolve tour ID from UUID or tour_number
    const tourId = await resolveTourId(supabase, idOrNumber);
    if (!tourId) {
      return NextResponse.json({ success: false, error: 'Tour not found' }, { status: 404 });
    }

    // Get max order
    const { data: maxOrderResult } = await supabase
      .from('tour_packages')
      .select('order')
      .eq('tour_id', tourId)
      .order('order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrderResult?.order || 0) + 1;

    const { data: pkg, error } = await supabase
      .from('tour_packages')
      .insert({
        tour_id: tourId,
        title: body.title || 'New Package',
        description: body.description || null,
        pricing_type: body.pricing_type || 'per_person',
        pricing_config: body.pricing_config || { retail_price: 0, net_price: 0, currency: 'THB' },
        included_items: body.included_items || [],
        calendar_enabled: body.calendar_enabled || false,
        calendar_config: body.calendar_config || {},
        pickup_enabled: body.pickup_enabled || false,
        order: nextOrder,
        enabled: body.enabled !== false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, package: pkg });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create package' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a package
export async function DELETE(
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

    const { searchParams } = new URL(request.url);
    const packageId = searchParams.get('packageId');

    if (!packageId) {
      return NextResponse.json(
        { success: false, error: 'Package ID required' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Delete upsells first
    await supabase
      .from('package_upsells')
      .delete()
      .eq('package_id', packageId);

    // Delete package
    const { error } = await supabase
      .from('tour_packages')
      .delete()
      .eq('id', packageId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete package' },
      { status: 500 }
    );
  }
}




