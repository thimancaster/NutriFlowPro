
import { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPremium: boolean;
  loading: boolean;
  userTier: 'free' | 'premium';
  usageQuota: {
    patients: {
      used: number;
      limit: number;
    };
    mealPlans: {
      used: number;
      limit: number;
    };
  };
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  isPremium: boolean;
  userTier: 'free' | 'premium';
  usageQuota: AuthState['usageQuota'];
  login: (email: string, password: string, remember?: boolean) => Promise<any>;
  signup: (email: string, password: string, name: string) => Promise<any>;
  logout: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  updateAuthState: (session: Session | null, remember?: boolean) => Promise<void>;
}

// Import types from auth.ts instead of re-exporting
// Removed line: export type { AuthState } from '@/types/auth';
