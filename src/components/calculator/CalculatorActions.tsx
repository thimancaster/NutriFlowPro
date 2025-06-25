
import React from 'react';
import { Button } from "@/components/ui/button";
import { Calculator, Loader2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalculatorActionsProps {
  isCalculating: boolean;
  calculateResults: () => void;
  disabled?: boolean;
  fromCache?: boolean;
}

const CalculatorActions = ({ 
  isCalculating, 
  calculateResults, 
  disabled,
  fromCache 
}: CalculatorActionsProps) => {
  return (
    <motion.div 
      className="flex justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full max-w-md"
      >
        <Button 
          onClick={calculateResults} 
          variant="primary"
          animation="shimmer"
          disabled={isCalculating || disabled}
          className="flex items-center gap-2 w-full relative overflow-hidden"
          size="lg"
        >
          <AnimatePresence mode="wait">
            {isCalculating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Calculando...</span>
              </motion.div>
            ) : fromCache ? (
              <motion.div
                key="cached"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                <span>Recalcular</span>
              </motion.div>
            ) : (
              <motion.div
                key="calculate"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                <span>Calcular</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress indicator overlay */}
          {isCalculating && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default CalculatorActions;
