
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "nutri-green" | "nutri-blue" | "nutri" | "nutri-outline" | "subscription" | "subscription-green";
  size?: "default" | "sm" | "lg" | "icon";
  animation?: "none" | "shimmer";
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  variant = "default",
  size = "default",
  animation = "none",
  ...props
}) => {
  return (
    <Button
      disabled={disabled || loading}
      variant={variant}
      size={size}
      animation={animation}
      className={cn(className)}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? (loadingText || 'Carregando...') : children}
    </Button>
  );
};

export { LoadingButton };
