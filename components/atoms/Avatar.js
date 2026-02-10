import { cn } from '@/lib/utils';

export default function Avatar({ src, alt, size = 'md', className }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={cn('relative inline-block rounded-full overflow-hidden', sizeClasses[size], className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full bg-gray-300 flex items-center justify-center">
          <span className="text-gray-600 font-medium">
            {alt?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
      )}
    </div>
  );
}