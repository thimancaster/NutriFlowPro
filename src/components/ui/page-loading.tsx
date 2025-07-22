
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageLoadingProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PageLoading: React.FC<PageLoadingProps> = ({ 
  message = 'Carregando...', 
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-8 space-y-4",
      className
    )}>
      <Loader2 className={cn(
        "animate-spin text-nutri-blue",
        sizeClasses[size]
      )} />
      {message && (
        <p className="text-sm text-gray-600 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export { PageLoading };
