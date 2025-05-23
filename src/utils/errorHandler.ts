
import { toast } from "@/hooks/toast";
import { logger } from "@/utils/logger";
import { captureException } from "@/utils/sentry";

interface ErrorOptions {
  showToast?: boolean;
  consoleLog?: boolean;
  customTitle?: string;
  customMessage?: string;
  retry?: () => Promise<any>;
  context?: string;
  tags?: string[];
}

/**
 * Central error handler for consistent error processing throughout the app
 */
export const handleError = (error: any, options: ErrorOptions = {}) => {
  const {
    showToast = true,
    consoleLog = true,
    customTitle,
    customMessage,
    retry,
    context = "Application",
    tags = []
  } = options;

  // Log error using structured logger
  if (consoleLog) {
    logger.error("Error caught", {
      context,
      details: error,
      tags
    });
  }

  // Send to error tracking service
  captureException(error, {
    name: context,
    tags
  });

  // Extract error message with fallbacks
  const errorMessage = customMessage || 
    error?.message || 
    error?.error_description || 
    error?.details || 
    "Ocorreu um erro inesperado";

  // Handle Supabase specific errors
  const isAuthError = error?.status === 401 || 
                     error?.code === "PGRST301" || 
                     error?.message?.includes("JWT");
  
  const isNetworkError = error?.message?.includes("network") || 
                        error?.message?.includes("Failed to fetch") ||
                        !navigator.onLine;

  // Show toast notification if requested
  if (showToast) {
    if (isNetworkError) {
      // Use special network error toast that stays visible
      toast.networkError();
    } else if (isAuthError) {
      toast.error({
        title: customTitle || "Erro de Autenticação",
        description: "Sua sessão expirou. Por favor, faça login novamente.",
      });
    } else {
      toast.error({
        title: customTitle || "Erro",
        description: errorMessage,
        action: retry ? (
          <button 
            onClick={retry}
            className="bg-destructive-foreground text-destructive px-2 py-1 rounded text-xs"
          >
            Tentar novamente
          </button>
        ) : undefined,
      });
    }
  }

  // Return standardized error object
  return {
    error: true,
    message: errorMessage,
    isAuthError,
    isNetworkError,
    originalError: error
  };
};

/**
 * Create a wrapper for API calls with automatic error handling
 */
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorOptions: ErrorOptions = {}
) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      const handler = () => fn(...args);
      handleError(error, { ...errorOptions, retry: handler });
      throw error; // Re-throw to allow caller to handle if needed
    }
  };
};
