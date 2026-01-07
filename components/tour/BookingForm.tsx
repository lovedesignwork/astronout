'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { AvailabilityCalendar } from '@/components/pricing/AvailabilityCalendar';
import { UpsellCard } from '@/components/upsells/UpsellCard';
import { formatCurrency } from '@/lib/utils';
import type { TourPricing, TourAvailability, Language, TourSelection, PriceBreakdownItem, UpsellWithTranslation, UpsellSelection } from '@/types';

// Package type for the dropdown
interface Package {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
}

interface BookingFormProps {
  pricing: TourPricing | null;
  availability: TourAvailability[];
  upsells: UpsellWithTranslation[];
  language: Language;
  tourName?: string;
  tourDescription?: string;
  offersTransfer?: boolean;
  includedItems?: string[];
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

export function BookingForm({ pricing, availability, upsells, language, tourName = 'Standard Package', tourDescription = '', offersTransfer = false, includedItems = [] }: BookingFormProps) {
  const router = useRouter();
  const calendarRef = useRef<HTMLDivElement>(null);
  const packageDropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    selection,
    selectedDate,
    selectedTime,
    setSelectedDate,
    setSelectedTime,
    updateTourSelection,
    addUpsell,
    removeUpsell,
  } = useBookingContext();

  const [showCalendar, setShowCalendar] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showPackageDropdown, setShowPackageDropdown] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const [guests, setGuests] = useState<GuestCounts>({ adult: 1, child: 0, infant: 0 });
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
  const [showValidationErrors, setShowValidationErrors] = useState(false);

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

  // Build packages array from pricing config
  // Currently we only have one package per tour, but this supports multiple in the future
  const packages: Package[] = [];
  if (pricing && config) {
    packages.push({
      id: pricing.id,
      name: tourName,
      price: prices.adult,
      currency: currency,
      description: tourDescription,
    });
  }

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(packages[0] || null);

  // Update selected package when packages change
  useEffect(() => {
    if (packages.length > 0 && !selectedPackage) {
      setSelectedPackage(packages[0]);
    }
  }, [packages, selectedPackage]);

  // Close package dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (packageDropdownRef.current && !packageDropdownRef.current.contains(event.target as Node)) {
        setShowPackageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate tour total (without upsells)
  const calculateTourTotal = () => {
    return (guests.adult * prices.adult) + (guests.child * prices.child) + (guests.infant * prices.infant);
  };

  // Calculate upsells total
  const calculateUpsellsTotal = () => {
    if (!selection?.upsells) return 0;
    return selection.upsells.reduce((sum, upsell) => sum + upsell.totalPrice, 0);
  };

  // Calculate grand total (tour + upsells)
  const calculateTotal = () => {
    return calculateTourTotal() + calculateUpsellsTotal();
  };

  // Handle upsell toggle
  const handleUpsellToggle = (upsellSelection: UpsellSelection, selected: boolean) => {
    if (selected) {
      addUpsell(upsellSelection);
    } else {
      removeUpsell(upsellSelection.upsellId);
    }
  };

  // Check if an upsell is selected
  const isUpsellSelected = (upsellId: string) => {
    return selection?.upsells.some((u) => u.upsellId === upsellId) || false;
  };

  // Get total guest count for per-person upsells
  const totalGuests = guests.adult + guests.child;

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
        unitRetailPrice: prices.infant,
        unitNetPrice: 0,
        totalRetail: guests.infant * prices.infant,
        totalNet: 0,
      });
    }
    
    const tourSelection: TourSelection = {
      breakdown,
      totalRetail: calculateTotal(),
      totalNet: breakdown.reduce((sum, item) => sum + item.totalNet, 0),
      currency,
    };
    
    updateTourSelection(tourSelection);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Check if form is valid
    if (!isFormValid) {
      setShowValidationErrors(true);
      return;
    }
    
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
  
  // Validation error messages
  const validationErrors = {
    date: !selectedDate,
    name: !customerInfo.name,
    email: !customerInfo.email,
    phone: !customerInfo.phone,
  };

  // Check if contact info is complete and booking details are selected
  const isContactComplete = customerInfo.name && customerInfo.email && customerInfo.phone;
  const isBookingDetailsComplete = selectedDate && guests.adult > 0;
  const showTransferSection = offersTransfer && isContactComplete && isBookingDetailsComplete;

  // Get selected country
  const selectedCountry = COUNTRY_CODES.find(c => c.code === customerInfo.countryCode) || COUNTRY_CODES[0];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
      {/* Package Selector */}
      <div 
        className="border-b p-6 rounded-t-2xl"
        style={{ backgroundColor: 'rgba(225, 243, 254, 1)', borderBottomColor: '#e8e8e8' }}
      >
        <label className="mb-3 block text-[22px] font-bold" style={{ color: 'rgba(61, 90, 138, 1)' }}>
          BOOK THIS ACTIVITY
        </label>
        
        {packages.length === 1 ? (
          /* Single Package - No Dropdown */
          <div className="rounded-xl bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-[27px] font-medium uppercase" style={{ color: 'rgba(13, 13, 13, 1)' }}>
                  {packages[0].name}
                </h3>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold" style={{ color: 'rgba(79, 79, 79, 1)' }}>
                    {formatCurrency(packages[0].price, packages[0].currency)}
                  </span>
                  <span className="text-sm text-gray-500">/ Adult</span>
                </div>
                {pricingType === 'adult_child' && prices.child > 0 && (
                  <div className="mt-0.5 text-sm text-gray-600">
                    Child: {formatCurrency(prices.child, currency)}
                  </div>
                )}
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full text-white" style={{ backgroundColor: 'rgba(90, 145, 216, 1)' }}>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'rgba(255, 255, 255, 1)' }}>
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {packages[0].description && (
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                {packages[0].description}
              </p>
            )}
            {/* Included Items Badges */}
            {includedItems.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {includedItems.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                    style={{ backgroundColor: 'rgba(214, 239, 255, 1)', color: 'rgba(81, 85, 210, 1)' }}
                  >
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Multiple Packages - Dropdown */
          <div ref={packageDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setShowPackageDropdown(!showPackageDropdown)}
              className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                showPackageDropdown
                  ? 'border-[#1e3a5f] ring-2 ring-[#1e3a5f]/20'
                  : 'border-[#1e3a5f] hover:bg-[#f8fafc]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold uppercase text-[#1e3a5f]">
                    {selectedPackage?.name || 'Select a package'}
                  </h3>
                  {selectedPackage && (
                    <>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-xl font-bold text-[#1e3a5f]">
                          {formatCurrency(selectedPackage.price, selectedPackage.currency)}
                        </span>
                        <span className="text-sm text-gray-500">/ Adult</span>
                      </div>
                      {pricingType === 'adult_child' && prices.child > 0 && (
                        <div className="mt-0.5 text-sm text-gray-600">
                          Child: {formatCurrency(prices.child, currency)}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <svg 
                  className={`h-5 w-5 text-[#1e3a5f] transition-transform ${showPackageDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {selectedPackage?.description && (
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {selectedPackage.description}
                </p>
              )}
            </button>

            {/* Package Dropdown Options */}
            {showPackageDropdown && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-gray-200 bg-white shadow-xl">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setShowPackageDropdown(false);
                    }}
                    className={`w-full p-4 text-left transition-all first:rounded-t-xl last:rounded-b-xl ${
                      selectedPackage?.id === pkg.id
                        ? 'bg-[#f0f7ff]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold uppercase text-[#1e3a5f]">{pkg.name}</h4>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-lg font-bold text-[#1e3a5f]">
                            {formatCurrency(pkg.price, pkg.currency)}
                          </span>
                          <span className="text-sm text-gray-500">/ Adult</span>
                        </div>
                      </div>
                      {selectedPackage?.id === pkg.id && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1e3a5f] text-white">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {pkg.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {pkg.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-6 bg-white">
        {/* Main Grid Layout */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Date Selection */}
            <div ref={calendarRef} className="relative">
              <label className="mb-2 block text-[16px] font-medium text-gray-700">
                Select Date *
              </label>
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all bg-white hover:opacity-90"
                style={{ borderColor: 'rgba(214, 239, 255, 1)' }}
              >
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className={`text-[17px] ${selectedDate ? 'text-black' : 'text-black'}`}>
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
                  Select Time *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`rounded-lg px-3 py-2 font-medium transition-all ${
                        selectedTime === time
                          ? 'bg-[#e5faff] text-[#0c78ca]'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      style={selectedTime === time ? { 
                        fontSize: '22px',
                        borderWidth: '2px',
                        borderColor: 'rgba(10, 149, 255, 1)'
                      } : {
                        border: '1px solid rgb(229, 231, 235)'
                      }}
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
                Number of Guests *
              </label>
              <div className="space-y-3">
                {/* Adult */}
                <div className="flex items-center justify-between rounded-xl p-4 border" style={{ backgroundColor: 'rgba(229, 250, 255, 1)', borderColor: 'rgba(179, 226, 255, 1)', borderWidth: '1px' }}>
                  <div>
                    <p className="text-[17px] font-medium text-gray-900">Adult</p>
                    <p className="text-sm font-bold" style={{ color: 'rgba(9, 82, 113, 1)', fontWeight: 700 }}>{formatCurrency(prices.adult, currency)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateGuestCount('adult', false)}
                      disabled={guests.adult <= 1}
                      className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ borderColor: 'rgba(88, 186, 228, 1)', color: 'rgba(29, 74, 109, 1)' }}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(60, 79, 93, 1)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-8 text-center text-[27px] font-semibold text-gray-900">{guests.adult}</span>
                    <button
                      onClick={() => updateGuestCount('adult', true)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-white"
                      style={{ borderColor: 'rgba(88, 186, 228, 1)', color: 'rgba(29, 74, 109, 1)' }}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(60, 79, 93, 1)' }}>
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
                    <div className="flex items-center justify-between rounded-xl p-4 border" style={{ backgroundColor: 'rgba(229, 250, 255, 1)', borderColor: 'rgba(179, 226, 255, 1)', borderWidth: '1px' }}>
                      <div>
                        <p className="font-medium text-gray-900">Child</p>
                        <p className="text-sm font-bold" style={{ color: 'rgba(9, 82, 113, 1)' }}>
                          Age 3-11 • {formatCurrency(prices.child, currency)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateGuestCount('child', false)}
                          disabled={guests.child <= 0}
                          className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ borderColor: 'rgba(88, 186, 228, 1)', color: 'rgba(29, 74, 109, 1)' }}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(60, 79, 93, 1)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-8 text-center text-[27px] font-semibold text-gray-900">{guests.child}</span>
                        <button
                          onClick={() => updateGuestCount('child', true)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-white"
                          style={{ borderColor: 'rgba(88, 186, 228, 1)', color: 'rgba(29, 74, 109, 1)' }}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(60, 79, 93, 1)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Infant */}
                    <div className="flex items-center justify-between rounded-xl p-4 border" style={{ backgroundColor: 'rgba(229, 250, 255, 1)', borderColor: 'rgba(179, 226, 255, 1)', borderWidth: '1px' }}>
                      <div>
                        <p className="font-medium text-gray-900">Infant</p>
                        <p className="text-sm font-bold" style={{ color: 'rgba(9, 82, 113, 1)' }}>Age 0-2 • Free</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateGuestCount('infant', false)}
                          disabled={guests.infant <= 0}
                          className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ borderColor: 'rgba(88, 186, 228, 1)', color: 'rgba(29, 74, 109, 1)' }}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(60, 79, 93, 1)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-8 text-center text-[27px] font-semibold text-gray-900">{guests.infant}</span>
                        <button
                          onClick={() => updateGuestCount('infant', true)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-white"
                          style={{ borderColor: 'rgba(88, 186, 228, 1)', color: 'rgba(29, 74, 109, 1)' }}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(60, 79, 93, 1)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Upsells Section - Inline */}
                {upsells.length > 0 && (
                  <div className="mt-4 rounded-xl border-2 border-[#80ff88] bg-white p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <svg className="h-5 w-5 text-[#159d37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-[19px] font-semibold text-gray-800">Enhance Your Experience</span>
                    </div>
                    <div className="space-y-2">
                      {upsells.map((upsell) => (
                        <UpsellCard
                          key={upsell.id}
                          upsell={upsell}
                          selected={isUpsellSelected(upsell.id)}
                          guestCount={totalGuests}
                          onToggle={(upsellSelection, selected) => handleUpsellToggle(upsellSelection, selected)}
                          compact
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Customer Details - Now First */}
            <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(219, 241, 255, 1)', border: 'solid 1px rgba(179, 226, 255, 1)' }}>
              <div className="mb-3 flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(56, 87, 133, 1)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <label className="text-[17px] font-semibold" style={{ color: 'rgba(65, 99, 149, 1)' }}>
                  Contact Information
                </label>
              </div>
              
              <div className="space-y-3">
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Full Name *"
                  className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-sm transition-all placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
                
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email Address *"
                  className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-sm transition-all placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
                
                {/* Phone with Country Code */}
                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="flex h-full items-center gap-1 rounded-xl bg-white px-3 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 1)', border: 'none' }}
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
                    className="flex-1 rounded-xl border border-green-200 bg-white px-4 py-3 text-sm transition-all placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  />
                </div>
                
                <textarea
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Special requests or notes (optional)"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-green-200 bg-white px-4 py-3 text-sm transition-all placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>
            </div>

            {/* Pickup & Drop-off Section - Only show if tour offers transfer AND contact info is complete */}
            {showTransferSection && (
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="mb-4 flex items-center gap-2 text-gray-700">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span className="text-sm font-medium">Do you need a Pick-up & Drop-off transfer?</span>
                </div>

                {/* Radio Options */}
                <div className="space-y-2">
                  <label 
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                      pickupInfo.needsTransfer 
                        ? 'border-[#d2feda] bg-[#ebfff2]' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="transfer"
                      checked={pickupInfo.needsTransfer}
                      onChange={() => setPickupInfo(prev => ({ ...prev, needsTransfer: true }))}
                      className="h-4 w-4 bg-white text-green-600 focus:ring-green-500"
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
                          className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm focus:border-[#159d37] focus:outline-none focus:ring-2 focus:ring-[#159d37]/20"
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
                            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-all placeholder:text-gray-400 focus:border-[#159d37] focus:outline-none focus:ring-2 focus:ring-[#159d37]/20"
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
                            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-all placeholder:text-gray-400 focus:border-[#159d37] focus:outline-none focus:ring-2 focus:ring-[#159d37]/20"
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
                          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-all placeholder:text-gray-400 focus:border-[#159d37] focus:outline-none focus:ring-2 focus:ring-[#159d37]/20"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Total & Book Button */}
      <div className="border-t p-6 rounded-b-2xl" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(214, 239, 255, 0.99) 100%)', borderTopColor: '#e6e6e6' }}>
        {/* Price Breakdown */}
        <div className="mb-4 space-y-2">
          {/* Tour Name Header */}
          <div className="text-[16px] font-medium text-gray-800 mb-1">
            {tourName}
          </div>
          
          {/* Adult Price Line */}
          {guests.adult > 0 && (
            <div className="flex items-center justify-between text-[15px]">
              <span className="text-gray-600">
                Adult × {guests.adult}
              </span>
              <span className="font-medium text-gray-900">{formatCurrency(guests.adult * prices.adult, currency)}</span>
            </div>
          )}
          
          {/* Child Price Line */}
          {guests.child > 0 && (
            <div className="flex items-center justify-between text-[15px]">
              <span className="text-gray-600">
                Child × {guests.child}
              </span>
              <span className="font-medium text-gray-900">{formatCurrency(guests.child * prices.child, currency)}</span>
            </div>
          )}
          
          {/* Infant Price Line (Free) */}
          {guests.infant > 0 && (
            <div className="flex items-center justify-between text-[15px]">
              <span className="text-gray-600">
                Infant × {guests.infant}
              </span>
              <span className="font-medium text-gray-500">Free</span>
            </div>
          )}
          
          {/* Selected Upsells */}
          {selection?.upsells.map((upsell) => (
            <div key={upsell.upsellId} className="flex items-center justify-between text-[15px]">
              <span className="text-gray-600">
                + {upsell.name} {upsell.quantity > 1 ? `× ${upsell.quantity}` : ''}
              </span>
              <span className="font-medium text-gray-900">{formatCurrency(upsell.totalPrice, currency)}</span>
            </div>
          ))}
          
          {/* Divider before total */}
          <div className="border-t border-gray-200 pt-2 mt-2"></div>
        </div>

        {/* Payment Card Section */}
        <div className="mb-6 rounded-xl border-2 p-5" style={{ borderColor: 'rgba(204, 224, 255, 1)', borderWidth: '2px' }}>
          {/* Header with Lock Icon and Card Logos */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(1, 157, 76, 1)' }}>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" style={{ color: 'rgba(255, 255, 255, 1)' }} />
                </svg>
              </div>
              <span className="text-[19px] font-semibold text-gray-800">Secure Payment</span>
            </div>
            {/* Card Brand Logos */}
            <div className="flex items-center gap-4">
              {/* Visa */}
              <svg viewBox="0 0 48 48" className="h-10 w-auto">
                <path fill="#1565C0" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"/>
                <path fill="#FFF" d="M15.186 19l-2.626 7.832c0 0-.667-3.313-.733-3.729-1.495-3.411-3.701-3.221-3.701-3.221L10.726 30v-.002h3.161L18.258 19H15.186zM17.689 30L20.56 30 22.296 19 19.389 19zM38.008 19h-3.021l-4.71 11h2.852l.588-1.571h3.596L37.619 30h2.613L38.008 19zM34.513 26.328l1.563-4.157.818 4.157H34.513zM26.369 22.206c0-.606.498-1.057 1.926-1.057.928 0 1.991.674 1.991.674l.466-2.309c0 0-1.358-.515-2.691-.515-3.019 0-4.576 1.444-4.576 3.272 0 3.306 3.979 2.853 3.979 4.551 0 .291-.231.964-1.888.964-1.662 0-2.759-.609-2.759-.609l-.495 2.216c0 0 1.063.606 3.117.606 2.059 0 4.915-1.54 4.915-3.752C30.354 23.586 26.369 23.394 26.369 22.206z"/>
                <path fill="#FFC107" d="M12.212,24.945l-0.966-4.748c0,0-0.437-1.029-1.573-1.029c-1.136,0-4.44,0-4.44,0S10.894,20.84,12.212,24.945z"/>
              </svg>
              {/* Mastercard */}
              <svg viewBox="0 0 48 48" className="h-10 w-auto">
                <path fill="#3F51B5" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"/>
                <path fill="#FFC107" d="M30 14A10 10 0 1 0 30 34A10 10 0 1 0 30 14Z"/>
                <path fill="#FF3D00" d="M22.014,30c-0.464-0.617-0.863-1.284-1.176-2h6.325c0.278-0.636,0.496-1.304,0.637-2h-7.598c-0.131-0.648-0.2-1.318-0.2-2c0-0.682,0.069-1.352,0.2-2h7.598c-0.14-0.696-0.359-1.364-0.637-2h-6.325c0.313-0.716,0.712-1.383,1.176-2h3.971c-0.5-0.617-1.074-1.176-1.707-1.667C23.461,14.885,21.792,14,19.999,14c-5.523,0-10,4.478-10,10s4.477,10,10,10c1.792,0,3.462-0.885,4.279-1.333c0.633-0.491,1.207-1.05,1.707-1.667H22.014z"/>
              </svg>
              {/* American Express */}
              <svg viewBox="0 0 48 48" className="h-10 w-auto">
                <path fill="#1976D2" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"/>
                <path fill="#FFF" d="M22.255 20l-2.113 4.683L18.039 20h-2.695v6.726L12.341 20h-2.274L7 28h2.099l.62-1.649h3.051L13.391 28h3.912v-5.136L19.5 28h1.719l2.174-5.135V28h2.041v-8H22.255zM9.178 24.668l1.044-2.883 1.044 2.883H9.178zM26.869 28l2.596-3.297L32.063 28h2.567l-3.859-4.498L34.63 20h-2.567l-2.596 3.297L26.869 20h-2.567l3.859 4.498L24.302 28H26.869zM41 28v-1.649h-4.545v-1.649h4.442v-1.649h-4.442v-1.404H41V20h-6.586v8H41z"/>
              </svg>
              {/* Discover */}
              <svg viewBox="0 0 48 48" className="h-10 w-auto">
                <path fill="#E1E7EA" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"/>
                <path fill="#FF6D00" d="M45,35c0,2.209-1.791,4-4,4H16l29-16.5V35z"/>
                <path fill="#FF6D00" d="M28 24A4 4 0 1 0 28 32A4 4 0 1 0 28 24Z"/>
                <path fill="#424242" d="M8 28h2v-6.007L8.306 28H7.68L6 21.993V28h2v-8H5.172l1.078 4.29L7.328 20h2.578L8 28zM14.5 20c-1.933 0-3.5 1.791-3.5 4s1.567 4 3.5 4 3.5-1.791 3.5-4S16.433 20 14.5 20zM14.5 26.5c-.828 0-1.5-.895-1.5-2s.672-2 1.5-2 1.5.895 1.5 2S15.328 26.5 14.5 26.5z"/>
              </svg>
            </div>
          </div>

          {/* Card Number Field */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-gray-600">
              Card Number
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-[15px] tracking-wider placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Expiry and CVV Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Expiry Date */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">
                Expiry Date
              </label>
              <input
                type="text"
                placeholder="MM / YY"
                maxLength={7}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm tracking-wider placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* CVV */}
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-gray-600">
                CVV
                <span className="group relative cursor-help">
                  <svg className="h-3.5 w-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    3 digits on back of card
                  </span>
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="123"
                  maxLength={4}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm tracking-wider placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Secure Payment Notice */}
          <div className="mt-4 flex items-center justify-center gap-2 rounded-lg py-2 text-xs" style={{ backgroundColor: 'rgba(190, 229, 254, 1)' }}>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'rgb(87, 87, 87)' }}>
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span style={{ color: 'rgba(73, 85, 121, 1)', fontSize: '13px' }}>Your payment info is encrypted and secure</span>
          </div>
        </div>

        {/* Validation Errors */}
        {showValidationErrors && !isFormValid && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-700">
              <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold">Please complete the following:</span>
            </div>
            <ul className="mt-2 space-y-1 pl-7 text-sm text-red-600">
              {validationErrors.date && (
                <li className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  Select a date
                </li>
              )}
              {validationErrors.name && (
                <li className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  Enter your full name
                </li>
              )}
              {validationErrors.email && (
                <li className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  Enter your email address
                </li>
              )}
              {validationErrors.phone && (
                <li className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  Enter your phone number
                </li>
              )}
            </ul>
          </div>
        )}

        <button
          onClick={handleBookNow}
          className="w-full rounded-xl px-8 py-4 text-[22px] font-semibold transition-all text-white shadow-none"
          style={{ backgroundColor: 'rgba(15, 37, 87, 1)' }}
        >
          Pay {formatCurrency(total, currency)}
        </button>

        {/* Trust Badges */}
        <div className="mt-4 flex items-center justify-center gap-6 border-t pt-4 text-xs" style={{ color: '#4d5f84', borderTopColor: '#a6c9bc' }}>
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4" style={{ color: '#5E72D9' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Free cancellation</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'rgba(0, 201, 80, 1)' }}>
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" style={{ color: 'rgba(94, 114, 217, 1)' }} />
            </svg>
            <span>Secure booking</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'rgba(94, 114, 217, 1)' }}>
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" style={{ color: 'rgba(94, 114, 217, 1)' }} />
            </svg>
            <span>Best price guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}

