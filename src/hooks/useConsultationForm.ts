
import { useState, useEffect, useCallback } from 'react';

export interface ConsultationFormState {
  weight: string;
  height: string;
  age: string;
  sex: string;
  objective: string;
  profile: string;
  activityLevel: string;
  consultationType?: string;
  consultationStatus?: string;
}

export interface ConsultationResults {
  tmb: number;
  fa: number;
  get: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  }
}

export const useConsultationForm = (initialData: Partial<ConsultationFormState> = {}) => {
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
  
  const [results, setResults] = useState<ConsultationResults>({
    tmb: 0,
    fa: 0,
    get: 0,
    macros: {
      protein: 0,
      carbs: 0,
      fat: 0
    }
  });
  
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
    const calculateResults = () => {
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
      let bmr;
      if (formData.sex === 'M') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }

      // Calculate TDEE based on activity level
      let activityFactor = 1.2; // Default sedentary
      switch (formData.activityLevel) {
        case 'sedentario':
          activityFactor = 1.2;
          break;
        case 'leve':
          activityFactor = 1.375;
          break;
        case 'moderado':
          activityFactor = 1.55;
          break;
        case 'intenso':
          activityFactor = 1.725;
          break;
        case 'muito_intenso':
          activityFactor = 1.9;
          break;
      }

      const tdee = bmr * activityFactor;

      // Calculate macros based on objective
      let proteinPercentage = 0.2; // Default
      let carbsPercentage = 0.5;
      let fatPercentage = 0.3;

      switch (formData.objective) {
        case 'emagrecimento':
          proteinPercentage = 0.3;
          carbsPercentage = 0.4;
          fatPercentage = 0.3;
          break;
        case 'hipertrofia':
          proteinPercentage = 0.3;
          carbsPercentage = 0.5;
          fatPercentage = 0.2;
          break;
        // manutenção uses default values
      }

      // Calculate macros in grams
      const protein = Math.round((tdee * proteinPercentage) / 4); // 4 calories per gram
      const carbs = Math.round((tdee * carbsPercentage) / 4); // 4 calories per gram
      const fat = Math.round((tdee * fatPercentage) / 9); // 9 calories per gram

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

    calculateResults();
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
