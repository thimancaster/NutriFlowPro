
import { Session } from '@supabase/supabase-js';
import { User } from '@/types/auth';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  initialLoad: boolean;
  isAuthenticated: boolean;
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

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; error?: Error; session?: Session | null }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: Error }>;
  logout: () => Promise<{ success: boolean; error?: Error }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: Error }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: Error }>;
  updateAuthState: (session: Session | null, remember?: boolean) => Promise<void>;
}
