'use client';

import { useState } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isBefore, startOfDay, isToday } from 'date-fns';
import type { TourAvailability } from '@/types';

interface AvailabilityCalendarProps {
  availability: TourAvailability[];
  selectedDate: string | null;
  selectedTime: string | null;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string | null) => void;
}

export function AvailabilityCalendar({ 
  availability, 
  selectedDate, 
  onDateSelect 
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get days in current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get available dates
  const availableDates = new Set(
    availability
      .filter((a) => a.enabled && a.capacity - a.booked > 0)
      .map((a) => a.date)
  );

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (availableDates.has(dateStr)) {
      onDateSelect(dateStr);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const getDayClasses = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const isAvailable = availableDates.has(dateStr);
    const isSelected = selectedDate === dateStr;
    const isPast = isBefore(day, startOfDay(new Date()));
    const isCurrentMonth = isSameMonth(day, currentMonth);

    let classes = 'w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all ';

    if (!isCurrentMonth) {
      classes += 'text-gray-300 ';
    } else if (isPast) {
      classes += 'text-gray-300 cursor-not-allowed ';
    } else if (isSelected) {
      classes += 'text-white ';
    } else if (isAvailable) {
      classes += 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer ';
    } else {
      classes += 'text-gray-400 cursor-not-allowed ';
    }

    if (isToday(day)) {
      classes += 'ring-2 ring-offset-2 ';
    }

    return classes;
  };

  const getDayStyle = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const isSelected = selectedDate === dateStr;
    const isTodayDate = isToday(day);
    
    if (isSelected) {
      return { backgroundColor: '#008EE6' };
    }
    if (isTodayDate) {
      return { 
        '--tw-ring-color': '#008EE6',
        boxShadow: '0 0 0 2px #fff, 0 0 0 4px #008EE6'
      } as React.CSSProperties;
    }
    return {};
  };

  return (
    <>
      {/* Calendar Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="rounded-lg p-2 hover:bg-gray-100"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={handleNextMonth}
          className="rounded-lg p-2 hover:bg-gray-100"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month start */}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10" />
        ))}

        {/* Days */}
        {days.map((day) => (
          <div key={day.toISOString()} className="flex items-center justify-center">
            <button
              onClick={() => handleDateClick(day)}
              disabled={
                !availableDates.has(format(day, 'yyyy-MM-dd')) ||
                isBefore(day, startOfDay(new Date()))
              }
              className={getDayClasses(day)}
              style={getDayStyle(day)}
            >
              {format(day, 'd')}
            </button>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-100" />
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: '#008EE6' }} />
          <span className="text-gray-600">Selected</span>
        </div>
      </div>
    </>
  );
}
