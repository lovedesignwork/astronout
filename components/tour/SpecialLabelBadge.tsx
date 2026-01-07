import type { SpecialLabel } from '@/types';

interface SpecialLabelBadgeProps {
  label: SpecialLabel;
  size?: 'sm' | 'md';
}

export function SpecialLabelBadge({ label, size = 'md' }: SpecialLabelBadgeProps) {
  const sizeClasses = size === 'sm' 
    ? 'text-[10px] py-0.5 -right-7 top-2 w-24'
    : 'text-xs py-1 -right-8 top-3 w-28';

  return (
    <div
      className={`absolute ${sizeClasses} text-center font-semibold shadow-sm z-10`}
      style={{
        backgroundColor: label.background_color,
        color: label.text_color,
        transform: 'rotate(45deg)',
      }}
    >
      {label.name}
    </div>
  );
}

// Simplified version that takes raw props instead of label object
interface SpecialLabelBadgeSimpleProps {
  name: string;
  backgroundColor: string;
  textColor: string;
  size?: 'sm' | 'md';
}

export function SpecialLabelBadgeSimple({ 
  name, 
  backgroundColor, 
  textColor, 
  size = 'md' 
}: SpecialLabelBadgeSimpleProps) {
  const sizeClasses = size === 'sm' 
    ? 'text-[10px] py-0.5 -right-7 top-2 w-24'
    : 'text-xs py-1 -right-8 top-3 w-28';

  return (
    <div
      className={`absolute ${sizeClasses} text-center font-semibold shadow-sm z-10`}
      style={{
        backgroundColor,
        color: textColor,
        transform: 'rotate(45deg)',
      }}
    >
      {name}
    </div>
  );
}




