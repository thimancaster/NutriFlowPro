
import React from 'react';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

type FeedbackType = 'success' | 'error' | 'warning' | 'info';

interface FeedbackToastOptions {
  title: string;
  description?: string;
  type: FeedbackType;
  duration?: number;
}

const getToastConfig = (type: FeedbackType) => {
  switch (type) {
    case 'success':
      return {
        variant: 'default' as const,
        icon: CheckCircle,
        className: 'border-green-500 bg-green-50 text-green-900'
      };
    case 'error':
      return {
        variant: 'destructive' as const,
        icon: XCircle,
        className: 'border-red-500 bg-red-50 text-red-900'
      };
    case 'warning':
      return {
        variant: 'default' as const,
        icon: AlertCircle,
        className: 'border-yellow-500 bg-yellow-50 text-yellow-900'
      };
    case 'info':
      return {
        variant: 'default' as const,
        icon: Info,
        className: 'border-blue-500 bg-blue-50 text-blue-900'
      };
    default:
      return {
        variant: 'default' as const,
        icon: Info,
        className: ''
      };
  }
};

export const showFeedbackToast = ({ title, description, type, duration = 5000 }: FeedbackToastOptions) => {
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
    className: config.className,
    duration,
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
