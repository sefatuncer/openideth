'use client';

import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'flex h-10 w-full appearance-none rounded-md border bg-background px-3 py-2 pr-8 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error ? 'border-error-500 focus:ring-error-500' : 'border-border',
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        </div>
        {error && (
          <p id={`${selectId}-error`} className="text-sm text-error-500">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';

export { Select };
export type { SelectProps, SelectOption };
