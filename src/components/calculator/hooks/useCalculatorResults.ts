
import { useState, useEffect } from 'react';
import { getCalculatorResults, saveCalculatorResults } from '../storageUtils';
import { calculateBMR, calculateTEE, calculateMacros } from '../utils/calculations';
import { validateInputsForCalculation } from '../utils/validation';
import { CalculatorState, UseCalculatorResultsProps } from '../types';

/**
 * Hook to manage calculator results
 */
export const useCalculatorResults = ({
  setBmr,
  setTee,
  setMacros,
  setConsultationData,
  toast,
  user,
  tempPatientId,
  setTempPatientId
}: UseCalculatorResultsProps) => {
  // Calculate results based on form values
  const calculateResults = async (state: CalculatorState) => {
    try {
      // Validate inputs
      const isValid = validateInputsForCalculation(state);
      if (!isValid) {
        toast.toast({
          title: 'Dados inválidos',
          description: 'Por favor, preencha todos os campos obrigatórios.',
          variant: 'destructive'
        });
        return null;
      }
      
      // Parse inputs to proper types
      const weight = parseFloat(state.weight);
      const height = parseInt(state.height);
      const age = parseInt(state.age);
      const { gender, activityLevel, objective } = state;
      const lowCarbOption = state.lowCarbOption || false;
      
      // Calculate BMR using the Mifflin-St Jeor equation
      const calculatedBmr = calculateBMR(weight, height, age, gender);
      setBmr(calculatedBmr);
      
      // Calculate TEE (Total Energy Expenditure) with activity factor
      const calculatedTee = calculateTEE(calculatedBmr, activityLevel, objective);
      setTee(calculatedTee);
      
      // Calculate macronutrients
      const carbsPercentage = parseInt(state.carbsPercentage);
      const proteinPercentage = parseInt(state.proteinPercentage);
      const fatPercentage = parseInt(state.fatPercentage);
      
      const calculatedMacros = calculateMacros(
        calculatedTee, 
        carbsPercentage / 100, 
        proteinPercentage / 100, 
        fatPercentage / 100,
        weight,
        lowCarbOption
      );
      
      setMacros(calculatedMacros);
      
      // Generate a temporary patient ID if needed
      if (!tempPatientId) {
        setTempPatientId(crypto.randomUUID());
      }
      
      return {
        bmr: calculatedBmr,
        tee: calculatedTee,
        macros: calculatedMacros
      };
    } catch (error) {
      console.error('Error calculating results:', error);
      toast.toast({
        title: 'Erro no cálculo',
        description: 'Ocorreu um erro ao calcular os resultados.',
        variant: 'destructive'
      });
      return null;
    }
  };

  return {
    calculateResults
  };
};
