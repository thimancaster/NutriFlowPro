import { useState, useEffect, useCallback } from 'react';
import { 
  ConsultationFormState, 
  ConsultationResults,
  Sex,
  Objective,
  Profile,
  ActivityLevel,
  ConsultationType,
  ConsultationStatus
} from '@/types/consultation';
import { 
  calculateComplete_Official, 
  type CalculationInputs 
} from '@/utils/nutrition/official/officialCalculations';

export interface UseConsultationFormReturn {
  formData: ConsultationFormState;
  results: ConsultationResults;
  setFormData: (data: ConsultationFormState) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  lastAutoSave: Date | null;
  setLastAutoSave: (date: Date | null) => void;
  consultationId: string | null;
  setConsultationId: (id: string | null) => void;
}

const initialResults: ConsultationResults = {
  tmb: 0,
  fa: 0,
  get: 0,
  macros: {
    protein: 0,
    carbs: 0,
    fat: 0
  }
};

export const useConsultationForm = (
  initialData: Partial<ConsultationFormState> = {}
): UseConsultationFormReturn => {
  const [formData, setFormData] = useState<ConsultationFormState>({
    weight: initialData.weight || '',
    height: initialData.height || '',
    age: initialData.age || '',
    sex: initialData.sex || 'M',
    objective: initialData.objective || 'manutenção',
    profile: initialData.profile || 'eutrofico',
    activityLevel: initialData.activityLevel || 'moderado',
    consultationType: initialData.consultationType || 'primeira_consulta',
    consultationStatus: initialData.consultationStatus || 'em_andamento'
  });
  
  const [results, setResults] = useState<ConsultationResults>(initialResults);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Calculate using official engine
  useEffect(() => {
    const calculateNutritionValues = () => {
      if (!formData.weight || !formData.height || !formData.age) {
        return;
      }

      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height);
      const age = parseInt(formData.age);

      if (isNaN(weight) || isNaN(height) || isNaN(age)) {
        return;
      }

      const inputs: CalculationInputs = {
        weight,
        height,
        age,
        gender: formData.sex as 'M' | 'F',
        profile: formData.profile as any,
        activityLevel: formData.activityLevel,
        objective: formData.objective,
        macroInputs: {
          proteinPerKg: formData.profile === 'atleta' ? 2.0 : 1.6,
          fatPerKg: 1.0
        }
      };

      const calculation = calculateComplete_Official(inputs);

      setResults({
        tmb: calculation.tmb.value,
        fa: 0, // Activity factor is internal to GET calculation
        get: calculation.get,
        macros: {
          protein: calculation.macros.protein.grams,
          carbs: calculation.macros.carbs.grams,
          fat: calculation.macros.fat.grams
        }
      });
    };

    calculateNutritionValues();
  }, [formData.weight, formData.height, formData.age, formData.sex, formData.activityLevel, formData.objective, formData.profile]);

  return {
    formData,
    results,
    setFormData,
    handleInputChange,
    handleSelectChange,
    lastAutoSave,
    setLastAutoSave,
    consultationId,
    setConsultationId
  };
};
