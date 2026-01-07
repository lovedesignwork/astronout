import Link from 'next/link';
import { adminListTours } from '@/lib/data/admin';
import { TourListClient } from './TourListClient';

export default async function AdminToursPage() {
  const tours = await adminListTours();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: '32px', fontWeight: 500 }}>Tours</h1>
          <p className="mt-1 text-sm text-gray-500">{tours.length} total tours</p>
        </div>
        <Link
          href="/admin/tours/new"
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Tour
        </Link>
      </div>

      <TourListClient initialTours={tours} />
    </div>
  );
}
