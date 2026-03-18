import Link from 'next/link';
import { Building2 } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 text-2xl font-bold text-primary-700">
          <Building2 className="h-8 w-8" />
          <span>OpenIDEth</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
