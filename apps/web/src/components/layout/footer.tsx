import Link from 'next/link';
import { Building2 } from 'lucide-react';

const footerLinks = {
  Platform: [
    { href: '/properties', label: 'Browse Properties' },
    { href: '/register', label: 'List Your Property' },
  ],
  Company: [
    { href: '#', label: 'About' },
    { href: '#', label: 'Contact' },
  ],
  Legal: [
    { href: '#', label: 'Privacy Policy' },
    { href: '#', label: 'Terms of Service' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary-700">
              <Building2 className="h-6 w-6" />
              <span>OpenIDEth</span>
            </Link>
            <p className="mt-3 text-sm text-muted">
              Blockchain-powered rental platform connecting landlords and tenants.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-center text-sm text-muted">
            &copy; {new Date().getFullYear()} OpenIDEth. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
