
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className,
  variant = 'default',
  size = 'default',
  onClick,
  disabled = false,
  loading = false,
  type = 'button'
}) => {
  const buttonVariants = {
    rest: { 
      scale: 1,
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
      transition: {
        duration: 0.2,
        ease: [0.42, 0, 0.58, 1] // easeInOut
      }
    },
    tap: { 
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  };

  const pulseVariants = loading ? {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: [0.42, 0, 0.58, 1] // easeInOut
      }
    }
  } : {};

  return (
    <motion.div
      variants={buttonVariants}
      initial="rest"
      whileHover={!disabled && !loading ? "hover" : "rest"}
      whileTap={!disabled && !loading ? "tap" : "rest"}
      animate={loading ? "pulse" : "rest"}
      {...pulseVariants}
    >
      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={disabled || loading}
        type={type}
        className={cn(
          "relative overflow-hidden",
          loading && "cursor-not-allowed opacity-70",
          className
        )}
      >
        {loading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: [0, 0, 1, 1] // linear
            }}
          />
        )}
        {children}
      </Button>
    </motion.div>
  );
};
