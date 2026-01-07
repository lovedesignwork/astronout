'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface WishlistItem {
  tourId: string;
  tourSlug: string;
  tourTitle: string;
  imageUrl?: string;
  minPrice?: number;
  currency?: string;
  addedAt: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: Omit<WishlistItem, 'addedAt'>) => void;
  removeFromWishlist: (tourId: string) => void;
  isInWishlist: (tourId: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'astronout_wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setWishlist(parsed);
      }
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
    }
    setIsHydrated(true);
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
      } catch (error) {
        console.error('Error saving wishlist to localStorage:', error);
      }
    }
  }, [wishlist, isHydrated]);

  const addToWishlist = useCallback((item: Omit<WishlistItem, 'addedAt'>) => {
    setWishlist((prev) => {
      // Check if already in wishlist
      if (prev.some((w) => w.tourId === item.tourId)) {
        return prev;
      }
      
      const newItem: WishlistItem = {
        ...item,
        addedAt: new Date().toISOString(),
      };
      
      return [newItem, ...prev];
    });
  }, []);

  const removeFromWishlist = useCallback((tourId: string) => {
    setWishlist((prev) => prev.filter((item) => item.tourId !== tourId));
  }, []);

  const isInWishlist = useCallback(
    (tourId: string) => {
      return wishlist.some((item) => item.tourId === tourId);
    },
    [wishlist]
  );

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  const value: WishlistContextType = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount: wishlist.length,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}




