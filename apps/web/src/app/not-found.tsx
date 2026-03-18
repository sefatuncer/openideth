import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-8xl font-bold text-primary-200">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-foreground">Page not found</h2>
      <p className="mt-2 max-w-md text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-primary-50"
        >
          <Search className="h-4 w-4" />
          Browse Properties
        </Link>
      </div>
    </div>
  );
}
