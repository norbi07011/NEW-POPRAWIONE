/**
 * 🔐 Authentication Context
 * Zarządza stanem logowania użytkownika
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, DEMO_MODE } from '@/config/firebase';
import { toast } from 'sonner';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      // DEMO MODE - symuluj zalogowanego użytkownika
      const demoUser = {
        uid: 'demo-user-123',
        email: 'demo@messubouw.com',
        displayName: 'Demo User'
      } as User;
      
      // Sprawdź czy w localStorage jest "zalogowany"
      const isLoggedIn = localStorage.getItem('demo_logged_in') === 'true';
      if (isLoggedIn) {
        setUser(demoUser);
      }
      setLoading(false);
      return;
    }

    // PRODUCTION MODE - Firebase Auth
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (DEMO_MODE) {
      // DEMO MODE - zawsze zaloguj
      localStorage.setItem('demo_logged_in', 'true');
      const demoUser = {
        uid: 'demo-user-123',
        email: email,
        displayName: email.split('@')[0]
      } as User;
      setUser(demoUser);
      toast.success('Zalogowano (tryb demo)');
      return;
    }

    if (!auth) throw new Error('Firebase not initialized');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Zalogowano pomyślnie!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const signUp = async (email: string, password: string) => {
    if (DEMO_MODE) {
      // DEMO MODE - utwórz i zaloguj
      localStorage.setItem('demo_logged_in', 'true');
      const demoUser = {
        uid: 'demo-user-' + Date.now(),
        email: email,
        displayName: email.split('@')[0]
      } as User;
      setUser(demoUser);
      toast.success('Konto utworzone (tryb demo)');
      return;
    }

    if (!auth) throw new Error('Firebase not initialized');
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Konto utworzone pomyślnie!');
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const signInWithGoogle = async () => {
    if (DEMO_MODE) {
      // DEMO MODE - symuluj Google login
      localStorage.setItem('demo_logged_in', 'true');
      const demoUser = {
        uid: 'demo-google-123',
        email: 'demo.google@messubouw.com',
        displayName: 'Demo Google User'
      } as User;
      setUser(demoUser);
      toast.success('Zalogowano przez Google (tryb demo)');
      return;
    }

    if (!auth) throw new Error('Firebase not initialized');
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Zalogowano przez Google!');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const signOut = async () => {
    if (DEMO_MODE) {
      localStorage.removeItem('demo_logged_in');
      setUser(null);
      toast.success('Wylogowano (tryb demo)');
      return;
    }

    if (!auth) return;
    
    try {
      await firebaseSignOut(auth);
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

// Helper: Tłumaczenie błędów Firebase
function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Ten email jest już zajęty';
    case 'auth/invalid-email':
      return 'Nieprawidłowy adres email';
    case 'auth/operation-not-allowed':
      return 'Operacja niedozwolona';
    case 'auth/weak-password':
      return 'Hasło jest zbyt słabe (min. 6 znaków)';
    case 'auth/user-disabled':
      return 'To konto zostało zablokowane';
    case 'auth/user-not-found':
      return 'Nie znaleziono użytkownika';
    case 'auth/wrong-password':
      return 'Nieprawidłowe hasło';
    case 'auth/too-many-requests':
      return 'Zbyt wiele prób. Spróbuj później';
    default:
      return 'Wystąpił błąd. Spróbuj ponownie';
  }
}
