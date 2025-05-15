
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
    profile: initialData.profile || 'magro',
    activityLevel: initialData.activityLevel || 'moderado',
    consultationType: initialData.consultationType || 'primeira_consulta',
    consultationStatus: initialData.consultationStatus || 'em_andamento'
  });
  
  const [results, setResults] = useState<ConsultationResults>(initialResults);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Handle select changes
  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Calculate BMR and macros whenever weight, height, age, sex changes
  useEffect(() => {
    const calculateNutritionValues = () => {
      // Only calculate if all required fields are filled
      if (!formData.weight || !formData.height || !formData.age) {
        return;
      }

      // Parse values
      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height);
      const age = parseInt(formData.age);

      if (isNaN(weight) || isNaN(height) || isNaN(age)) {
        return;
      }

      // Calculate BMR based on sex (Mifflin-St Jeor equation)
      let bmr: number;
      if (formData.sex === 'M') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }

      // Calculate TDEE based on activity level
      let activityFactor = getActivityFactor(formData.activityLevel);
      const tdee = bmr * activityFactor;

      // Calculate macros based on objective
      const macroDistribution = getMacroDistributionByObjective(formData.objective);
      
      // Calculate macros in grams
      const protein = Math.round((tdee * macroDistribution.protein) / 4); // 4 calories per gram
      const carbs = Math.round((tdee * macroDistribution.carbs) / 4); // 4 calories per gram
      const fat = Math.round((tdee * macroDistribution.fat) / 9); // 9 calories per gram

      setResults({
        tmb: Math.round(bmr),
        fa: activityFactor,
        get: Math.round(tdee),
        macros: {
          protein,
          carbs,
          fat
        }
      });
    };

    calculateNutritionValues();
  }, [formData.weight, formData.height, formData.age, formData.sex, formData.activityLevel, formData.objective]);

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

// Helper function to get activity factor
const getActivityFactor = (activityLevel: ActivityLevel): number => {
  switch (activityLevel) {
    case 'sedentario':
      return 1.2;
    case 'leve':
      return 1.375;
    case 'moderado':
      return 1.55;
    case 'intenso':
      return 1.725;
    case 'muito_intenso':
      return 1.9;
    default:
      return 1.2;
  }
};

// Helper function to get macro distribution based on objective
const getMacroDistributionByObjective = (
  objective: Objective
): { protein: number; carbs: number; fat: number } => {
  switch (objective) {
    case 'emagrecimento':
      return { protein: 0.3, carbs: 0.4, fat: 0.3 };
    case 'hipertrofia':
      return { protein: 0.3, carbs: 0.5, fat: 0.2 };
    case 'manutenção':
    default:
      return { protein: 0.2, carbs: 0.5, fat: 0.3 };
  }
};
