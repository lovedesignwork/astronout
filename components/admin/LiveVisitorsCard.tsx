'use client';

import { useEffect, useState, useCallback } from 'react';

interface LiveVisitorsCardProps {
  initialCount?: number;
}

export function LiveVisitorsCard({ initialCount = 0 }: LiveVisitorsCardProps) {
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);

  const fetchLiveCount = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/analytics?type=live');
      if (response.ok) {
        const data = await response.json();
        const newCount = data.count || 0;
        
        // Trigger pulse animation if count changed
        if (newCount !== count) {
          setIsPulsing(true);
          setTimeout(() => setIsPulsing(false), 500);
        }
        
        setCount(newCount);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching live visitors:', error);
    } finally {
      setIsLoading(false);
    }
  }, [count]);

  // Initial fetch and polling
  useEffect(() => {
    fetchLiveCount();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchLiveCount, 30000);
    
    return () => clearInterval(interval);
  }, [fetchLiveCount]);

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    return `${diffMins}m ago`;
  };

  return (
    <div className="card bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg border-0 text-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>
      
      <div className="card-body p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {/* Live indicator dot */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <h3 className="text-lg font-bold">Live Visitors</h3>
          </div>
          
          <button 
            onClick={fetchLiveCount}
            disabled={isLoading}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <svg 
              className={`size-4 ${isLoading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-end gap-2">
          <span 
            className={`text-5xl font-bold tracking-tight transition-transform ${isPulsing ? 'scale-110' : 'scale-100'}`}
          >
            {count}
          </span>
          <span className="text-xl font-medium text-white/80 mb-1">
            {count === 1 ? 'visitor' : 'visitors'}
          </span>
        </div>
        
        <p className="text-sm text-white/70 mt-3">
          Currently browsing your website
        </p>
        
        <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-sm">
          <span className="text-white/60">Last updated: {formatLastUpdated()}</span>
          <span className="text-white/60 flex items-center gap-1">
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Updates every 30s
          </span>
        </div>
      </div>
    </div>
  );
}




