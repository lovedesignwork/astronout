'use client';

interface TopPage {
  pagePath: string;
  visitCount: number;
  uniqueVisitors: number;
}

interface TopPagesChartProps {
  data: TopPage[];
}

// Format page path for display
function formatPagePath(path: string): string {
  if (path === '/') return 'Home';
  
  // Extract meaningful parts from the path
  const parts = path.split('/').filter(Boolean);
  
  // Handle language prefixed paths
  const langCodes = ['en', 'zh', 'ru', 'ko', 'ja', 'fr', 'it', 'es', 'id'];
  if (parts.length > 0 && langCodes.includes(parts[0])) {
    parts.shift(); // Remove language code
  }
  
  if (parts.length === 0) return 'Home';
  
  // Format the path
  if (parts[0] === 'tours' && parts.length > 1) {
    // Tour detail page
    return `Tour: ${parts[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
  }
  
  if (parts[0] === 'checkout') return 'Checkout';
  if (parts[0] === 'booking' && parts[1] === 'confirmation') return 'Booking Confirmation';
  if (parts[0] === 'wishlist') return 'Wishlist';
  
  // Default: capitalize first part
  return parts[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Get icon for page type
function getPageIcon(path: string): React.ReactNode {
  if (path === '/' || path.endsWith('/en') || path.endsWith('/zh')) {
    return (
      <svg className="size-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    );
  }
  
  if (path.includes('/tours/')) {
    return (
      <svg className="size-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    );
  }
  
  if (path.includes('/checkout')) {
    return (
      <svg className="size-4 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
    );
  }
  
  return (
    <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

export function TopPagesChart({ data }: TopPagesChartProps) {
  const maxVisits = Math.max(...data.map(d => d.visitCount), 1);

  if (data.length === 0) {
    return (
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Pages</h3>
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <svg className="mx-auto size-12 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="mt-3 text-sm text-gray-500">No page data available yet</p>
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
          <h3 className="text-lg font-bold text-gray-900">Top Pages</h3>
          <span className="text-sm text-gray-500">By views</span>
        </div>

        <div className="space-y-3">
          {data.map((page, index) => {
            const barWidth = (page.visitCount / maxVisits) * 100;

            return (
              <div key={page.pagePath} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="flex-shrink-0 flex items-center justify-center size-6 rounded-full bg-gray-100">
                      {getPageIcon(page.pagePath)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {formatPagePath(page.pagePath)}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{page.pagePath}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 ml-2">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {page.visitCount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {page.uniqueVisitors.toLocaleString()} unique
                      </p>
                    </div>
                    <span className="flex items-center justify-center size-6 rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-8">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
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



