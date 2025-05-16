
import React, { useEffect, useRef } from 'react';
import {
  HashRouter,
  Routes,
} from "react-router-dom";
import { AuthProvider } from './contexts/auth/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { supabase } from './integrations/supabase/client';
import { publicRoutes, protectedRoutes } from './routes';
import { logger } from './utils/logger';

// Create a client with improved retry options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    },
  },
});

function App() {
  // Use ref to track subscription to prevent memory leaks
  const authSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  
  // Handle auth state changes, especially for OAuth providers like Google
  useEffect(() => {
    // Clean up any existing subscription to prevent duplicates
    if (authSubscriptionRef.current) {
      authSubscriptionRef.current.unsubscribe();
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info("Auth state change event:", event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        logger.info("User signed in:", session.user.id);
        
        // Check if we need to create a user profile
        if (session.user.app_metadata.provider === 'google') {
          try {
            logger.info("Checking if user profile exists for Google user...");
            const { data: existingUser, error: checkError } = await supabase
              .from('users')
              .select('id')
              .eq('id', session.user.id)
              .single();
              
            if (checkError || !existingUser) {
              // Create user profile for Google user
              logger.info("Creating profile for Google user...");
              const { error: profileError } = await supabase
                .from('users')
                .insert([{
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata.full_name || session.user.user_metadata.name || 'Usuário Google'
                }]);
                
              if (profileError) {
                logger.error("Error creating user profile:", profileError);
              } else {
                logger.info("Successfully created profile for Google user");
              }
            } else {
              logger.info("User profile already exists for Google user");
            }
          } catch (error) {
            logger.error("Error handling Google sign-in:", error);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear any caches or local storage related to the user
        localStorage.removeItem('activePatient');
        queryClient.clear();
        logger.info("User signed out, caches cleared");
      }
    });

    // Store subscription reference for cleanup
    authSubscriptionRef.current = subscription;

    return () => {
      // Cleanup subscription on component unmount
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <AuthProvider>
          <Routes>
            {/* Render all routes */}
            {publicRoutes}
            {protectedRoutes}
          </Routes>
          <Toaster />
        </AuthProvider>
      </HashRouter>
    </QueryClientProvider>
  );
}

export default App;
