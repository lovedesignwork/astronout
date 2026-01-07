import { Suspense } from 'react';
import { adminListBookings, adminListTours } from '@/lib/data/admin';
import { BookingsClient } from './BookingsClient';

export default async function AdminBookingsPage() {
  const [{ bookings, total }, tours] = await Promise.all([
    adminListBookings({ limit: 50 }),
    adminListTours(),
  ]);

  return (
    <Suspense fallback={<BookingsLoading />}>
      <BookingsClient 
        initialBookings={bookings} 
        initialTotal={total} 
        tours={tours}
      />
    </Suspense>
  );
}

function BookingsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-gray-200" />
      <div className="h-96 animate-pulse rounded-xl bg-gray-200" />
    </div>
  );
}
