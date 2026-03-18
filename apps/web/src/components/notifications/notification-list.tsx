'use client';

import { Bell, CheckCheck } from 'lucide-react';

import { cn, formatDate } from '@/lib/utils';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationListProps {
  unreadOnly?: boolean;
}

export function NotificationList({ unreadOnly = false }: NotificationListProps) {
  const { data, isLoading } = useNotifications(1, 20, unreadOnly);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 rounded-lg border border-border p-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="mb-3 h-10 w-10 text-muted" />
        <p className="text-sm text-muted">No notifications yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted">
          {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => markAllAsRead.mutate()}
          loading={markAllAsRead.isPending}
        >
          <CheckCheck className="mr-1 h-4 w-4" />
          Mark all read
        </Button>
      </div>

      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-4 transition-colors',
              n.isRead ? 'border-border bg-card' : 'border-primary-200 bg-primary-50/30',
            )}
          >
            <div className={cn(
              'mt-0.5 h-2 w-2 shrink-0 rounded-full',
              n.isRead ? 'bg-transparent' : 'bg-primary-600',
            )} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{n.title}</p>
              <p className="mt-0.5 text-sm text-muted line-clamp-2">{n.message}</p>
              <p className="mt-1 text-xs text-muted">{formatDate(n.createdAt, 'MMM d, yyyy HH:mm')}</p>
            </div>
            {!n.isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAsRead.mutate(n.id)}
                className="shrink-0 text-xs"
              >
                Mark read
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
