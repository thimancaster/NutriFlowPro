
import { useMemo } from 'react';
import { ActivityLevel, Objective, Profile } from '@/types/consultation';
import { GERFormula } from '@/types/gerFormulas';

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
  
  const isValid = useMemo(() => 
    validatedData.weight > 0 && 
    validatedData.height > 0 && 
    validatedData.age > 0 &&
    !!validatedData.gerFormula // Formula is now required
  , [validatedData]);
  
  return {
    validatedData,
    isValid
  };
};
