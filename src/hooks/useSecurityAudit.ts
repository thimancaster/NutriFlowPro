
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { isCurrentUserAdmin } from '@/utils/securityUtils';
import { auditLogService, SecurityEvent } from '@/services/auditLogService';

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
      const securityEvents = await auditLogService.getSecurityEvents(limit);
      setEvents(securityEvents);
    } catch (error) {
      console.error('Error fetching security events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserEvents = async (userId: string, limit: number = 50) => {
    if (!isAdmin) return;
    
    setIsLoading(true);
    try {
      const userEvents = await auditLogService.getUserEvents(userId, limit);
      setEvents(userEvents);
    } catch (error) {
      console.error('Error fetching user events:', error);
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
    fetchUserEvents,
    getEventsByType,
    getEventsByUser
  };
};
