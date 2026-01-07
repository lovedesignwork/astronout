'use client';

interface TrafficSource {
  source: string;
  visitCount: number;
  percentage: number;
}

interface TrafficSourcesChartProps {
  data: TrafficSource[];
}

// Get icon for traffic source
function getSourceIcon(source: string): React.ReactNode {
  const sourceLower = source.toLowerCase();
  
  if (sourceLower === 'direct') {
    return (
      <svg className="size-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    );
  }
  
  if (sourceLower.includes('google')) {
    return <span className="text-base">🔍</span>;
  }
  
  if (sourceLower.includes('facebook') || sourceLower.includes('fb.com')) {
    return <span className="text-base">📘</span>;
  }
  
  if (sourceLower.includes('instagram')) {
    return <span className="text-base">📷</span>;
  }
  
  if (sourceLower.includes('twitter') || sourceLower.includes('x.com')) {
    return <span className="text-base">🐦</span>;
  }
  
  if (sourceLower.includes('youtube')) {
    return <span className="text-base">▶️</span>;
  }
  
  if (sourceLower.includes('tiktok')) {
    return <span className="text-base">🎵</span>;
  }
  
  if (sourceLower.includes('linkedin')) {
    return <span className="text-base">💼</span>;
  }
  
  if (sourceLower.includes('reddit')) {
    return <span className="text-base">🤖</span>;
  }
  
  if (sourceLower.includes('tripadvisor')) {
    return <span className="text-base">🦉</span>;
  }
  
  return (
    <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

// Get color for bar based on source type
function getBarColor(source: string, index: number): string {
  const sourceLower = source.toLowerCase();
  
  if (sourceLower === 'direct') return 'bg-gradient-to-r from-blue-500 to-cyan-500';
  if (sourceLower.includes('google')) return 'bg-gradient-to-r from-red-500 to-orange-500';
  if (sourceLower.includes('facebook')) return 'bg-gradient-to-r from-blue-600 to-blue-500';
  if (sourceLower.includes('instagram')) return 'bg-gradient-to-r from-purple-500 to-pink-500';
  if (sourceLower.includes('twitter') || sourceLower.includes('x.com')) return 'bg-gradient-to-r from-sky-500 to-blue-500';
  if (sourceLower.includes('youtube')) return 'bg-gradient-to-r from-red-600 to-red-500';
  if (sourceLower.includes('tiktok')) return 'bg-gradient-to-r from-gray-900 to-gray-700';
  if (sourceLower.includes('linkedin')) return 'bg-gradient-to-r from-blue-700 to-blue-600';
  
  const colors = [
    'bg-gradient-to-r from-emerald-500 to-teal-500',
    'bg-gradient-to-r from-amber-500 to-yellow-500',
    'bg-gradient-to-r from-violet-500 to-purple-500',
    'bg-gradient-to-r from-rose-500 to-pink-500',
    'bg-gradient-to-r from-indigo-500 to-blue-500',
  ];
  
  return colors[index % colors.length];
}

// Categorize source
function categorizeSource(source: string): string {
  const sourceLower = source.toLowerCase();
  
  if (sourceLower === 'direct') return 'Direct';
  if (sourceLower.includes('google') || sourceLower.includes('bing') || sourceLower.includes('yahoo') || sourceLower.includes('duckduckgo')) {
    return 'Search';
  }
  if (sourceLower.includes('facebook') || sourceLower.includes('instagram') || sourceLower.includes('twitter') || 
      sourceLower.includes('tiktok') || sourceLower.includes('linkedin') || sourceLower.includes('pinterest') ||
      sourceLower.includes('reddit') || sourceLower.includes('x.com')) {
    return 'Social';
  }
  return 'Referral';
}

export function TrafficSourcesChart({ data }: TrafficSourcesChartProps) {
  const maxVisits = Math.max(...data.map(d => d.visitCount), 1);
  const totalVisits = data.reduce((sum, d) => sum + d.visitCount, 0);

  // Calculate category totals
  const categoryTotals = data.reduce((acc, source) => {
    const category = categorizeSource(source.source);
    acc[category] = (acc[category] || 0) + source.visitCount;
    return acc;
  }, {} as Record<string, number>);

  if (data.length === 0) {
    return (
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Traffic Sources</h3>
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <svg className="mx-auto size-12 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              <p className="mt-3 text-sm text-gray-500">No traffic source data available yet</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-white shadow-sm border border-gray-200">
      <div className="card-body p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Traffic Sources</h3>
          <span className="text-sm text-gray-500">Where visitors come from</span>
        </div>

        {/* Category Summary */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {['Direct', 'Search', 'Social', 'Referral'].map((category) => {
            const count = categoryTotals[category] || 0;
            const pct = totalVisits > 0 ? ((count / totalVisits) * 100).toFixed(0) : '0';
            return (
              <div key={category} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{pct}%</p>
                <p className="text-xs text-gray-500">{category}</p>
              </div>
            );
          })}
        </div>

        {/* Source List */}
        <div className="space-y-3">
          {data.map((source, index) => {
            const barWidth = (source.visitCount / maxVisits) * 100;

            return (
              <div key={source.source} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex-shrink-0 flex items-center justify-center size-6">
                      {getSourceIcon(source.source)}
                    </span>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-gray-900 truncate block">
                        {source.source}
                      </span>
                      <span className="text-xs text-gray-400">
                        {categorizeSource(source.source)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {source.visitCount.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 w-12 text-right">
                      {source.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden ml-8">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getBarColor(source.source, index)}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}




