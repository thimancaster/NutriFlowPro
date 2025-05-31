
import { useState, useEffect } from 'react';
import { Profile } from '@/types/consultation';
import { Patient } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { calculateCompleteNutrition } from '@/utils/nutritionCalculations';
import { mapProfileToCalculation } from '@/utils/nutrition/macroCalculations';
import { stringToProfile } from '../utils/profileUtils';

interface CalculatorFormData {
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  activityLevel: string;
  objective: string;
  profile: Profile;
  patientName?: string;
}

interface CalculationResults {
  tmbValue: number;
  teeObject: {
    tmb: number;
    get: number;
    vet: number;
    adjustment: number;
  };
  macros: {
    protein: { grams: number; kcal: number; percentage: number };
    carbs: { grams: number; kcal: number; percentage: number };
    fat: { grams: number; kcal: number; percentage: number };
    proteinPerKg: number;
  };
  calorieSummary: any;
  formulaUsed: string;
}

const useCalculatorState = () => {
  const [formData, setFormData] = useState<CalculatorFormData>({
    weight: 65,
    height: 160,
    age: 49,
    sex: 'F',
    activityLevel: 'moderado',
    objective: 'emagrecimento',
    profile: 'eutrofico'
  });

  const [results, setResults] = useState<CalculationResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<'tmb' | 'activity' | 'results'>('tmb');

  const { toast } = useToast();

  // Sync patient data when it changes
  useEffect(() => {
    const savedState = localStorage.getItem('calculatorState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setFormData(prev => ({
          ...prev,
          ...parsed,
          profile: stringToProfile(parsed.profile)
        }));
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('calculatorState', JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (field: keyof CalculatorFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setShowResults(false);
  };

  const handleProfileChange = (profile: Profile) => {
    setFormData(prev => ({
      ...prev,
      profile
    }));
    setShowResults(false);
  };

  const handleCalculate = async () => {
    // Validation
    if (!formData.weight || !formData.height || !formData.age) {
      toast({
        title: "Dados incompletos",
        description: "Preencha peso, altura e idade para continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // UI feedback

      // Map profile to calculation type
      const mappedProfile = mapProfileToCalculation(formData.profile);
      
      // Remove await - calculateCompleteNutrition returns object directly, not Promise
      const nutritionResults = calculateCompleteNutrition(
        formData.weight,
        formData.height,
        formData.age,
        formData.sex,
        formData.activityLevel as any,
        formData.objective as any,
        mappedProfile
      );

      const calculationResults: CalculationResults = {
        tmbValue: nutritionResults.tmb,
        teeObject: {
          tmb: nutritionResults.tmb,
          get: nutritionResults.get,
          vet: nutritionResults.vet,
          adjustment: nutritionResults.vet - nutritionResults.get
        },
        macros: {
          protein: nutritionResults.macros.protein,
          carbs: nutritionResults.macros.carbs,
          fat: nutritionResults.macros.fat,
          proteinPerKg: nutritionResults.macros.proteinPerKg
        },
        calorieSummary: {
          totalCalories: nutritionResults.vet,
          proteinCalories: nutritionResults.macros.protein.kcal,
          carbsCalories: nutritionResults.macros.carbs.kcal,
          fatCalories: nutritionResults.macros.fat.kcal
        },
        formulaUsed: nutritionResults.formulaUsed || 'Harris-Benedict Revisada'
      };

      setResults(calculationResults);
      setShowResults(true);
      setActiveTab('results');

      toast({
        title: "Cálculo realizado com sucesso",
        description: `Utilizada fórmula: ${nutritionResults.formulaUsed || 'Harris-Benedict Revisada'}`,
      });

    } catch (error) {
      console.error('Calculation error:', error);
      toast({
        title: "Erro no cálculo",
        description: "Ocorreu um erro ao realizar os cálculos. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    setFormData({
      weight: 65,
      height: 160,
      age: 49,
      sex: 'F',
      activityLevel: 'moderado',
      objective: 'emagrecimento',
      profile: 'eutrofico'
    });
    setResults(null);
    setShowResults(false);
    setActiveTab('tmb');
    localStorage.removeItem('calculatorState');
  };

  const syncPatientData = (patient: Patient) => {
    setFormData(prev => ({
      ...prev,
      patientName: patient.name,
      weight: (patient as any).weight || prev.weight,
      height: (patient as any).height || prev.height,
      age: (patient as any).age || prev.age,
      sex: (patient.gender === 'male' ? 'M' : 'F') as 'M' | 'F'
    }));
  };

  // Return all the values and functions
  return {
    // Form data
    weight: formData.weight,
    height: formData.height,
    age: formData.age,
    sex: formData.sex,
    activityLevel: formData.activityLevel,
    objective: formData.objective,
    profile: formData.profile,
    patientName: formData.patientName,
    
    // Results
    tmbValue: results?.tmbValue || null,
    teeObject: results?.teeObject || null,
    macros: results?.macros || null,
    calorieSummary: results?.calorieSummary || null,
    formulaUsed: results?.formulaUsed,
    
    // UI State
    showResults,
    isCalculating,
    activeTab,
    
    // Actions
    handleInputChange,
    handleProfileChange,
    handleCalculate,
    handleReset,
    setActiveTab,
    syncPatientData,
    
    // Compatibility methods
    setSex: (sex: 'M' | 'F') => handleInputChange('sex', sex),
    setActivityLevel: (level: string) => handleInputChange('activityLevel', level),
    setObjective: (objective: string) => handleInputChange('objective', objective)
  };
};

export default useCalculatorState;
