
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  hover?: boolean;
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  delay = 0,
  duration = 0.5,
  hover = true,
  onClick
}) => {
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration,
        delay,
        ease: "easeOut"
      }
    }
  };

  const hoverVariants = hover ? {
    hover: {
      y: -5,
      scale: 1.02,
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  } : {};

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={hover ? "hover" : undefined}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm cursor-pointer",
        className
      )}
      onClick={onClick}
      {...hoverVariants}
    >
      {children}
    </motion.div>
  );
};
