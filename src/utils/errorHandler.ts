
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/toast/use-toast';
import { NETWORK_ERROR_TOAST_ID } from '@/hooks/toast/toast-types';

/**
 * Custom error types for better error handling
 */
export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection unavailable') {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Handles API errors and returns a standardized error object
 */
export const handleApiError = (error: any, defaultMessage: string = 'An unexpected error occurred') => {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      status: error.status
    };
  }

  if (error instanceof NetworkError) {
    return {
      message: error.message,
      type: 'network'
    };
  }

  if (error instanceof AuthError) {
    return {
      message: error.message,
      type: 'auth'
    };
  }

  return {
    message: error?.message || defaultMessage
  };
};

/**
 * Global error handler for API and network errors
 */
export const globalErrorHandler = (error: any) => {
  console.error('Global error handler caught:', error);
  
  // Handle network errors
  if (error instanceof NetworkError || !navigator.onLine) {
    toast({
      id: NETWORK_ERROR_TOAST_ID,
      title: 'Network Error',
      description: 'Unable to connect to server. Please check your internet connection.',
      variant: 'network-error',
    });
    return;
  }
  
  // Handle auth errors
  if (error instanceof AuthError || 
     (error && error.message && error.message.includes('not authorized'))) {
    toast({
      title: 'Authentication Error',
      description: error.message || 'You are not authorized to perform this action.',
      variant: 'destructive',
    });
    
    // If it's a session expired error, sign out
    if (error.message && error.message.includes('session expired')) {
      supabase.auth.signOut();
    }
    return;
  }
  
  // Handle other errors
  toast({
    title: 'Error',
    description: error.message || 'An unexpected error occurred.',
    variant: 'destructive',
  });
};

/**
 * Check if the error is a network connectivity issue
 */
export const isNetworkError = (error: any): boolean => {
  return error instanceof NetworkError || 
         !navigator.onLine || 
         error.message?.includes('network') || 
         error.message?.includes('connection');
};
