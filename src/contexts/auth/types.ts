
import { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPremium: boolean;
  loading: boolean;
  userTier: 'free' | 'premium'; // Added to explicitly track user tier
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
  login: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; error?: Error }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: Error }>;
  logout: () => Promise<{ success: boolean; error?: Error }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: Error }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: Error }>;
}
