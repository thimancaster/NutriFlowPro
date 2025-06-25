
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from 'lucide-react';
import { CalculatorResultsProps } from './types';
import { motion } from 'framer-motion';
import {
  MetricCard,
  CalorieAdjustmentBadge,
  MacroDistributionGrid,
  NutritionInfo,
  ActionButtons
} from './results';
import AnthropometricResults from './AnthropometricResults';
import CacheIndicator from '@/components/ui/CacheIndicator';
import CalculatorSkeleton from './CalculatorSkeleton';

const CalculatorResults: React.FC<CalculatorResultsProps & {
  fromCache?: boolean;
  cacheAge?: number;
  isCalculating?: boolean;
}> = ({
  bmr,
  tee,
  macros,
  carbsPercentage,
  proteinPercentage,
  fatPercentage,
  handleSavePatient,
  handleGenerateMealPlan,
  isSavingPatient,
  hasPatientName,
  user,
  weight,
  height,
  age,
  sex,
  waist,
  hip,
  sum3Folds,
  fromCache = false,
  cacheAge,
  isCalculating = false
}) => {
  // Show skeleton while calculating
  if (isCalculating) {
    return <CalculatorSkeleton showMacros={true} showAnthropometric={true} />;
  }

  if (!bmr || !tee || !macros) {
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
  }

  // Create a simple calorie summary
  const summary = {
    targetCalories: tee.vet,
    actualCalories: (macros.protein.kcal || 0) + (macros.fat.kcal || 0) + (macros.carbs.kcal || 0),
    difference: 0,
    percentageDifference: 0
  };

  // Check if user is premium (simplified mock check)
  const isUserPremium = user?.is_premium || false;

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Avaliação Antropométrica */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <AnthropometricResults
          weight={weight}
          height={height}
          age={age}
          sex={sex}
          waist={waist}
          hip={hip}
          sum3Folds={sum3Folds}
        />
      </motion.div>

      {/* Resultados Nutricionais */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl flex items-center">
                <span>Resultados do Cálculo</span>
                <Info className="h-5 w-5 ml-2 text-nutri-blue opacity-70" />
              </CardTitle>
              <CacheIndicator fromCache={fromCache} cacheAge={cacheAge} />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Metrics */}
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
            
            {/* Macronutrient Distribution */}
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
            
            {/* Nutrition Info Block */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.1 }}
            >
              <NutritionInfo
                objective={carbsPercentage ? 'custom' : 'manutenção'}
                activityLevel={'moderado'}
                profile={'magro'}
              />
            </motion.div>
            
            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.2 }}
            >
              <ActionButtons
                onSavePatient={handleSavePatient}
                onGenerateMealPlan={handleGenerateMealPlan}
                isSaving={isSavingPatient}
                hasResults={!!tee && !!macros}
                hasPatientName={hasPatientName}
                userIsPremium={isUserPremium}
              />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CalculatorResults;
