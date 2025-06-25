
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CalculatorResultsProps } from './types';
import { motion } from 'framer-motion';
import { NutritionInfo, ActionButtons } from './results';
import AnthropometricResults from './AnthropometricResults';
import CalculatorSkeleton from './CalculatorSkeleton';
import CalculatorResultsHeader from './results/CalculatorResultsHeader';
import MetricsSection from './results/MetricsSection';
import MacronutrientSection from './results/MacronutrientSection';
import EmptyResultsState from './results/EmptyResultsState';

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
    return <EmptyResultsState />;
  }

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
          <CalculatorResultsHeader fromCache={fromCache} cacheAge={cacheAge} />
          
          <CardContent className="space-y-6">
            {/* Metrics */}
            <MetricsSection 
              bmr={bmr} 
              tee={tee} 
              carbsPercentage={carbsPercentage} 
            />
            
            {/* Macronutrient Distribution */}
            <MacronutrientSection
              macros={macros}
              carbsPercentage={carbsPercentage}
              proteinPercentage={proteinPercentage}
              fatPercentage={fatPercentage}
              weight={weight}
            />
            
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
