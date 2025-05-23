
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthStateType } from './types';
import useAuthStorage from '@/hooks/auth/useAuthStorage';
import { useAuthorizationStatus } from '@/hooks/auth/useAuthorizationStatus';

export const useAuthStateManager = () => {
  const [state, setState] = useState<AuthStateType>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    session: null,
    isPremium: false,
  });
  
  const { storeSession, getStoredSession, clearStoredSession } = useAuthStorage();
  const { checkPremiumStatus } = useAuthorizationStatus();
  
  // Methods to update authentication state
  const setAuthenticated = (user: User | null, session: Session | null, isPremium: boolean = false) => {
    setState({
      isLoading: false,
      isAuthenticated: !!user,
      user,
      session,
      isPremium,
    });
  };
  
  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };
  
  // Check if user has premium status
  const checkUserPremiumStatus = async (userId: string) => {
    try {
      const isPremium = await checkPremiumStatus(userId);
      setState(prev => ({ ...prev, isPremium }));
      return isPremium;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  };
  
  // Update session
  const updateSession = async (newSession: Session | null) => {
    if (!newSession) {
      setAuthenticated(null, null);
      clearStoredSession();
      return;
    }
    
    storeSession(newSession);
    const isPremium = newSession.user ? await checkUserPremiumStatus(newSession.user.id) : false;
    setAuthenticated(newSession.user, newSession, isPremium);
  };
  
  // Load session from local storage
  const loadSessionFromStorage = async () => {
    const storedSession = getStoredSession();
    
    if (storedSession) {
      try {
        // Verify the session is still valid
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          clearStoredSession();
          setAuthenticated(null, null);
          return;
        }
        
        // Valid session, update state
        const isPremium = data.session.user ? await checkUserPremiumStatus(data.session.user.id) : false;
        setAuthenticated(data.session.user, data.session, isPremium);
      } catch (err) {
        console.error('Error validating stored session:', err);
        clearStoredSession();
        setAuthenticated(null, null);
      }
    } else {
      setAuthenticated(null, null);
    }
  };
  
  // Initialize auth state
  const initialize = async () => {
    try {
      setLoading(true);
      await loadSessionFromStorage();
    } catch (error) {
      console.error('Error initializing authentication:', error);
      setAuthenticated(null, null);
    } finally {
      setLoading(false);
    }
  };
  
  return {
    state,
    setAuthenticated,
    setLoading,
    updateSession,
    initialize,
    checkUserPremiumStatus
  };
};
