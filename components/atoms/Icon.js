import { cn } from '@/lib/utils';

export default function Icon({ icon: IconComponent, size = 24, className, ...props }) {
  return (
    <IconComponent
      size={size}
      className={cn('text-current', className)}
      {...props}
    />
  );
}