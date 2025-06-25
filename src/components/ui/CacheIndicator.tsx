
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface CacheIndicatorProps {
  fromCache: boolean;
  cacheAge?: number;
  className?: string;
}

const CacheIndicator: React.FC<CacheIndicatorProps> = ({ 
  fromCache, 
  cacheAge, 
  className = '' 
}) => {
  if (!fromCache) return null;

  const formatCacheAge = (age: number) => {
    const seconds = Math.floor(age / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={className}
    >
      <Badge 
        variant="secondary" 
        className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1"
      >
        <Zap className="h-3 w-3" />
        <span>Cache</span>
        {cacheAge && (
          <>
            <Clock className="h-3 w-3" />
            <span>{formatCacheAge(cacheAge)}</span>
          </>
        )}
      </Badge>
    </motion.div>
  );
};

export default CacheIndicator;
