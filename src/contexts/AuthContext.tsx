/**
 * 🔐 Authentication Context
 * Zarządza stanem logowania użytkownika - SUPABASE AUTH
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/config/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Kompatybilność z Firebase User
interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Konwersja Supabase User na format kompatybilny z Firebase
const convertUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;
  return {
    uid: supabaseUser.id,
    email: supabaseUser.email || null,
    displayName: supabaseUser.user_metadata?.display_name || supabaseUser.email?.split('@')[0] || null
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sprawdź aktualną sesję
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(convertUser(session?.user || null));
      setLoading(false);
    });

    // Nasłuchuj zmian sesji
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(convertUser(session?.user || null));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      toast.success('Zalogowano pomyślnie!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(getErrorMessage(error.message));
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Profesjonalny komunikat z instrukcjami
      toast.success(
        '✅ Konto utworzone!\n\n' +
        '📧 Sprawdź swoją skrzynkę pocztową i kliknij w link aktywacyjny.\n' +
        '⏰ Link ważny przez 24 godziny.\n\n' +
        '💡 Nie widzisz emaila? Sprawdź folder SPAM.',
        { duration: 10000 } // 10 sekund
      );
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(getErrorMessage(error.message));
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw new Error(getErrorMessage(error.message));
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Wylogowano pomyślnie');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Błąd wylogowania');
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Helper: Tłumaczenie błędów Supabase
function getErrorMessage(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Nieprawidłowy email lub hasło';
  if (message.includes('Email not confirmed')) return 'Potwierdź swój email';
  if (message.includes('User already registered')) return 'Ten email jest już zajęty';
  if (message.includes('Password should be at least 6 characters')) return 'Hasło musi mieć min. 6 znaków';
  if (message.includes('Invalid email')) return 'Nieprawidłowy adres email';
  if (message.includes('too many requests')) return 'Zbyt wiele prób. Spróbuj później';
  return message || 'Wystąpił błąd. Spróbuj ponownie';
}
