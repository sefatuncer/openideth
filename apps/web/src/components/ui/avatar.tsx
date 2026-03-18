'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: keyof typeof sizeClasses;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function Avatar({ src, alt, fallback, size = 'md', className, ...props }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;
  const initials = fallback ? getInitials(fallback) : '?';

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-primary-700 font-medium',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || fallback || 'Avatar'}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span aria-label={alt || fallback}>{initials}</span>
      )}
    </div>
  );
}

export { Avatar };
export type { AvatarProps };
