'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { useTranslations } from '@/hooks/use-translations';
import { Loader2, Mail } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signInWithOTP, verifyOTP } = useAuth();
  const { t } = useTranslations('en'); // TODO: Get language from context when auth pages support language switching
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/cv';

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await signInWithOTP(email);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setStep('verify');
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await verifyOTP(email, otp);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push(redirectTo);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setError(null);
  };

  if (step === 'verify') {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{t('auth.verification.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('auth.verification.sentTo')} <span className="font-medium">{email}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">{t('auth.verification.codeLabel')}</Label>
            <Input
              id="otp"
              type="text"
              placeholder={t('auth.verification.codePlaceholder')}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              disabled={isLoading}
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('auth.verification.verifying')}
              </>
            ) : (
              t('auth.verification.verifyButton')
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={handleBackToEmail}
            disabled={isLoading}
          >
            {t('auth.verification.useDifferentEmail')}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t('auth.form.emailLabel')}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t('auth.form.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('auth.verification.sendingCode')}
          </>
        ) : (
          t('auth.form.continueWithEmail')
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        {t('auth.form.loginMessage')}
      </p>
    </form>
  );
}
