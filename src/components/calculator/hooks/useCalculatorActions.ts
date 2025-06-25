
import { useNutritionCalculation } from '@/hooks/useNutritionCalculation';

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
  const nutritionCalculation = useNutritionCalculation();

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
      const result = await nutritionCalculation.calculate(
        params.weight,
        params.height,
        params.age,
        params.sex,
        params.activityLevel as any,
        params.objective as any,
        params.profile as any
      );

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
