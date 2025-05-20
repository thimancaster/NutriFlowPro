
import { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  isPremium: boolean;
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
  login: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; error?: Error }>;
  signup: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: Error }>;
  logout: () => Promise<{ success: boolean; error?: Error }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: Error }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: Error }>;
}

// Export other types from auth.ts
export type { AuthState } from '@/types/auth';
