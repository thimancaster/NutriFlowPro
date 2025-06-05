
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { logSecurityEvent, SecurityEvents } from '@/utils/auditLogger';

const SecurityMonitor: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Log successful login
    logSecurityEvent(user.id, {
      eventType: SecurityEvents.LOGIN_SUCCESS,
      eventData: { timestamp: new Date().toISOString() }
    });

    // Monitor for suspicious activity patterns
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        logSecurityEvent(user.id, {
          eventType: 'session_resumed',
          eventData: { timestamp: new Date().toISOString() }
        });
      }
    };

    // Monitor for potential security events
    const handleBeforeUnload = () => {
      logSecurityEvent(user.id, {
        eventType: 'session_ended',
        eventData: { timestamp: new Date().toISOString() }
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  // This component doesn't render anything, it just monitors security events
  return null;
};

export default SecurityMonitor;
