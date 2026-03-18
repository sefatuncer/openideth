'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  FileText,
  CreditCard,
  Heart,
  LayoutDashboard,
  Shield,
  Users,
  AlertTriangle,
  BarChart3,
  UserCheck,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/hooks/use-auth';
import { UserRole } from '@openideth/shared';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tenantNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/agreements', label: 'Agreements', icon: FileText },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/favorites', label: 'Favorites', icon: Heart },
  { href: '/dashboard/kyc', label: 'KYC Verification', icon: UserCheck },
];

const landlordNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/properties', label: 'My Properties', icon: Building2 },
  { href: '/dashboard/agreements', label: 'Agreements', icon: FileText },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/kyc', label: 'KYC Verification', icon: UserCheck },
];

const adminNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/admin', label: 'Admin Panel', icon: Shield },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/admin/properties', label: 'Properties', icon: Building2 },
  { href: '/dashboard/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/admin/disputes', label: 'Disputes', icon: AlertTriangle },
  { href: '/dashboard/admin/reports', label: 'Reports', icon: BarChart3 },
];

function getNavItems(role: UserRole | undefined): NavItem[] {
  switch (role) {
    case UserRole.ADMIN:
      return adminNav;
    case UserRole.LANDLORD:
      return landlordNav;
    case UserRole.TENANT:
    default:
      return tenantNav;
  }
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const navItems = getNavItems(user?.role as UserRole | undefined);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary-700">
          <Building2 className="h-6 w-6" />
          <span>OpenIDEth</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-muted hover:bg-primary-50/50 hover:text-foreground',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
