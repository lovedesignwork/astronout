'use client';

interface CountryData {
  countryCode: string;
  countryName: string;
  visitCount: number;
  uniqueVisitors: number;
}

interface CountryBreakdownProps {
  data: CountryData[];
}

// Country flag emoji from country code
function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode === 'XX' || countryCode.length !== 2) {
    return '🌍';
  }
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Get color for bar based on index
function getBarColor(index: number): string {
  const colors = [
    'bg-gradient-to-r from-cyan-500 to-blue-500',
    'bg-gradient-to-r from-purple-500 to-pink-500',
    'bg-gradient-to-r from-green-500 to-emerald-500',
    'bg-gradient-to-r from-orange-500 to-amber-500',
    'bg-gradient-to-r from-red-500 to-rose-500',
    'bg-gradient-to-r from-indigo-500 to-violet-500',
    'bg-gradient-to-r from-teal-500 to-cyan-500',
    'bg-gradient-to-r from-fuchsia-500 to-pink-500',
    'bg-gradient-to-r from-lime-500 to-green-500',
    'bg-gradient-to-r from-sky-500 to-blue-500',
  ];
  return colors[index % colors.length];
}

export function CountryBreakdown({ data }: CountryBreakdownProps) {
  const maxVisits = Math.max(...data.map(d => d.visitCount), 1);
  const totalVisits = data.reduce((sum, d) => sum + d.visitCount, 0);

  if (data.length === 0) {
    return (
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Countries</h3>
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <span className="text-4xl">🌍</span>
              <p className="mt-3 text-sm text-gray-500">No geographic data available yet</p>
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
          <h3 className="text-lg font-bold text-gray-900">Top Countries</h3>
          <span className="text-sm text-gray-500">{data.length} countries</span>
        </div>

        <div className="space-y-3">
          {data.map((country, index) => {
            const percentage = totalVisits > 0 
              ? ((country.visitCount / totalVisits) * 100).toFixed(1) 
              : '0';
            const barWidth = (country.visitCount / maxVisits) * 100;

            return (
              <div key={country.countryCode} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl flex-shrink-0" role="img" aria-label={country.countryName}>
                      {getCountryFlag(country.countryCode)}
                    </span>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {country.countryName || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {country.uniqueVisitors.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getBarColor(index)}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Total from top {data.length} countries</span>
            <span className="font-semibold text-gray-900">{totalVisits.toLocaleString()} visits</span>
          </div>
        </div>
      </div>
    </div>
  );
}




