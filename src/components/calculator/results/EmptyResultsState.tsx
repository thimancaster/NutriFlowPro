
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const EmptyResultsState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-gray-500">Complete os dados e calcule para ver os resultados</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EmptyResultsState;
