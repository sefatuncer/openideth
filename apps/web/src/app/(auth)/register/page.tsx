'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserRole, registerSchema } from '@openideth/shared';

import { useAuthStore } from '@/hooks/use-auth';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, type SelectOption } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ApiClientError } from '@/lib/api-client';

const roleOptions: SelectOption[] = [
  { value: UserRole.TENANT, label: 'Tenant — I\'m looking for a rental' },
  { value: UserRole.LANDLORD, label: 'Landlord — I want to list properties' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(UserRole.TENANT);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Zod client-side validation
    const result = registerSchema.safeParse({ email, password, name, role });
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!errs[field]) errs[field] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    if (!agreed) {
      setError('You must agree to the terms and conditions.');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name, role);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-2xl">Create your account</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-error-50 p-3 text-sm text-error-700">
              {error}
            </div>
          )}
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
            required
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Select
            label="I am a..."
            options={roleOptions}
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          />
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
            />
            <span className="text-muted">
              I agree to the{' '}
              <Link href="#" className="text-primary-600 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="#" className="text-primary-600 hover:underline">Privacy Policy</Link>
            </span>
          </label>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" loading={loading} className="w-full">
            Create Account
          </Button>
          <p className="text-center text-sm text-muted">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
