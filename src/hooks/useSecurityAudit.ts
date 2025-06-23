
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { auditLogService, SecurityEvent } from '@/services/auditLogService';

export const useSecurityAudit = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if user is admin
    const checkAdminStatus = () => {
      const adminEmails = ['thimancaster@hotmail.com', 'thiago@nutriflowpro.com'];
      setIsAdmin(!!user?.email && adminEmails.includes(user.email));
    };

    checkAdminStatus();
  }, [user]);

  const fetchSecurityEvents = async (limit: number = 50) => {
    if (!isAdmin) {
      console.warn('Access denied: Admin privileges required');
      return;
    }

    setIsLoading(true);
    try {
      const fetchedEvents = await auditLogService.getSecurityEvents(limit);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching security events:', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserEvents = async (userId: string, limit: number = 50) => {
    setIsLoading(true);
    try {
      const fetchedEvents = await auditLogService.getUserEvents(userId, limit);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching user events:', error);
      setEvents([]);
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
