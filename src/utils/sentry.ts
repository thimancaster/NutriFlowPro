
import * as Sentry from '@sentry/react';
import { logger } from "@/utils/logger";

/**
 * Initialize Sentry error tracking
 * This should be called early in your application startup
 */
export const initSentry = () => {
  // Only initialize in production or if VITE_SENTRY_DSN is provided
  if (import.meta.env.PROD || import.meta.env.VITE_SENTRY_DSN) {
    try {
      Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN || "",
        integrations: [
          new Sentry.BrowserTracing(),
          new Sentry.Replay({
            // Capture 10% of all sessions
            sessionSampleRate: 0.1,
            // Capture 100% of sessions with errors
            errorSampleRate: 1.0,
          }),
        ],
        
        // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
        // We recommend adjusting this value in production
        tracesSampleRate: 0.2,
        
        // This sets the sample rate to be 10%. You may want this to be 100% while
        // in development and sample at a lower rate in production
        replaysSessionSampleRate: 0.1,
        
        // If the entire session is not sampled, use the below sample rate to sample
        // sessions when an error occurs.
        replaysOnErrorSampleRate: 1.0,
        
        // Enable Sentry's Performance features
        enableTracing: true,
        
        // Set environment
        environment: import.meta.env.MODE,
        
        // Add a before-send hook
        beforeSend(event) {
          // Sanitize sensitive data before sending
          // You can modify the event here or return null to not send it
          return event;
        },
      });
      
      logger.info('Sentry initialized successfully', { context: 'Sentry' });
    } catch (error) {
      logger.error('Failed to initialize Sentry', { 
        context: 'Sentry', 
        details: error 
      });
    }
  } else {
    logger.info('Sentry not initialized (non-production environment)', { context: 'Sentry' });
  }
};

/**
 * Capture an error with Sentry
 */
export const captureException = (error: any, context?: Record<string, any>) => {
  if (import.meta.env.PROD || import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureException(error, {
      tags: context?.tags,
      contexts: {
        custom: context
      }
    });
  }
  
  // Always log the error locally
  logger.error('Exception captured', {
    context: context?.name || 'Error',
    details: error,
    tags: context?.tags
  });
};

/**
 * Set user information for Sentry
 */
export const setUser = (user: { id: string; email?: string; name?: string; }) => {
  if (import.meta.env.PROD || import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser(user);
    logger.debug('Sentry user set', { context: 'Sentry', user: user.email });
  }
};

/**
 * Clear user information from Sentry
 */
export const clearUser = () => {
  if (import.meta.env.PROD || import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser(null);
    logger.debug('Sentry user cleared', { context: 'Sentry' });
  }
};
