
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  activityFactors, 
  calculateTMB, 
  calcGET, 
  calculateMacros 
} from '@/utils/nutritionCalculations';

interface FormData {
  weight: string;
  height: string;
  age: string;
  sex: string;
  objective: string;
  profile: string;
  activityLevel: string;
}

interface Results {
  tmb: number;
  fa: number;
  get: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const useConsultationForm = (initialData?: Partial<FormData>) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    weight: initialData?.weight || '',
    height: initialData?.height || '',
    age: initialData?.age || '',
    sex: initialData?.sex || 'M',
    objective: initialData?.objective || 'manutenção',
    profile: initialData?.profile || 'magro',
    activityLevel: initialData?.activityLevel || 'moderado',
  });
  
  const [results, setResults] = useState<Results>({
    tmb: 0,
    fa: 1.55, // default moderate
    get: 0,
    macros: { protein: 0, carbs: 0, fat: 0 }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  useEffect(() => {
    const { weight, height, age, sex, objective, profile, activityLevel } = formData;
    
    if (weight && height && age) {
      try {
        const weightNum = parseFloat(weight);
        const heightNum = parseFloat(height);
        const ageNum = parseInt(age);
        
        const tmb = calculateTMB(
          weightNum,
          heightNum,
          ageNum,
          sex as 'M' | 'F',
          profile as 'magro' | 'obeso' | 'atleta'
        );
        
        const fa = activityFactors[activityLevel as keyof typeof activityFactors];
        
        const get = calcGET(tmb, fa);
        
        const macros = calculateMacros(get, objective);
        
        setResults({
          tmb: Math.round(tmb),
          fa,
          get: Math.round(get),
          macros
        });
      } catch (error) {
        console.error('Error calculating results:', error);
      }
    }
  }, [formData]);
  
  return {
    formData,
    results,
    handleInputChange,
    handleSelectChange,
    setFormData
  };
};
