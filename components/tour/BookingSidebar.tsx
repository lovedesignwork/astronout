'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { AvailabilityCalendar } from '@/components/pricing/AvailabilityCalendar';
import { formatCurrency } from '@/lib/utils';
import type { TourPricing, TourAvailability, Language, TourSelection, PriceBreakdownItem } from '@/types';

interface BookingSidebarProps {
  pricing: TourPricing | null;
  availability: TourAvailability[];
  language: Language;
}

interface GuestCounts {
  adult: number;
  child: number;
  infant: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  notes: string;
}

interface PickupInfo {
  needsTransfer: boolean;
  locationType: 'hotel' | 'airport' | 'other';
  hotelName: string;
  roomNumber: string;
  customLocation: string;
}

const COUNTRY_CODES = [
  { code: '+66', country: 'TH', flag: '🇹🇭' },
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+86', country: 'CN', flag: '🇨🇳' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+82', country: 'KR', flag: '🇰🇷' },
  { code: '+7', country: 'RU', flag: '🇷🇺' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+39', country: 'IT', flag: '🇮🇹' },
  { code: '+34', country: 'ES', flag: '🇪🇸' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+65', country: 'SG', flag: '🇸🇬' },
  { code: '+60', country: 'MY', flag: '🇲🇾' },
  { code: '+62', country: 'ID', flag: '🇮🇩' },
];

export function BookingSidebar({ pricing, availability, language }: BookingSidebarProps) {
  const router = useRouter();
  const calendarRef = useRef<HTMLDivElement>(null);
  
  const {
    selection,
    selectedDate,
    selectedTime,
    setSelectedDate,
    setSelectedTime,
    updateTourSelection,
  } = useBookingContext();

  const [showCalendar, setShowCalendar] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const [guests, setGuests] = useState<GuestCounts>({ adult: 2, child: 0, infant: 0 });
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    countryCode: '+66',
    phone: '',
    notes: '',
  });
  const [pickupInfo, setPickupInfo] = useState<PickupInfo>({
    needsTransfer: true,
    locationType: 'hotel',
    hotelName: '',
    roomNumber: '',
    customLocation: '',
  });

  // Get pricing config
  const config = pricing?.config as Record<string, unknown> | undefined;
  const pricingType = config?.type as string;
  const currency = (config?.currency as string) || 'THB';

  // Get prices based on pricing type
  const getPrices = () => {
    if (!config) return { adult: 0, child: 0, infant: 0 };
    
    if (pricingType === 'flat_per_person') {
      const price = (config.retail_price as number) || 0;
      return { adult: price, child: price, infant: 0 };
    }
    
    if (pricingType === 'adult_child') {
      return {
        adult: (config.adult_retail_price as number) || 0,
        child: (config.child_retail_price as number) || 0,
        infant: 0,
      };
    }
    
    if (pricingType === 'seat_based') {
      const seats = config.seats as { seat_type: string; retail_price: number }[] | undefined;
      const standardSeat = seats?.find(s => s.seat_type === 'Standard') || seats?.[0];
      const price = standardSeat?.retail_price || 0;
      return { adult: price, child: price, infant: 0 };
    }
    
    return { adult: 0, child: 0, infant: 0 };
  };

  const prices = getPrices();

  // Calculate total
  const calculateTotal = () => {
    return (guests.adult * prices.adult) + (guests.child * prices.child) + (guests.infant * prices.infant);
  };

  // Update guest count
  const updateGuestCount = (type: keyof GuestCounts, increment: boolean) => {
    setGuests(prev => {
      const newCount = increment ? prev[type] + 1 : Math.max(0, prev[type] - 1);
      
      // Ensure at least 1 adult
      if (type === 'adult' && newCount < 1) return prev;
      
      // Check max pax
      const maxPax = (config?.max_pax as number) || 10;
      const totalAfter = (type === 'adult' ? newCount : prev.adult) + 
                        (type === 'child' ? newCount : prev.child) + 
                        (type === 'infant' ? newCount : prev.infant);
      if (totalAfter > maxPax) return prev;
      
      return { ...prev, [type]: newCount };
    });
  };

  // Get net price
  const getNetPrice = (type: 'adult' | 'child' | 'infant') => {
    if (!config) return 0;
    
    if (pricingType === 'flat_per_person') {
      return (config.net_price as number) || 0;
    }
    
    if (pricingType === 'adult_child') {
      if (type === 'adult') return (config.adult_net_price as number) || 0;
      if (type === 'child') return (config.child_net_price as number) || 0;
      return 0;
    }
    
    if (pricingType === 'seat_based') {
      const seats = config.seats as { seat_type: string; net_price: number }[] | undefined;
      const standardSeat = seats?.find(s => s.seat_type === 'Standard') || seats?.[0];
      return standardSeat?.net_price || 0;
    }
    
    return 0;
  };

  // Update tour selection when guests change
  useEffect(() => {
    if (!pricing) return;
    
    const breakdown: PriceBreakdownItem[] = [];
    
    if (guests.adult > 0) {
      breakdown.push({
        type: 'adult',
        label: 'Adult',
        quantity: guests.adult,
        unit_price: prices.adult,
        amount: guests.adult * prices.adult,
        unitRetailPrice: prices.adult,
        unitNetPrice: getNetPrice('adult'),
        totalRetail: guests.adult * prices.adult,
        totalNet: guests.adult * getNetPrice('adult'),
      });
    }
    
    if (guests.child > 0) {
      breakdown.push({
        type: 'child',
        label: 'Child',
        quantity: guests.child,
        unit_price: prices.child,
        amount: guests.child * prices.child,
        unitRetailPrice: prices.child,
        unitNetPrice: getNetPrice('child'),
        totalRetail: guests.child * prices.child,
        totalNet: guests.child * getNetPrice('child'),
      });
    }
    
    if (guests.infant > 0) {
      breakdown.push({
        type: 'infant',
        label: 'Infant',
        quantity: guests.infant,
        unit_price: prices.infant,
        amount: guests.infant * prices.infant,
        unitRetailPrice: prices.infant,
        unitNetPrice: 0,
        totalRetail: guests.infant * prices.infant,
        totalNet: 0,
      });
    }
    
    const tourSelection: TourSelection = {
      breakdown,
      totalRetail: calculateTotal(),
      totalNet: breakdown.reduce((sum, item) => sum + (item.totalNet ?? 0), 0),
      currency,
    };
    
    updateTourSelection(tourSelection);
  }, [guests, pricing]);

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    // Auto-select first available time slot
    const slots = availability.filter(a => a.date === date && a.enabled && a.capacity - a.booked > 0);
    if (slots.length > 0 && slots[0].time_slot) {
      setSelectedTime(slots[0].time_slot);
    }
    setShowCalendar(false);
  };

  // Get available time slots for selected date
  const availableTimeSlots = selectedDate
    ? availability
        .filter((a) => a.date === selectedDate && a.enabled && a.capacity - a.booked > 0)
        .map((a) => a.time_slot)
        .filter((t): t is string => !!t)
    : [];

  // Format selected date for display
  const formatSelectedDate = () => {
    if (!selectedDate) return 'Select date';
    const date = new Date(selectedDate);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  // Handle form submission
  const handleBookNow = () => {
    if (!selectedDate || calculateTotal() === 0) return;
    
    // Store customer info in session storage for checkout
    sessionStorage.setItem('customerInfo', JSON.stringify({
      ...customerInfo,
      phone: customerInfo.countryCode + customerInfo.phone,
      pickup: pickupInfo,
    }));
    
    // Navigate to checkout
    router.push(`/${language}/checkout`);
  };

  const total = calculateTotal();
  const isFormValid = selectedDate && total > 0 && customerInfo.name && customerInfo.email && customerInfo.phone;

  // Get selected country
  const selectedCountry = COUNTRY_CODES.find(c => c.code === customerInfo.countryCode) || COUNTRY_CODES[0];

  return (
    <div className="sticky top-24 space-y-4">
      {/* Main Booking Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
        {/* Price Header */}
        <div className="border-b border-gray-100 p-5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(prices.adult, currency)}
              </span>
              <span className="ml-1 text-gray-500">/ person</span>
            </div>
            {pricingType === 'adult_child' && prices.child > 0 && (
              <div className="text-sm text-gray-500">
                Child: {formatCurrency(prices.child, currency)}
              </div>
            )}
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Date Selection */}
          <div ref={calendarRef} className="relative">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Date
            </label>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                showCalendar 
                  ? 'border-[#0033FF] ring-2 ring-[#0033FF]/20' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={selectedDate ? 'text-gray-900' : 'text-gray-500'}>
                  {formatSelectedDate()}
                </span>
              </div>
              <svg className={`h-5 w-5 text-gray-400 transition-transform ${showCalendar ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Calendar Dropdown */}
            {showCalendar && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
                <AvailabilityCalendar
                  availability={availability}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onDateSelect={handleDateSelect}
                  onTimeSelect={setSelectedTime}
                />
              </div>
            )}
          </div>

          {/* Time Selection (if date selected and has time slots) */}
          {selectedDate && availableTimeSlots.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Time
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableTimeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      selectedTime === time
                        ? 'border-[#0033FF] bg-[#e6f0ff] text-[#0033FF]'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Guest Selection */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Guests
            </label>
            <div className="space-y-3">
              {/* Adult */}
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                <div>
                  <p className="font-medium text-gray-900">Adult</p>
                  <p className="text-sm text-gray-500">{formatCurrency(prices.adult, currency)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateGuestCount('adult', false)}
                    disabled={guests.adult <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-8 text-center font-semibold text-gray-900">{guests.adult}</span>
                  <button
                    onClick={() => updateGuestCount('adult', true)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Add Children Toggle */}
              {!hasChildren && (
                <button
                  onClick={() => setHasChildren(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Child or Infant
                </button>
              )}

              {/* Child (only show when hasChildren is true) */}
              {hasChildren && (
                <>
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                    <div>
                      <p className="font-medium text-gray-900">Child</p>
                      <p className="text-sm text-gray-500">
                        Age 3-11 • {formatCurrency(prices.child, currency)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateGuestCount('child', false)}
                        disabled={guests.child <= 0}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-900">{guests.child}</span>
                      <button
                        onClick={() => updateGuestCount('child', true)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Infant */}
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                    <div>
                      <p className="font-medium text-gray-900">Infant</p>
                      <p className="text-sm text-gray-500">Age 0-2 • Free</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateGuestCount('infant', false)}
                        disabled={guests.infant <= 0}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-900">{guests.infant}</span>
                      <button
                        onClick={() => updateGuestCount('infant', true)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Pickup & Drop-off Section */}
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="mb-4 flex items-center gap-2 text-gray-700">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="font-medium">Do you need a Pick-up & Drop-off transfer?</span>
            </div>

            {/* Radio Options */}
            <div className="space-y-2">
              <label 
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                  pickupInfo.needsTransfer 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="transfer"
                  checked={pickupInfo.needsTransfer}
                  onChange={() => setPickupInfo(prev => ({ ...prev, needsTransfer: true }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">Yes, I need pick-up & drop-off</span>
                  <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    FREE (Included)
                  </span>
                </div>
              </label>

              <label 
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                  !pickupInfo.needsTransfer 
                    ? 'border-gray-400 bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="transfer"
                  checked={!pickupInfo.needsTransfer}
                  onChange={() => setPickupInfo(prev => ({ ...prev, needsTransfer: false }))}
                  className="h-4 w-4 text-gray-600 focus:ring-gray-500"
                />
                <span className="text-sm font-medium text-gray-900">No, I will come by myself to the meeting point</span>
              </label>
            </div>

            {/* Pickup Details (only show if needs transfer) */}
            {pickupInfo.needsTransfer && (
              <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                {/* Pick-up Location Type */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Pick-up Location Type
                  </label>
                  <div className="relative">
                    <select
                      value={pickupInfo.locationType}
                      onChange={(e) => setPickupInfo(prev => ({ ...prev, locationType: e.target.value as 'hotel' | 'airport' | 'other' }))}
                      className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm focus:border-[#0033FF] focus:outline-none focus:ring-2 focus:ring-[#0033FF]/20"
                    >
                      <option value="hotel">🏨 Hotel Pick-up</option>
                      <option value="airport">✈️ Airport Pick-up</option>
                      <option value="other">📍 Other Location</option>
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Hotel Name */}
                {pickupInfo.locationType === 'hotel' && (
                  <>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Hotel Name
                      </label>
                      <input
                        type="text"
                        value={pickupInfo.hotelName}
                        onChange={(e) => setPickupInfo(prev => ({ ...prev, hotelName: e.target.value }))}
                        placeholder="Type to search hotel..."
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-all placeholder:text-gray-400 focus:border-[#0033FF] focus:outline-none focus:ring-2 focus:ring-[#0033FF]/20"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Room Number <span className="font-normal text-gray-400">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={pickupInfo.roomNumber}
                        onChange={(e) => setPickupInfo(prev => ({ ...prev, roomNumber: e.target.value }))}
                        placeholder="e.g., 301"
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-all placeholder:text-gray-400 focus:border-[#0033FF] focus:outline-none focus:ring-2 focus:ring-[#0033FF]/20"
                      />
                    </div>
                  </>
                )}

                {/* Other Location */}
                {pickupInfo.locationType === 'other' && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Pick-up Address
                    </label>
                    <input
                      type="text"
                      value={pickupInfo.customLocation}
                      onChange={(e) => setPickupInfo(prev => ({ ...prev, customLocation: e.target.value }))}
                      placeholder="Enter full address"
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-all placeholder:text-gray-400 focus:border-[#0033FF] focus:outline-none focus:ring-2 focus:ring-[#0033FF]/20"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Customer Details */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Contact Information
            </label>
            
            <input
              type="text"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Full Name *"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all placeholder:text-gray-400 focus:border-[#0033FF] focus:outline-none focus:ring-2 focus:ring-[#0033FF]/20"
            />
            
            <input
              type="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Email Address *"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all placeholder:text-gray-400 focus:border-[#0033FF] focus:outline-none focus:ring-2 focus:ring-[#0033FF]/20"
            />
            
            {/* Phone with Country Code */}
            <div className="flex gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex h-full items-center gap-1 rounded-xl border border-gray-200 px-3 py-3 text-sm transition-all hover:border-gray-300 focus:border-[#0033FF] focus:outline-none focus:ring-2 focus:ring-[#0033FF]/20"
                >
                  <span>{selectedCountry.flag}</span>
                  <span className="text-gray-700">{selectedCountry.code}</span>
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showCountryDropdown && (
                  <div className="absolute left-0 top-full z-50 mt-1 max-h-48 w-40 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    {COUNTRY_CODES.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => {
                          setCustomerInfo(prev => ({ ...prev, countryCode: country.code }));
                          setShowCountryDropdown(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        <span>{country.flag}</span>
                        <span className="text-gray-700">{country.code}</span>
                        <span className="text-gray-400">{country.country}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone Number *"
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all placeholder:text-gray-400 focus:border-[#0033FF] focus:outline-none focus:ring-2 focus:ring-[#0033FF]/20"
              />
            </div>
            
            <textarea
              value={customerInfo.notes}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Special requests or notes (optional)"
              rows={2}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all placeholder:text-gray-400 focus:border-[#0033FF] focus:outline-none focus:ring-2 focus:ring-[#0033FF]/20"
            />
          </div>
        </div>

        {/* Total & Book Button */}
        <div className="border-t border-gray-100 p-5">
          {/* Price Breakdown */}
          {total > 0 && (
            <div className="mb-4 space-y-2">
              {guests.adult > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Adult × {guests.adult}</span>
                  <span className="font-medium text-gray-900">{formatCurrency(guests.adult * prices.adult, currency)}</span>
                </div>
              )}
              {guests.child > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Child × {guests.child}</span>
                  <span className="font-medium text-gray-900">{formatCurrency(guests.child * prices.child, currency)}</span>
                </div>
              )}
              {guests.infant > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Infant × {guests.infant}</span>
                  <span className="font-medium text-gray-900">Free</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-orange-600">{formatCurrency(total, currency)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Book Now Button */}
          <button
            onClick={handleBookNow}
            disabled={!isFormValid}
            className={`w-full rounded-xl py-4 text-base font-semibold transition-all ${
              isFormValid
                ? 'bg-[#0033FF] text-white shadow-lg shadow-[#0033FF]/30 hover:bg-[#0029cc] hover:shadow-xl hover:shadow-[#0033FF]/40'
                : 'cursor-not-allowed bg-gray-200 text-gray-500'
            }`}
          >
            Book Now
          </button>

          {/* Trust Badges */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Free cancellation</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secure booking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
