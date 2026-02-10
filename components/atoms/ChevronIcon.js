import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChevronIcon({ isOpen, className, size = 16 }) {
  const IconComponent = isOpen ? ChevronDown : ChevronRight;
  
  return (
    <IconComponent
      size={size}
      className={cn(
        'transition-transform duration-200 ease-in-out',
        isOpen && 'rotate-0',
        !isOpen && 'rotate-0',
        className
      )}
    />
  );
}