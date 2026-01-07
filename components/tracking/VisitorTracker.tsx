'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

// Generate a unique session ID that persists across page navigations
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  const storageKey = 'visitor_session_id';
  let sessionId = sessionStorage.getItem(storageKey);
  
  if (!sessionId) {
    // Generate a unique session ID
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
}

// Track if this is a fresh session
function isNewSession(): boolean {
  if (typeof window === 'undefined') return false;
  
  const key = 'visitor_session_started';
  const started = sessionStorage.getItem(key);
  
  if (!started) {
    sessionStorage.setItem(key, 'true');
    return true;
  }
  
  return false;
}

export function VisitorTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string>('');
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const sessionId = useRef<string>('');
  
  const sendTrackingData = useCallback(async (type: 'pageview' | 'heartbeat') => {
    try {
      if (!sessionId.current) {
        sessionId.current = getOrCreateSessionId();
      }
      
      const payload = {
        pagePath: pathname,
        sessionId: sessionId.current,
        referrer: document.referrer || undefined,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        language: navigator.language,
        userAgent: navigator.userAgent,
        type,
      };
      
      // Use sendBeacon for heartbeats (more reliable, non-blocking)
      if (type === 'heartbeat' && navigator.sendBeacon) {
        navigator.sendBeacon('/api/track', JSON.stringify(payload));
      } else {
        await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        });
      }
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.debug('Tracking error:', error);
    }
  }, [pathname]);
  
  // Track page views
  useEffect(() => {
    // Initialize session ID
    if (!sessionId.current) {
      sessionId.current = getOrCreateSessionId();
    }
    
    // Only track if path has changed (prevents double tracking on mount)
    if (pathname !== lastTrackedPath.current) {
      lastTrackedPath.current = pathname;
      
      // Small delay to ensure page has loaded
      const timeout = setTimeout(() => {
        sendTrackingData('pageview');
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [pathname, sendTrackingData]);
  
  // Setup heartbeat for real-time tracking
  useEffect(() => {
    // Send initial heartbeat
    const initialHeartbeat = setTimeout(() => {
      sendTrackingData('heartbeat');
    }, 5000); // 5 seconds after page load
    
    // Setup recurring heartbeat every 30 seconds
    heartbeatInterval.current = setInterval(() => {
      sendTrackingData('heartbeat');
    }, 30000);
    
    // Cleanup on unmount or page change
    return () => {
      clearTimeout(initialHeartbeat);
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    };
  }, [sendTrackingData]);
  
  // Track when user leaves
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Send final heartbeat using sendBeacon (more reliable on page unload)
      if (navigator.sendBeacon && sessionId.current) {
        const payload = {
          pagePath: pathname,
          sessionId: sessionId.current,
          type: 'heartbeat',
        };
        navigator.sendBeacon('/api/track', JSON.stringify(payload));
      }
    };
    
    // Track visibility changes (user switches tabs)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendTrackingData('heartbeat');
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname, sendTrackingData]);
  
  // This component doesn't render anything
  return null;
}




