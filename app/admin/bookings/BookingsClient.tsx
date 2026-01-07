'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { BookingModal } from '@/components/admin/BookingModal';
import { BookingDetailsModal } from '@/components/admin/BookingDetailsModal';
import { SendEmailModal } from '@/components/admin/SendEmailModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import type { Booking, BookingStatus, Tour } from '@/types';

interface BookingsClientProps {
  initialBookings: Booking[];
  initialTotal: number;
  tours: Tour[];
}

type SortField = 'reference' | 'customer' | 'tour' | 'tourDate' | 'bookingDate' | 'amount' | 'status';
type SortDirection = 'asc' | 'desc';

const STATUS_OPTIONS: { value: BookingStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  pending_payment: 'bg-[#e6f0ff] text-[#001f99] border-[#cce0ff]',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export function BookingsClient({ initialBookings, initialTotal, tours }: BookingsClientProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [tourFilter, setTourFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const limit = 20;
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('bookingDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [bookingToView, setBookingToView] = useState<Booking | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [bookingToEmail, setBookingToEmail] = useState<Booking | null>(null);
  
  // Toast state for copy notification
  const [copyToast, setCopyToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // Selected bookings for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Helper function to get tour name
  const getTourName = (booking: Booking): string => {
    const tour = tours.find(t => t.id === booking.tour_id);
    if (!tour) return '-';
    
    // Get hero block title
    const heroBlock = (tour as any).blocks?.find((b: any) => b.block_type === 'hero');
    const translation = heroBlock?.translations?.find((t: any) => t.language === 'en');
    return translation?.title || tour.slug;
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (tourFilter) params.set('tourId', tourFilter);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      params.set('limit', String(limit));
      params.set('offset', String((page - 1) * limit));

      const response = await fetch(`/api/admin/bookings?${params}`);
      const data = await response.json();
      
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, tourFilter, startDate, endDate, page]);

  const handleSearch = () => {
    setPage(1);
    fetchBookings();
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setTourFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    // Reload with no filters
    router.refresh();
  };

  const handleNewBooking = () => {
    setSelectedBooking(null);
    setModalOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const handleDeleteClick = (booking: Booking) => {
    setBookingToDelete(booking);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (booking: Booking) => {
    setBookingToView(booking);
    setDetailsModalOpen(true);
  };

  const handleSendEmail = (booking: Booking) => {
    setBookingToEmail(booking);
    setEmailModalOpen(true);
  };

  const handleCopyToClipboard = async (booking: Booking) => {
    const tourName = getTourName(booking);
    const tourDate = new Date(booking.booking_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const total = formatCurrency(Number(booking.total_retail), booking.currency);
    
    // Format customer data (excluding email)
    const lines = [
      `Name: ${booking.customer_name}`,
      booking.customer_phone ? `Phone: ${booking.customer_phone}` : null,
      booking.customer_nationality ? `Nationality: ${booking.customer_nationality}` : null,
      `Tour: ${tourName}`,
      `Tour Date: ${tourDate}`,
      `Booking Ref: ${booking.reference}`,
      `Total: ${total}`,
      booking.notes ? `Notes: ${booking.notes}` : null,
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(lines);
      setCopyToast({ show: true, message: 'Customer data copied to clipboard!' });
      setTimeout(() => setCopyToast({ show: false, message: '' }), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopyToast({ show: true, message: 'Failed to copy to clipboard' });
      setTimeout(() => setCopyToast({ show: false, message: '' }), 3000);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return;
    
    try {
      const response = await fetch(`/api/admin/bookings/${bookingToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setBookings(bookings.filter(b => b.id !== bookingToDelete.id));
        setTotal(total - 1);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
    } finally {
      setDeleteDialogOpen(false);
      setBookingToDelete(null);
    }
  };

  const handleBulkStatusChange = async (newStatus: BookingStatus) => {
    if (selectedIds.size === 0) return;
    
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`/api/admin/bookings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );
      
      setSelectedIds(new Set());
      fetchBookings();
    } catch (error) {
      console.error('Error updating bookings:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} booking(s)?`)) return;
    
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' })
        )
      );
      
      setSelectedIds(new Set());
      fetchBookings();
    } catch (error) {
      console.error('Error deleting bookings:', error);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === bookings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(bookings.map(b => b.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort bookings
  const sortedBookings = [...bookings].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'reference':
        aValue = a.reference;
        bValue = b.reference;
        break;
      case 'customer':
        aValue = a.customer_name.toLowerCase();
        bValue = b.customer_name.toLowerCase();
        break;
      case 'tour':
        aValue = getTourName(a).toLowerCase();
        bValue = getTourName(b).toLowerCase();
        break;
      case 'tourDate':
        aValue = new Date(a.booking_date).getTime();
        bValue = new Date(b.booking_date).getTime();
        break;
      case 'bookingDate':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      case 'amount':
        aValue = Number(a.total_retail);
        bValue = Number(b.total_retail);
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="size-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    ) : (
      <svg className="size-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="mt-1 text-sm text-gray-600">{total} total bookings</p>
        </div>
        <button
          onClick={handleNewBooking}
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-purple-700 transition-colors"
        >
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Booking
        </button>
      </div>

      {/* Filters */}
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by name, email, or reference..."
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | '')}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Tour Filter */}
            <select
              value={tourFilter}
              onChange={(e) => setTourFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
            >
              <option value="">All Tours</option>
              {tours.map((tour) => {
                const heroBlock = (tour as any).blocks?.find((b: any) => b.block_type === 'hero');
                const translation = heroBlock?.translations?.find((t: any) => t.language === 'en');
                const tourName = translation?.title || tour.slug;
                return (
                  <option key={tour.id} value={tour.id}>
                    {tourName}
                  </option>
                );
              })}
            </select>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Search
              </button>
              <button
                onClick={handleClearFilters}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 rounded-lg bg-purple-50 border border-purple-200 px-4 py-3">
          <span className="text-sm font-medium text-purple-700">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkStatusChange('confirmed')}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
            >
              Confirm
            </button>
            <button
              onClick={() => handleBulkStatusChange('cancelled')}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkDelete}
              className="rounded-lg bg-gray-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card bg-white shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === bookings.length && bookings.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </th>
                <th 
                  onClick={() => handleSort('reference')}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Reference
                    <SortIcon field="reference" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('bookingDate')}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Booking Date
                    <SortIcon field="bookingDate" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('customer')}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Customer
                    <SortIcon field="customer" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('tour')}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Tour
                    <SortIcon field="tour" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('tourDate')}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Tour Date
                    <SortIcon field="tourDate" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('amount')}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Amount
                    <SortIcon field="amount" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Status
                    <SortIcon field="status" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="size-12 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="mt-4 font-medium text-gray-700">No bookings found</p>
                      <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(booking.id)}
                        onChange={() => toggleSelect(booking.id)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-sm font-semibold text-purple-600">
                        {booking.reference}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-500">
                        {new Date(booking.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: '2-digit'
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{booking.customer_name}</p>
                        <p className="text-sm text-gray-500">{booking.customer_email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">
                        {getTourName(booking)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-700">
                        <p className="text-gray-500">{new Date(booking.booking_date).toLocaleDateString('en-GB', { weekday: 'long' })}</p>
                        <p>{new Date(booking.booking_date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: '2-digit'
                        })}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-gray-900">
                        {Number(booking.total_retail).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium border ${STATUS_COLORS[booking.status]}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                          title="View Details"
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleCopyToClipboard(booking)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-green-50 hover:text-green-600"
                          title="Copy for WhatsApp/Messenger"
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleSendEmail(booking)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-purple-50 hover:text-purple-600"
                          title="Send Email"
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEditBooking(booking)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          title="Edit"
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(booking)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedBooking(null);
        }}
        onSave={() => {
          fetchBookings();
          router.refresh();
        }}
        booking={selectedBooking}
        tours={tours}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Booking"
        message={`Are you sure you want to delete booking ${bookingToDelete?.reference}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setBookingToDelete(null);
        }}
      />

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setBookingToView(null);
        }}
        booking={bookingToView}
        tours={tours}
      />

      {/* Send Email Modal */}
      <SendEmailModal
        isOpen={emailModalOpen}
        onClose={() => {
          setEmailModalOpen(false);
          setBookingToEmail(null);
        }}
        booking={bookingToEmail}
        tours={tours}
      />

      {/* Copy Toast Notification */}
      {copyToast.show && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center gap-3 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">
            <svg className="size-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {copyToast.message}
          </div>
        </div>
      )}
    </div>
  );
}


