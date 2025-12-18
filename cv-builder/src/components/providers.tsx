'use client';

import { ThemeProvider } from 'next-themes';

import { AuthProvider } from '@/contexts/auth-context';
import { UserPreferencesProvider } from '@/contexts/user-preferences-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <UserPreferencesProvider>{children}</UserPreferencesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
