'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AUTH_REDIRECT_KEY } from '@/contexts/auth-context';

export default function AuthCompletePage() {
  const router = useRouter();

  useEffect(() => {
    // Get the stored redirect path from localStorage
    const redirectPath = localStorage.getItem(AUTH_REDIRECT_KEY);
    localStorage.removeItem(AUTH_REDIRECT_KEY);

    // If there was a stored path, go there. Otherwise, go to the dashboard
    const destination = redirectPath || '/cv';

    // Small delay to ensure the session is properly set
    const timer = setTimeout(() => {
      router.replace(destination);
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
