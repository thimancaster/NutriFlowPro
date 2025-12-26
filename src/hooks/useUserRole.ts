import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'moderator' | 'user';

interface UseUserRoleReturn {
  role: AppRole | null;
  isAdmin: boolean;
  isModerator: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useUserRole = (): UseUserRoleReturn => {
  const { user, isAuthenticated } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id || !isAuthenticated) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Use the has_role function to check admin status securely
        const { data, error: rpcError } = await supabase.rpc('get_user_role_safe', {
          user_id: user.id
        });

        if (rpcError) {
          console.error('Error fetching user role:', rpcError);
          setRole('user'); // Default to user role on error
          return;
        }

        setRole((data as AppRole) || 'user');
      } catch (err) {
        console.error('Error in useUserRole:', err);
        setError('Erro ao verificar permissões');
        setRole('user');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.id, isAuthenticated]);

  return {
    role,
    isAdmin: role === 'admin',
    isModerator: role === 'moderator' || role === 'admin',
    isLoading,
    error
  };
};
