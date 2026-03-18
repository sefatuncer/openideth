import Link from 'next/link';
import { Building2, FileCheck, Shield, ArrowRight } from 'lucide-react';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const steps = [
  {
    icon: Building2,
    title: 'Browse Properties',
    description: 'Explore verified rental listings with detailed information, images, and transparent pricing.',
  },
  {
    icon: FileCheck,
    title: 'Sign Agreements',
    description: 'Create and sign rental agreements digitally with blockchain-verified document integrity.',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Pay rent via Stripe or cryptocurrency with escrow protection and automatic receipts.',
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary-50 to-white px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Rent Smarter with{' '}
              <span className="text-primary-600">Blockchain</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
              OpenIDEth connects landlords and tenants through a transparent, blockchain-powered platform.
              Secure agreements, escrow deposits, and crypto-ready payments — all in one place.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/properties"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary-600 px-8 text-base font-medium text-white transition-colors hover:bg-primary-700"
              >
                Browse Properties
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/register"
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-border bg-white px-8 text-base font-medium text-foreground transition-colors hover:bg-primary-50"
              >
                List Your Property
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted">
              Get started in three simple steps
            </p>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {steps.map((step, i) => (
                <div key={step.title} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
                    <step.icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="mt-1 text-sm font-bold text-primary-600">Step {i + 1}</div>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary-600 px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white">Ready to get started?</h2>
            <p className="mt-3 text-lg text-primary-100">
              Join thousands of landlords and tenants using OpenIDEth for secure, transparent rentals.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-white px-8 text-base font-medium text-primary-700 transition-colors hover:bg-primary-50"
            >
              Create Free Account
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
