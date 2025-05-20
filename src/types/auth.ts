
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

export interface StoredSession {
  session: Session | null;
  remember: boolean;
}

export interface PremiumStatus {
  isPremium: boolean;
  timestamp: number;
}
