'use client';

interface DeviceData {
  deviceType: string;
  visitCount: number;
  percentage: number;
}

interface BrowserData {
  browser: string;
  visitCount: number;
  percentage: number;
}

interface DeviceBreakdownProps {
  devices: DeviceData[];
  browsers: BrowserData[];
}

// Get icon and color for device type
function getDeviceInfo(deviceType: string): { icon: React.ReactNode; color: string; bgColor: string } {
  switch (deviceType.toLowerCase()) {
    case 'desktop':
      return {
        icon: (
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
          </svg>
        ),
        color: 'text-blue-600',
        bgColor: 'bg-blue-500',
      };
    case 'mobile':
      return {
        icon: (
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
        ),
        color: 'text-green-600',
        bgColor: 'bg-green-500',
      };
    case 'tablet':
      return {
        icon: (
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25v-15a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z" />
          </svg>
        ),
        color: 'text-purple-600',
        bgColor: 'bg-purple-500',
      };
    default:
      return {
        icon: (
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        ),
        color: 'text-gray-600',
        bgColor: 'bg-gray-400',
      };
  }
}

// Get browser icon/emoji
function getBrowserIcon(browser: string): string {
  const browserLower = browser.toLowerCase();
  if (browserLower.includes('chrome')) return '🌐';
  if (browserLower.includes('safari')) return '🧭';
  if (browserLower.includes('firefox')) return '🦊';
  if (browserLower.includes('edge')) return '🌊';
  if (browserLower.includes('opera')) return '🎭';
  if (browserLower.includes('ie') || browserLower.includes('internet explorer')) return '📘';
  return '🔍';
}

// Simple pie chart using CSS conic-gradient
function PieChart({ data, getColor }: { data: { label: string; percentage: number }[]; getColor: (label: string) => string }) {
  const total = data.reduce((sum, d) => sum + d.percentage, 0);
  let cumulative = 0;
  
  const gradientParts = data.map((d) => {
    const start = cumulative;
    cumulative += (d.percentage / total) * 100;
    return `${getColor(d.label)} ${start}% ${cumulative}%`;
  });
  
  const gradient = `conic-gradient(${gradientParts.join(', ')})`;
  
  return (
    <div 
      className="size-32 rounded-full shadow-inner"
      style={{ background: gradient }}
    />
  );
}

export function DeviceBreakdown({ devices, browsers }: DeviceBreakdownProps) {
  const hasDeviceData = devices.length > 0;
  const hasBrowserData = browsers.length > 0;

  const deviceColors: Record<string, string> = {
    desktop: '#3B82F6',
    mobile: '#22C55E',
    tablet: '#A855F7',
    unknown: '#9CA3AF',
  };

  const browserColors = [
    '#3B82F6', '#22C55E', '#F97316', '#EF4444', '#A855F7', 
    '#EC4899', '#14B8A6', '#F59E0B', '#6366F1', '#8B5CF6'
  ];

  if (!hasDeviceData && !hasBrowserData) {
    return (
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Devices & Browsers</h3>
          <div className="flex h-48 items-center justify-center">
            <div className="text-center">
              <svg className="mx-auto size-12 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
              <p className="mt-3 text-sm text-gray-500">No device data available yet</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-white shadow-sm border border-gray-200">
      <div className="card-body p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Devices & Browsers</h3>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Devices Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Device Types</h4>
            
            {hasDeviceData ? (
              <>
                <div className="flex justify-center mb-4">
                  <PieChart 
                    data={devices.map(d => ({ label: d.deviceType, percentage: d.percentage }))}
                    getColor={(label) => deviceColors[label.toLowerCase()] || deviceColors.unknown}
                  />
                </div>
                
                <div className="space-y-2">
                  {devices.map((device) => {
                    const { icon, color, bgColor } = getDeviceInfo(device.deviceType);
                    return (
                      <div key={device.deviceType} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`size-3 rounded-full ${bgColor}`} />
                          <span className={`${color}`}>{icon}</span>
                          <span className="text-sm text-gray-700 capitalize">{device.deviceType}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{device.percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No data</p>
            )}
          </div>

          {/* Browsers Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Browsers</h4>
            
            {hasBrowserData ? (
              <>
                <div className="flex justify-center mb-4">
                  <PieChart 
                    data={browsers.map(b => ({ label: b.browser, percentage: b.percentage }))}
                    getColor={(label) => browserColors[browsers.findIndex(b => b.browser === label) % browserColors.length]}
                  />
                </div>
                
                <div className="space-y-2">
                  {browsers.slice(0, 5).map((browser, index) => (
                    <div key={browser.browser} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="size-3 rounded-full" 
                          style={{ backgroundColor: browserColors[index % browserColors.length] }}
                        />
                        <span className="text-base">{getBrowserIcon(browser.browser)}</span>
                        <span className="text-sm text-gray-700">{browser.browser}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{browser.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



