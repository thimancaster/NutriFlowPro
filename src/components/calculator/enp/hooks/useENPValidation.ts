import { useMemo } from 'react';
import { ActivityLevel, Objective, Profile } from '@/types/consultation';
import { GERFormula } from '@/types/gerFormulas';
import { ENPInputs, validateENPInputs } from '@/utils/nutrition/enpCalculations';
import { mapToENPActivityLevel, mapToENPObjective } from '@/utils/nutrition/cleanCalculations';

interface ValidationData {
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  activityLevel: ActivityLevel;
  objective: Objective;
  profile: Profile;
  gerFormula?: GERFormula;
  bodyFatPercentage?: number;
}

export const useENPValidation = (
  weight: string,
  height: string,
  age: string,
  sex: 'M' | 'F',
  activityLevel: ActivityLevel,
  objective: Objective,
  profile: Profile,
  gerFormula?: GERFormula,
  bodyFatPercentage?: string
) => {
  const validatedData = useMemo((): ValidationData => ({
    weight: parseFloat(weight) || 0,
    height: parseFloat(height) || 0,
    age: parseFloat(age) || 0,
    sex,
    activityLevel,
    objective,
    profile,
    gerFormula,
    bodyFatPercentage: parseFloat(bodyFatPercentage || '') || undefined
  }), [weight, height, age, sex, activityLevel, objective, profile, gerFormula, bodyFatPercentage]);
  
  const validationResult = useMemo(() => {
    const inputs: ENPInputs = {
        weight: validatedData.weight,
        height: validatedData.height,
        age: validatedData.age,
        sex: validatedData.sex,
        activityLevel: mapToENPActivityLevel(validatedData.activityLevel),
        objective: mapToENPObjective(validatedData.objective),
        gerFormula: validatedData.gerFormula as GERFormula,
        bodyFatPercentage: validatedData.bodyFatPercentage,
    };
    return validateENPInputs(inputs);
  }, [validatedData]);
  
  return {
    validatedData,
    isValid: validationResult.isValid,
    errors: validationResult.errors,
    warnings: validationResult.warnings,
  };
};
