
import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  color?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  max = 100,
  className,
  showPercentage = false,
  color = 'default',
  size = 'md'
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colorClasses = {
    default: 'bg-nutri-green',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden", sizeClasses[size])}>
        <motion.div
          className={cn(
            "h-full rounded-full",
            colorClasses[color]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 1,
            ease: [0, 0, 0.58, 1]
          }}
        />
      </div>
      {showPercentage && (
        <motion.div
          className="text-sm text-gray-600 dark:text-gray-400 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {percentage.toFixed(0)}%
        </motion.div>
      )}
    </div>
  );
};
