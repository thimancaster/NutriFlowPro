
import { useCalculator } from '@/hooks/useCalculator';
import {
  mapProfileToNew,
  mapActivityLevelToNew,
  mapObjectiveToNew,
  mapGenderToNew
} from '@/utils/nutrition/typeMapping';
import { CalculationInputs } from '@/utils/nutrition/centralMotor/enpCore';

interface CalculationParams {
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  activityLevel: string;
  objective: string;
  profile: string;
}

export const useCalculatorActions = () => {
  const { calculate } = useCalculator();

  const validateInputs = (params: CalculationParams): boolean => {
    const { weight, height, age } = params;
    
    if (!weight || !height || !age) {
      return false;
    }
    
    if (weight <= 0 || weight > 500) return false;
    if (height <= 0 || height > 250) return false;
    if (age <= 0 || age > 120) return false;
    
    return true;
  };

  const validateAndCalculate = async (params: CalculationParams) => {
    if (!validateInputs(params)) {
      console.error('Validation failed:', params);
      return null;
    }

    try {
      // Map legacy parameters to new system
      const mappedInputs: CalculationInputs = {
        weight: params.weight,
        height: params.height,
        age: params.age,
        gender: mapGenderToNew(params.sex),
        activityLevel: mapActivityLevelToNew(params.activityLevel as any),
        objective: mapObjectiveToNew(params.objective as any),
        profile: mapProfileToNew(params.profile as any)
      };

      const result = await calculate(mappedInputs);
      return result;
    } catch (error) {
      console.error('Calculation error:', error);
      return null;
    }
  };

  return {
    validateAndCalculate,
    validateInputs
  };
};
