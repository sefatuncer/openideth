'use client';

import { useState } from 'react';

import { useAuthStore } from '@/hooks/use-auth';
import { api } from '@/lib/api-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, refreshUser } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch('/users/me', { name, phone });
      await refreshUser();
      toast({ title: 'Profile updated', variant: 'success' });
    } catch {
      toast({ title: 'Failed to update profile', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <Avatar src={user?.avatarUrl} fallback={user?.name || 'U'} size="xl" />
            <div>
              <p className="font-medium text-foreground">{user?.name}</p>
              <p className="text-sm text-muted">{user?.email}</p>
              <p className="text-xs text-muted capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email"
              value={user?.email ?? ''}
              disabled
              helperText="Email cannot be changed"
            />
            <Input
              label="Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {user?.walletAddress && (
        <Card>
          <CardHeader><CardTitle>Wallet</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted">Connected wallet address</p>
            <p className="mt-1 font-mono text-sm">{user.walletAddress}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
