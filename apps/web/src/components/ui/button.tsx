'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
  outline:
    'border border-border bg-transparent text-foreground hover:bg-primary-50 focus-visible:ring-primary-500',
  ghost: 'bg-transparent text-foreground hover:bg-primary-50 focus-visible:ring-primary-500',
  destructive: 'bg-error-500 text-white hover:bg-error-700 focus-visible:ring-error-500',
};

const sizes = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
