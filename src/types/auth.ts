
import { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
