'use client';

import Link from 'next/link';
import { LogOut, Settings, User } from 'lucide-react';

import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/hooks/use-auth';
import { Avatar } from '@/components/ui/avatar';
import { NotificationBell } from '@/components/notifications/notification-bell';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface DashboardHeaderProps {
  children?: React.ReactNode;
}

export function DashboardHeader({ children }: DashboardHeaderProps) {
  const { user, logout } = useAuthStore();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6">
      {/* Left: breadcrumb or custom content */}
      <div className="flex items-center gap-4">
        {children}
      </div>

      {/* Right: notifications + user menu */}
      <div className="flex items-center gap-3">
        <NotificationBell onClick={() => window.location.href = '/dashboard/notifications'} />
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
            <Avatar src={user?.avatarUrl} fallback={user?.name || 'U'} size="sm" />
            <span className="hidden text-sm font-medium text-foreground md:block">
              {user?.name}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-muted">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/dashboard/profile" className="flex w-full items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/dashboard/profile" className="flex w-full items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void logout()}>
              <span className="flex items-center gap-2 text-error-500">
                <LogOut className="h-4 w-4" />
                Log out
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
