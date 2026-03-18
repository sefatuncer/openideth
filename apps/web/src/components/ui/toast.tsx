'use client';

import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useToastStore, type Toast as ToastType } from '@/hooks/use-toast';

const variantStyles = {
  default: 'border-border bg-card',
  success: 'border-success-500/30 bg-success-50',
  error: 'border-error-500/30 bg-error-50',
};

const variantIcons = {
  default: Info,
  success: CheckCircle,
  error: AlertCircle,
};

const variantIconColors = {
  default: 'text-primary-600',
  success: 'text-success-700',
  error: 'text-error-700',
};

function ToastItem({ toast }: { toast: ToastType }) {
  const { removeToast } = useToastStore();
  const variant = toast.variant || 'default';
  const Icon = variantIcons[variant];

  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg transition-all',
        variantStyles[variant],
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', variantIconColors[variant])} />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="text-sm text-muted">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 rounded-sm opacity-70 transition-opacity hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider() {
  const { toasts } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-0 right-0 z-[100] flex max-h-screen flex-col gap-2 p-4 sm:max-w-sm"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
