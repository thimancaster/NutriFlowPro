
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { isCurrentUserAdmin } from '@/utils/securityUtils';

interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_data: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export const useSecurityAudit = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await isCurrentUserAdmin();
        setIsAdmin(adminStatus);
      }
    };
    
    checkAdminStatus();
  }, [user]);

  const fetchSecurityEvents = async (limit: number = 50) => {
    if (!isAdmin) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching security events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventsByType = (eventType: string) => {
    return events.filter(event => event.event_type === eventType);
  };

  const getEventsByUser = (userId: string) => {
    return events.filter(event => event.user_id === userId);
  };

  return {
    events,
    isLoading,
    isAdmin,
    fetchSecurityEvents,
    getEventsByType,
    getEventsByUser
  };
};
