'use client';

import { useEffect } from 'react';

export function FlyonUIScript() {
  useEffect(() => {
    const loadFlyonUI = async () => {
      try {
        await import('flyonui/flyonui');
      } catch (error) {
        console.warn('FlyonUI JS failed to load:', error);
      }
    };
    loadFlyonUI();
  }, []);

  return null;
}




