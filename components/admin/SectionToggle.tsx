'use client';

import { useState } from 'react';

interface SectionToggleProps {
  title: string;
  description?: string;
  enabled: boolean;
  expanded?: boolean;
  onToggle: (enabled: boolean) => void;
  onExpandChange?: (expanded: boolean) => void;
  children: React.ReactNode;
  badge?: string;
  icon?: React.ReactNode;
}

export function SectionToggle({
  title,
  description,
  enabled,
  expanded: controlledExpanded,
  onToggle,
  onExpandChange,
  children,
  badge,
  icon,
}: SectionToggleProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = controlledExpanded ?? internalExpanded;

  const handleExpandChange = () => {
    const newExpanded = !expanded;
    if (onExpandChange) {
      onExpandChange(newExpanded);
    } else {
      setInternalExpanded(newExpanded);
    }
  };

  return (
    <div className={`rounded-xl border bg-white transition-all ${enabled ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          type="button"
          onClick={handleExpandChange}
          className="flex flex-1 items-center gap-3 text-left"
        >
          {/* Icon */}
          {icon && (
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${enabled ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'}`}>
              {icon}
            </div>
          )}
          
          {/* Title & Description */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-semibold ${enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                {title}
              </h3>
              {badge && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="mt-0.5 text-xs text-gray-400 truncate">{description}</p>
            )}
          </div>

          {/* Expand Chevron */}
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={() => onToggle(!enabled)}
          className={`relative ml-4 h-6 w-11 shrink-0 rounded-full transition-colors ${
            enabled ? 'bg-emerald-500' : 'bg-gray-200'
          }`}
          aria-label={enabled ? 'Disable section' : 'Enable section'}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
              enabled ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>

      {/* Content */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-5">
          {children}
        </div>
      )}
    </div>
  );
}




