'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface BookingStatusChartProps {
  data: { status: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#EAB308',
  pending_payment: '#F97316',
  confirmed: '#22C55E',
  completed: '#3B82F6',
  cancelled: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  pending_payment: 'Pending Payment',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function BookingStatusChart({ data }: BookingStatusChartProps) {
  const chartData = data.map(item => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    color: STATUS_COLORS[item.status] || '#9CA3AF',
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Bookings by Status</h3>
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <svg className="mx-auto size-12 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
              </svg>
              <p className="mt-3 text-sm text-gray-500">No booking data available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-white shadow-sm border border-gray-200">
      <div className="card-body p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Bookings by Status</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg bg-gray-900 px-3 py-2 shadow-lg">
                        <p className="text-sm font-medium text-white">{data.name}</p>
                        <p className="text-sm text-gray-300">
                          {data.value} ({((data.value / total) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-gray-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Stats below chart */}
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{total}</p>
            <p className="text-xs text-gray-500">Total Bookings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {chartData.find(d => d.name === 'Confirmed')?.value || 0}
            </p>
            <p className="text-xs text-gray-500">Confirmed</p>
          </div>
        </div>
      </div>
    </div>
  );
}





