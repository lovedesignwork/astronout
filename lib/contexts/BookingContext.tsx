'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import type {
  Tour,
  TourPricing,
  TourAvailability,
  UpsellWithTranslation,
  TourSelection,
  UpsellSelection,
  BookingSelection,
  PriceBreakdownItem,
} from '@/types';

interface BookingContextType {
  // Tour data
  tour: Tour | null;
  pricing: TourPricing | null;
  availability: TourAvailability[];
  upsells: UpsellWithTranslation[];

  // Selection state
  selection: BookingSelection | null;
  selectedDate: string | null;
  selectedTime: string | null;

  // Actions
  setTourData: (
    tour: Tour,
    pricing: TourPricing | null,
    upsells: UpsellWithTranslation[]
  ) => void;
  setAvailability: (availability: TourAvailability[]) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTime: (time: string | null) => void;
  updateTourSelection: (selection: Partial<TourSelection>) => void;
  addUpsell: (upsell: UpsellSelection) => void;
  removeUpsell: (upsellId: string) => void;
  updateUpsellQuantity: (upsellId: string, quantity: number) => void;
  clearSelection: () => void;
  
  // Computed
  isSelectionValid: boolean;
  getAvailableSlots: (date: string) => TourAvailability[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [tour, setTour] = useState<Tour | null>(null);
  const [pricing, setPricing] = useState<TourPricing | null>(null);
  const [availability, setAvailabilityState] = useState<TourAvailability[]>([]);
  const [upsells, setUpsells] = useState<UpsellWithTranslation[]>([]);
  const [selection, setSelection] = useState<BookingSelection | null>(null);
  const [selectedDate, setSelectedDateState] = useState<string | null>(null);
  const [selectedTime, setSelectedTimeState] = useState<string | null>(null);

  const setTourData = useCallback(
    (
      newTour: Tour,
      newPricing: TourPricing | null,
      newUpsells: UpsellWithTranslation[]
    ) => {
      setTour(newTour);
      setPricing(newPricing);
      setUpsells(newUpsells);
      // Reset selection when tour changes
      setSelection(null);
      setSelectedDateState(null);
      setSelectedTimeState(null);
    },
    []
  );

  const setAvailability = useCallback((newAvailability: TourAvailability[]) => {
    setAvailabilityState(newAvailability);
  }, []);

  const setSelectedDate = useCallback((date: string | null) => {
    setSelectedDateState(date);
    setSelectedTimeState(null); // Reset time when date changes
  }, []);

  const setSelectedTime = useCallback((time: string | null) => {
    setSelectedTimeState(time);
  }, []);

  const updateTourSelection = useCallback(
    (tourSelection: Partial<TourSelection>) => {
      setSelection((prev) => {
        const currentTour = prev?.tour || {
          tourId: tour?.id || '',
          tourSlug: tour?.slug || '',
          tourName: '',
          date: '',
          pax: { total: 0 },
          priceBreakdown: [],
          totalRetail: 0,
          totalNet: 0,
          currency: 'THB',
        };

        const updatedTour = { ...currentTour, ...tourSelection };

        // Calculate grand totals
        const upsellsTotal = (prev?.upsells || []).reduce(
          (sum, u) => sum + u.totalRetail,
          0
        );
        const upsellsNet = (prev?.upsells || []).reduce(
          (sum, u) => sum + u.totalNet,
          0
        );

        return {
          tour: updatedTour,
          upsells: prev?.upsells || [],
          grandTotalRetail: updatedTour.totalRetail + upsellsTotal,
          grandTotalNet: updatedTour.totalNet + upsellsNet,
          currency: updatedTour.currency,
        };
      });
    },
    [tour]
  );

  const addUpsell = useCallback((upsell: UpsellSelection) => {
    setSelection((prev) => {
      if (!prev) return prev;

      const existingIndex = prev.upsells.findIndex(
        (u) => u.upsellId === upsell.upsellId
      );

      let newUpsells: UpsellSelection[];
      if (existingIndex >= 0) {
        // Update existing
        newUpsells = [...prev.upsells];
        newUpsells[existingIndex] = upsell;
      } else {
        // Add new
        newUpsells = [...prev.upsells, upsell];
      }

      const upsellsTotal = newUpsells.reduce((sum, u) => sum + u.totalRetail, 0);
      const upsellsNet = newUpsells.reduce((sum, u) => sum + u.totalNet, 0);

      return {
        ...prev,
        upsells: newUpsells,
        grandTotalRetail: prev.tour.totalRetail + upsellsTotal,
        grandTotalNet: prev.tour.totalNet + upsellsNet,
      };
    });
  }, []);

  const removeUpsell = useCallback((upsellId: string) => {
    setSelection((prev) => {
      if (!prev) return prev;

      const newUpsells = prev.upsells.filter((u) => u.upsellId !== upsellId);
      const upsellsTotal = newUpsells.reduce((sum, u) => sum + u.totalRetail, 0);
      const upsellsNet = newUpsells.reduce((sum, u) => sum + u.totalNet, 0);

      return {
        ...prev,
        upsells: newUpsells,
        grandTotalRetail: prev.tour.totalRetail + upsellsTotal,
        grandTotalNet: prev.tour.totalNet + upsellsNet,
      };
    });
  }, []);

  const updateUpsellQuantity = useCallback(
    (upsellId: string, quantity: number) => {
      setSelection((prev) => {
        if (!prev) return prev;

        const newUpsells = prev.upsells.map((u) => {
          if (u.upsellId !== upsellId) return u;
          return {
            ...u,
            quantity,
            totalRetail: u.unitRetailPrice * quantity,
            totalNet: u.unitNetPrice * quantity,
          };
        });

        const upsellsTotal = newUpsells.reduce(
          (sum, u) => sum + u.totalRetail,
          0
        );
        const upsellsNet = newUpsells.reduce((sum, u) => sum + u.totalNet, 0);

        return {
          ...prev,
          upsells: newUpsells,
          grandTotalRetail: prev.tour.totalRetail + upsellsTotal,
          grandTotalNet: prev.tour.totalNet + upsellsNet,
        };
      });
    },
    []
  );

  const clearSelection = useCallback(() => {
    setSelection(null);
    setSelectedDateState(null);
    setSelectedTimeState(null);
  }, []);

  const getAvailableSlots = useCallback(
    (date: string): TourAvailability[] => {
      return availability.filter(
        (slot) =>
          slot.date === date &&
          slot.enabled &&
          slot.capacity - slot.booked > 0
      );
    },
    [availability]
  );

  const isSelectionValid =
    selection !== null &&
    selection.tour.date !== '' &&
    selection.tour.pax.total > 0 &&
    selection.tour.totalRetail > 0;

  return (
    <BookingContext.Provider
      value={{
        tour,
        pricing,
        availability,
        upsells,
        selection,
        selectedDate,
        selectedTime,
        setTourData,
        setAvailability,
        setSelectedDate,
        setSelectedTime,
        updateTourSelection,
        addUpsell,
        removeUpsell,
        updateUpsellQuantity,
        clearSelection,
        isSelectionValid,
        getAvailableSlots,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookingContext() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within BookingProvider');
  }
  return context;
}




