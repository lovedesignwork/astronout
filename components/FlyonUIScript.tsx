'use client';

import { useEffect } from 'react';

export function FlyonUIScript() {
  useEffect(() => {
    const loadFlyonUI = async () => {
      try {
        // @ts-expect-error - FlyonUI doesn't have types
        await import('flyonui/flyonui');
      } catch (error) {
        console.warn('FlyonUI JS failed to load:', error);
      }
    };
    loadFlyonUI();
  }, []);

  return null;
}




