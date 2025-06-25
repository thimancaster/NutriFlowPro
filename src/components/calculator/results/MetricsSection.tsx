
import React from 'react';
import { motion } from 'framer-motion';
import { MetricCard, CalorieAdjustmentBadge } from './index';

interface MetricsSectionProps {
  bmr: number;
  tee: {
    get: number;
    vet: number;
    adjustment: number;
  };
  carbsPercentage?: number;
}

const MetricsSection: React.FC<MetricsSectionProps> = ({
  bmr,
  tee,
  carbsPercentage
}) => {
  return (
    <motion.div 
      className="grid grid-cols-1 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <MetricCard
          title="Taxa Metabólica Basal"
          description="TMB"
          value={`${bmr} kcal`}
          infoText="Energia necessária para funções vitais em repouso, calculada pela fórmula de Mifflin-St Jeor"
          valueColor="text-nutri-green"
          subtitle="(10 × peso) + (6.25 × altura) - (5 × idade) + fator sexo"
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <MetricCard
          title="Gasto Energético Total"
          description="GET"
          value={`${tee.get} kcal`}
          infoText="TMB × Fator de Atividade"
          valueColor="text-nutri-blue"
          subtitle="Calorias necessárias para manutenção do peso"
        />
      </motion.div>
      
      <motion.div 
        className="bg-blue-50 border border-blue-100 rounded-md p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-900">Meta Calórica</h3>
          <CalorieAdjustmentBadge 
            adjustment={tee.adjustment} 
            objective={carbsPercentage ? 'custom' : ''} 
          />
        </div>
        <motion.div 
          className="text-2xl font-bold text-nutri-blue"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.7 }}
        >
          {tee.vet} kcal
        </motion.div>
        <div className="text-sm text-gray-600 mt-1">VET (Valor Energético Total)</div>
      </motion.div>
    </motion.div>
  );
};

export default MetricsSection;
