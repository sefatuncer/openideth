import { TrendingDown, TrendingUp } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBg?: string;
  change?: number;
  changeLabel?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary-700',
  iconBg = 'bg-primary-50',
  change,
  changeLabel,
}: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted">{title}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          </div>
          <div className={cn('rounded-lg p-2.5', iconBg)}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
        </div>

        {change !== undefined && (
          <div className="mt-3 flex items-center gap-1 text-sm">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-success-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-error-500" />
            )}
            <span className={cn('font-medium', isPositive ? 'text-success-700' : 'text-error-700')}>
              {isPositive ? '+' : ''}{change}%
            </span>
            {changeLabel && <span className="text-muted">{changeLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
