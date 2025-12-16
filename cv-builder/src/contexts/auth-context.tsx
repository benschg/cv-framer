'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

const AUTH_REDIRECT_KEY = 'auth_redirect_path';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface UserProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
}

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signInWithOTP: (email: string) => Promise<{ error: string | null }>;
  verifyOTP: (email: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: UserProfileData) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const supabase = createClient();

  useEffect(() => {
    // Ensure user profile exists
    const ensureUserProfile = async (userId: string) => {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!existingProfile) {
        await supabase
          .from('user_profiles')
          .insert({ user_id: userId });
      }
    };

    // Get initial session
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        setState(prev => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      if (session?.user) {
        await ensureUserProfile(session.user.id);
      }

      setState({
        user: session?.user ?? null,
        loading: false,
        error: null,
      });
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await ensureUserProfile(session.user.id);
        }

        setState({
          user: session?.user ?? null,
          loading: false,
          error: null,
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGoogle = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    // Store current path for redirect after OAuth
    const currentPath = window.location.pathname;
    localStorage.setItem(AUTH_REDIRECT_KEY, currentPath);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      localStorage.removeItem(AUTH_REDIRECT_KEY);
      setState(prev => ({ ...prev, loading: false, error: error.message }));
    }
  }, [supabase]);

  const signInWithOTP = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return { error: error.message };
    }

    setState(prev => ({ ...prev, loading: false }));
    return { error: null };
  }, [supabase]);

  const verifyOTP = useCallback(async (email: string, token: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return { error: error.message };
    }

    setState(prev => ({ ...prev, loading: false }));
    return { error: null };
  }, [supabase]);

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const { error } = await supabase.auth.signOut();

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
    }
  }, [supabase]);

  const updateUserProfile = useCallback(async (data: UserProfileData) => {
    const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ');

    const { data: updatedUser, error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName || undefined,
        first_name: data.firstName || undefined,
        last_name: data.lastName || undefined,
        phone: data.phone || undefined,
        location: data.location || undefined,
      },
    });

    if (error) {
      return { error: error.message };
    }

    // Update local state with the new user data
    if (updatedUser.user) {
      setState(prev => ({ ...prev, user: updatedUser.user }));
    }

    return { error: null };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{
      ...state,
      signInWithGoogle,
      signInWithOTP,
      verifyOTP,
      signOut,
      updateUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AUTH_REDIRECT_KEY };
