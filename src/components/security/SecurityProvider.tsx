
import React, { createContext, useContext, useEffect, useState } from 'react';
import { validateSessionIntegrity, detectSuspiciousActivity } from '@/utils/security/secureAuth';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SecurityContextType {
  isSecure: boolean;
  sessionValid: boolean;
  suspiciousActivity: boolean;
  validateSecurity: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSecure, setIsSecure] = useState(true);
  const [sessionValid, setSessionValid] = useState(true);
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const validateSecurity = async () => {
    try {
      // Validate session integrity
      const sessionCheck = await validateSessionIntegrity();
      setSessionValid(sessionCheck);
      
      if (!sessionCheck) {
        setIsSecure(false);
        toast({
          title: 'Problema de Segurança',
          description: 'Sessão comprometida detectada. Por favor, faça login novamente.',
          variant: 'destructive'
        });
        await logout();
        return;
      }
      
      // Check for suspicious activity if user is logged in
      if (user?.id) {
        const suspicious = await detectSuspiciousActivity(user.id);
        setSuspiciousActivity(suspicious);
        
        if (suspicious) {
          toast({
            title: 'Atividade Suspeita',
            description: 'Atividade incomum detectada em sua conta. Verifique suas configurações de segurança.',
            variant: 'destructive'
          });
        }
      }
      
      setIsSecure(sessionCheck && !suspiciousActivity);
    } catch (error) {
      console.error('Security validation error:', error);
      setIsSecure(false);
    }
  };

  useEffect(() => {
    // Initial security check
    validateSecurity();
    
    // Periodic security checks every 5 minutes
    const interval = setInterval(validateSecurity, 5 * 60 * 1000);
    
    // Check on window focus
    const handleFocus = () => validateSecurity();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.id]);

  // Monitor for session storage changes (potential XSS)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'session_fingerprint' && e.newValue !== e.oldValue) {
        console.warn('Session fingerprint changed unexpectedly');
        validateSecurity();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    isSecure,
    sessionValid,
    suspiciousActivity,
    validateSecurity
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
