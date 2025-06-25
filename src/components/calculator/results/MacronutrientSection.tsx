
import React from 'react';
import { motion } from 'framer-motion';
import { MacroDistributionGrid } from './index';

interface MacronutrientSectionProps {
  macros: any;
  carbsPercentage?: number;
  proteinPercentage?: number;
  fatPercentage?: number;
  weight?: number;
}

const MacronutrientSection: React.FC<MacronutrientSectionProps> = ({
  macros,
  carbsPercentage,
  proteinPercentage,
  fatPercentage,
  weight
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.8 }}
    >
      <h3 className="font-medium text-gray-900 mb-2">Distribuição de Macronutrientes</h3>
      
      {/* User has manually set percentages */}
      {carbsPercentage && proteinPercentage && fatPercentage && (
        <motion.div 
          className="grid grid-cols-3 gap-2 text-center mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.9 }}
        >
          <motion.div 
            className="bg-amber-50 p-2 rounded"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-xs text-gray-500">Proteínas</div>
            <div className="font-semibold">{proteinPercentage}%</div>
          </motion.div>
          <motion.div 
            className="bg-blue-50 p-2 rounded"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-xs text-gray-500">Carboidratos</div>
            <div className="font-semibold">{carbsPercentage}%</div>
          </motion.div>
          <motion.div 
            className="bg-purple-50 p-2 rounded"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-xs text-gray-500">Gorduras</div>
            <div className="font-semibold">{fatPercentage}%</div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Macro details */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.0 }}
      >
        <MacroDistributionGrid 
          macros={macros} 
          proteinPerKg={macros.proteinPerKg}
          weight={weight || (macros.protein.grams / (macros.proteinPerKg || 1))}
        />
      </motion.div>
    </motion.div>
  );
};

export default MacronutrientSection;
