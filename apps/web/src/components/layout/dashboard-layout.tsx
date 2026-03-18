'use client';

import { Sidebar } from './sidebar';
import { DashboardHeader } from './dashboard-header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  headerContent?: React.ReactNode;
}

export function DashboardLayout({ children, headerContent }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Sidebar - hidden on mobile, shown on desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader>{headerContent}</DashboardHeader>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
