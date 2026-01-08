'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

type DateRange = 'today' | 'week' | 'month' | 'last30' | 'custom';

interface DateFilterProps {
  currentRange: DateRange;
  startDate: string;
  endDate: string;
}

export function DashboardDateFilter({ currentRange, startDate, endDate }: DateFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRangeChange = (range: DateRange) => {
    const today = new Date();
    let newStart: string;
    let newEnd: string;

    switch (range) {
      case 'today':
        newStart = newEnd = format(today, 'yyyy-MM-dd');
        break;
      case 'week':
        newStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        newEnd = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        break;
      case 'month':
        newStart = format(startOfMonth(today), 'yyyy-MM-dd');
        newEnd = format(endOfMonth(today), 'yyyy-MM-dd');
        break;
      case 'last30':
        newStart = format(subDays(today, 30), 'yyyy-MM-dd');
        newEnd = format(today, 'yyyy-MM-dd');
        break;
      default:
        return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('range', range);
    params.set('start', newStart);
    params.set('end', newEnd);
    router.push(`/admin?${params.toString()}`);
  };

  const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', 'custom');
    if (type === 'start') {
      params.set('start', value);
    } else {
      params.set('end', value);
    }
    router.push(`/admin?${params.toString()}`);
  };

  const rangeOptions = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'last30', label: 'Last 30 Days' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Quick Filters - Tabs Style */}
      <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1 shadow-sm">
        {rangeOptions.map((item) => (
          <button
            key={item.key}
            onClick={() => handleRangeChange(item.key as DateRange)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              currentRange === item.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="hidden sm:block h-8 w-px bg-gray-300" />

      {/* Custom Date Range */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleCustomDateChange('start', e.target.value)}
            className="input input-sm input-bordered bg-white border-gray-200 w-36 text-gray-900 font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          />
        </div>
        <span className="text-gray-400 font-medium text-sm">to</span>
        <div className="relative">
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleCustomDateChange('end', e.target.value)}
            className="input input-sm input-bordered bg-white border-gray-200 w-36 text-gray-900 font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          />
        </div>
      </div>
    </div>
  );
}
