
import { useMemo } from 'react';
import { ActivityLevel, Objective } from '@/types/consultation';

interface ValidationData {
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  activityLevel: ActivityLevel;
  objective: Objective;
}

export const useENPValidation = (
  weight: string,
  height: string,
  age: string,
  sex: 'M' | 'F',
  activityLevel: ActivityLevel,
  objective: Objective
) => {
  const validatedData = useMemo((): ValidationData => ({
    weight: parseFloat(weight) || 0,
    height: parseFloat(height) || 0,
    age: parseFloat(age) || 0,
    sex,
    activityLevel,
    objective
  }), [weight, height, age, sex, activityLevel, objective]);
  
  const isValid = useMemo(() => 
    validatedData.weight > 0 && 
    validatedData.height > 0 && 
    validatedData.age > 0
  , [validatedData]);
  
  return {
    validatedData,
    isValid
  };
};
