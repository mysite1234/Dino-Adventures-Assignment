import { cn } from '@/lib/utils';

const textVariants = {
  h1: 'text-4xl font-bold tracking-tight',
  h2: 'text-3xl font-semibold tracking-tight',
  h3: 'text-2xl font-semibold',
  h4: 'text-xl font-semibold',
  h5: 'text-lg font-semibold',
  h6: 'text-base font-semibold',
  body: 'text-base',
  small: 'text-sm',
  caption: 'text-xs text-gray-600',
};

export default function Text({ 
  variant = 'body', 
  children, 
  className, 
  as: Component = 'p',
  ...props 
}) {
  return (
    <Component
      className={cn(textVariants[variant], className)}
      {...props}
    >
      {children}
    </Component>
  );
}