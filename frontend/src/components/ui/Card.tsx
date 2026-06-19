import { ElementType, ReactNode, ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps<T extends ElementType = 'div'> {
  as?: T;
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'responsive';
  interactive?: boolean;
  hoverEffect?: 'none' | 'lift' | 'glow';
  hoverColor?: 'indigo' | 'emerald' | 'purple' | 'rose' | 'neutral';
  className?: string;
  gradientBackground?: boolean;
}

export function Card<T extends ElementType = 'div'>({
  as,
  children,
  padding = 'md',
  interactive = false,
  hoverEffect = 'none',
  hoverColor = 'neutral',
  className,
  gradientBackground = false,
  ...props
}: CardProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof CardProps<T>>) {
  const Component = as || (interactive ? 'button' : 'div');

  const baseStyles = 'bg-white border rounded-2xl relative transition-all duration-300 text-left';

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
    responsive: 'p-4 sm:p-6',
  }[padding];

  const interactiveStyles = interactive
    ? 'cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 block'
    : '';

  let borderStyles = 'border-neutral-100 shadow-sm';

  let effectStyles = '';
  if (hoverEffect === 'lift') {
    effectStyles = 'hover:-translate-y-1 hover:shadow-lg hover:border-neutral-200';
  } else if (hoverEffect === 'glow') {
    const colorMap = {
      indigo: 'hover:border-indigo-300 hover:shadow-indigo-50/50',
      emerald: 'hover:border-emerald-300 hover:shadow-emerald-50/50',
      purple: 'hover:border-purple-300 hover:shadow-purple-50/50',
      rose: 'hover:border-rose-300 hover:shadow-rose-50/50',
      neutral: 'hover:border-neutral-200 hover:shadow-neutral-200/50',
    };
    effectStyles = `hover:-translate-y-1 hover:shadow-xl ${colorMap[hoverColor]}`;
  }

  return (
    <Component
      className={cn(baseStyles, paddingStyles, interactiveStyles, borderStyles, effectStyles, className)}
      {...props}
    >
      {gradientBackground && hoverEffect === 'glow' && (
        <div
          className={cn(
            'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl',
            {
              'bg-gradient-to-br from-indigo-50/50 to-transparent': hoverColor === 'indigo',
              'bg-gradient-to-br from-emerald-50/50 to-transparent': hoverColor === 'emerald',
              'bg-gradient-to-br from-purple-50/50 to-transparent': hoverColor === 'purple',
              'bg-gradient-to-br from-rose-50/50 to-transparent': hoverColor === 'rose',
              'bg-gradient-to-br from-neutral-50/50 to-transparent': hoverColor === 'neutral',
            }
          )}
        />
      )}
      {children}
    </Component>
  );
}
