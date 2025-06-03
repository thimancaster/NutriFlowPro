
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
  // Adicionar propriedades do Supabase para compatibilidade
  user_metadata?: any;
  app_metadata?: any;
  aud?: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
