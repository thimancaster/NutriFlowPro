import { useState, useEffect } from 'react';
import { useCalculator } from '@/contexts/CalculatorContext';

export const useCalculatorResults = () => {
  const { calculatorState, calculatorDispatch } = useCalculator();
  const [bmr, setBmr] = useState(0);
  const [tee, setTee] = useState(0);
  const [macros, setMacros] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  useEffect(() => {
    if (calculatorState.weight && calculatorState.height && calculatorState.age && calculatorState.gender && calculatorState.activityLevel) {
      handleCalculateBMR();
    }
  }, [calculatorState.weight, calculatorState.height, calculatorState.age, calculatorState.gender, calculatorState.activityLevel]);

  useEffect(() => {
    if (bmr && calculatorState.objective && calculatorState.consultationType) {
      handleCalculateTEE();
    }
  }, [bmr, calculatorState.objective, calculatorState.consultationType]);

  useEffect(() => {
    if (tee && calculatorState.carbPercentage && calculatorState.proteinPercentage && calculatorState.fatPercentage && calculatorState.weight) {
      handleCalculateMacros();
    }
  }, [tee, calculatorState.carbPercentage, calculatorState.proteinPercentage, calculatorState.fatPercentage, calculatorState.weight]);

  const handleCalculateBMR = () => {
    let bmrValue;
    if (calculatorState.gender === 'male') {
      bmrValue = 88.362 + (13.397 * calculatorState.weight) + (4.799 * calculatorState.height) - (5.677 * calculatorState.age);
    } else {
      bmrValue = 447.593 + (9.247 * calculatorState.weight) + (3.098 * calculatorState.height) - (4.330 * calculatorState.age);
    }

    setBmr(bmrValue);
  };

  const handleCalculateTEE = () => {
    let activityFactor;
    switch (calculatorState.activityLevel) {
      case 'sedentary':
        activityFactor = 1.2;
        break;
      case 'lightlyActive':
        activityFactor = 1.375;
        break;
      case 'moderatelyActive':
        activityFactor = 1.55;
        break;
      case 'veryActive':
        activityFactor = 1.725;
        break;
      case 'extraActive':
        activityFactor = 1.9;
        break;
      default:
        activityFactor = 1.2;
    }

    let teeValue = bmr * activityFactor;

    if (calculatorState.objective === 'gainWeight') {
      teeValue += 500;
    } else if (calculatorState.objective === 'loseWeight') {
      teeValue -= 500;
    }

    const results = {
      bmr: bmr,
      get: teeValue,
      adjustment: 500,
      vet: teeValue,
      macros: {
        protein: 0,
        carbs: 0,
        fat: 0,
      }
    };

    handleCalculationResults(results);
  };

  const handleCalculateMacros = () => {
    const protein = (tee * (calculatorState.proteinPercentage / 100)) / 4;
    const carbs = (tee * (calculatorState.carbPercentage / 100)) / 4;
    const fat = (tee * (calculatorState.fatPercentage / 100)) / 9;

    const results = {
      bmr: bmr,
      get: tee,
      adjustment: 500,
      vet: tee,
      macros: {
        protein: protein,
        carbs: carbs,
        fat: fat,
      }
    };

    handleCalculationResults(results);
  };

  // Convert number to string when calling functions that expect string
  const setCarbs = (value: number) => {
    calculatorDispatch({
      type: 'SET_CARB_PERCENTAGE',
      payload: value.toString()
    });
  };

  // Convert complex object to number or properly handle the object
  const handleCalculationResults = (results: any) => {
    // If results.get is a complex object, extract the numeric value
    const calorieValue = typeof results.get === 'object'
      ? results.get.value || 0
      : results.get;

    // Update state with the calculated values
    setBmr(results.bmr);
    setTee(calorieValue);
    setMacros(results.macros);
  };

  // Fix function call with correct number of arguments
  const calculateMacros = (
    totalCalories: number,
    proteinPercentage: number,
    carbsPercentage: number,
    fatPercentage: number,
    weight: number
  ) => {
    // Implementation
  };

  return {
    bmr,
    tee,
    macros,
    setCarbs,
    calculateMacros
  };
};
