import type { Metadata } from 'next';

import '@/app/globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'OpenIDEth — Blockchain Rental Platform',
  description: 'Connect landlords and tenants with blockchain-powered rental agreements, secure payments, and transparent escrow.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
