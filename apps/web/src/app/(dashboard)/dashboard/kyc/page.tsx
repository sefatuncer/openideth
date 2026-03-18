'use client';

import { useState } from 'react';
import { CheckCircle, Clock, Shield, XCircle } from 'lucide-react';
import { KycStatus } from '@openideth/shared';

import { api } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, type SelectOption } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface KycData {
  id: string;
  status: KycStatus;
  documentType?: string;
  rejectionReason?: string;
  submittedAt?: string;
  reviewedAt?: string;
}

const statusConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; variant: 'default' | 'success' | 'warning' | 'error'; label: string }> = {
  [KycStatus.NOT_STARTED]: { icon: Shield, variant: 'default', label: 'Not Started' },
  [KycStatus.PENDING]: { icon: Clock, variant: 'warning', label: 'Pending Review' },
  [KycStatus.APPROVED]: { icon: CheckCircle, variant: 'success', label: 'Approved' },
  [KycStatus.REJECTED]: { icon: XCircle, variant: 'error', label: 'Rejected' },
};

const docTypeOptions: SelectOption[] = [
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'ID_CARD', label: 'ID Card' },
  { value: 'DRIVERS_LICENSE', label: "Driver's License" },
];

export default function KycPage() {
  const queryClient = useQueryClient();
  const { data: kyc } = useQuery({
    queryKey: ['kyc', 'status'],
    queryFn: () => api.get<KycData>('/kyc/status'),
  });

  const [docType, setDocType] = useState('PASSPORT');
  const [frontUrl, setFrontUrl] = useState('');
  const [backUrl, setBackUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const status = kyc?.status ?? KycStatus.NOT_STARTED;
  const config = statusConfig[status] ?? statusConfig[KycStatus.NOT_STARTED]!;
  const StatusIcon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (status === KycStatus.NOT_STARTED) {
        await api.post('/kyc/initiate');
      }
      await api.post('/kyc/documents', {
        documentType: docType,
        documentFrontUrl: frontUrl,
        documentBackUrl: backUrl || undefined,
        selfieUrl: selfieUrl || undefined,
      });
      void queryClient.invalidateQueries({ queryKey: ['kyc'] });
      toast({ title: 'Documents submitted for review', variant: 'success' });
    } catch {
      toast({ title: 'Failed to submit documents', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">KYC Verification</h1>

      {/* Status */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full bg-primary-50 p-3">
            <StatusIcon className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <Badge variant={config.variant}>{config.label}</Badge>
            {status === KycStatus.REJECTED && kyc?.rejectionReason && (
              <p className="mt-1 text-sm text-error-700">Reason: {kyc.rejectionReason}</p>
            )}
            {status === KycStatus.APPROVED && (
              <p className="mt-1 text-sm text-success-700">Your identity has been verified.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload form */}
      {(status === KycStatus.NOT_STARTED || status === KycStatus.REJECTED) && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                label="Document Type"
                options={docTypeOptions}
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              />
              <Input
                label="Front Image URL"
                value={frontUrl}
                onChange={(e) => setFrontUrl(e.target.value)}
                placeholder="https://..."
                required
              />
              <Input
                label="Back Image URL (optional)"
                value={backUrl}
                onChange={(e) => setBackUrl(e.target.value)}
                placeholder="https://..."
              />
              <Input
                label="Selfie URL (optional)"
                value={selfieUrl}
                onChange={(e) => setSelfieUrl(e.target.value)}
                placeholder="https://..."
              />
              <Button type="submit" loading={loading}>
                Submit for Review
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
