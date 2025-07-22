
import React from 'react';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

type FeedbackType = 'success' | 'error' | 'warning' | 'info';

interface FeedbackToastOptions {
  title: string;
  description?: string;
  type: FeedbackType;
}

const getToastConfig = (type: FeedbackType) => {
  switch (type) {
    case 'success':
      return {
        variant: 'default' as const,
        icon: CheckCircle,
      };
    case 'error':
      return {
        variant: 'destructive' as const,
        icon: XCircle,
      };
    case 'warning':
      return {
        variant: 'default' as const,
        icon: AlertCircle,
      };
    case 'info':
      return {
        variant: 'default' as const,
        icon: Info,
      };
    default:
      return {
        variant: 'default' as const,
        icon: Info,
      };
  }
};

export const showFeedbackToast = ({ title, description, type }: FeedbackToastOptions) => {
  const config = getToastConfig(type);
  const Icon = config.icon;

  toast({
    title: (
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {title}
      </div>
    ) as any,
    description,
    variant: config.variant,
  });
};

// Convenience functions
export const showSuccessToast = (title: string, description?: string) => 
  showFeedbackToast({ title, description, type: 'success' });

export const showErrorToast = (title: string, description?: string) => 
  showFeedbackToast({ title, description, type: 'error' });

export const showWarningToast = (title: string, description?: string) => 
  showFeedbackToast({ title, description, type: 'warning' });

export const showInfoToast = (title: string, description?: string) => 
  showFeedbackToast({ title, description, type: 'info' });
