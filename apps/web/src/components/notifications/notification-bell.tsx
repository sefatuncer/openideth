'use client';

import { Bell } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useUnreadCount } from '@/hooks/use-notifications';

interface NotificationBellProps {
  onClick?: () => void;
  className?: string;
}

export function NotificationBell({ onClick, className }: NotificationBellProps) {
  const { data } = useUnreadCount();
  const count = data?.count ?? 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative rounded-full p-2 text-muted transition-colors hover:bg-primary-50 hover:text-foreground',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        className,
      )}
      aria-label={count > 0 ? `${count} unread notifications` : 'Notifications'}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
