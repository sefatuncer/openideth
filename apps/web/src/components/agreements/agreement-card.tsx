'use client';

import Link from 'next/link';
import { Calendar, FileText, Users } from 'lucide-react';
import { AgreementStatus } from '@openideth/shared';

import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { type Agreement } from '@/hooks/use-agreements';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  [AgreementStatus.DRAFT]: 'default',
  [AgreementStatus.PENDING_SIGNATURE]: 'warning',
  [AgreementStatus.ACTIVE]: 'success',
  [AgreementStatus.TERMINATED]: 'error',
  [AgreementStatus.EXPIRED]: 'error',
};

interface AgreementCardProps {
  agreement: Agreement;
}

export function AgreementCard({ agreement }: AgreementCardProps) {
  return (
    <Link href={`/dashboard/agreements/${agreement.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-50 p-2">
                <FileText className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {agreement.property?.title || 'Rental Agreement'}
                </h3>
                <p className="text-sm text-muted">
                  {agreement.property?.address}
                </p>
              </div>
            </div>
            <Badge variant={statusVariant[agreement.status] || 'default'}>
              {agreement.status.replace('_', ' ')}
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted">
              <Users className="h-4 w-4" />
              <div>
                <p className="text-xs text-muted">Parties</p>
                <p className="text-foreground">{agreement.landlord?.name} / {agreement.tenant?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted">
              <Calendar className="h-4 w-4" />
              <div>
                <p className="text-xs text-muted">Period</p>
                <p className="text-foreground">
                  {formatDate(agreement.startDate, 'MMM yyyy')} – {formatDate(agreement.endDate, 'MMM yyyy')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">Monthly Rent</p>
              <p className="text-lg font-semibold text-primary-700">
                {formatCurrency(Number(agreement.monthlyRent))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
