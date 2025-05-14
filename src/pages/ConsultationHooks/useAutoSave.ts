
import { useState, useEffect } from 'react';
import { handleAutoSaveConsultation } from '@/components/calculator/handlers/consultationHandlers';

interface UseAutoSaveProps {
  consultationId: string | null;
  formData: any;
  results: any;
  setLastAutoSave: (date: Date) => void;
}

// Auto-save interval in milliseconds (2 minutes)
const AUTO_SAVE_INTERVAL = 2 * 60 * 1000;

const useAutoSave = ({ consultationId, formData, results, setLastAutoSave }: UseAutoSaveProps) => {
  const [isSaving, setIsSaving] = useState(false);
  
  // Auto-save timer
  useEffect(() => {
    let autoSaveTimer: NodeJS.Timeout | null = null;
    
    if (consultationId) {
      autoSaveTimer = setInterval(async () => {
        try {
          setIsSaving(true);
          
          // Update consultation data with current form values and results
          const success = await handleAutoSaveConsultation(
            consultationId,
            {
              bmr: results.tmb,
              tdee: results.get,
              weight: parseFloat(formData.weight),
              height: parseFloat(formData.height),
              age: parseInt(formData.age),
              gender: formData.sex === 'M' ? 'male' : 'female',
              protein: results.macros.protein,
              carbs: results.macros.carbs,
              fats: results.macros.fat,
              activity_level: formData.activityLevel,
              goal: formData.objective,
              status: formData.consultationStatus as 'em_andamento' | 'completo'
            }
          );
          
          if (success) {
            setLastAutoSave(new Date());
            console.log('Auto-saved consultation at:', new Date().toLocaleTimeString());
          }
        } catch (error) {
          console.error('Auto-save error:', error);
        } finally {
          setIsSaving(false);
        }
      }, AUTO_SAVE_INTERVAL);
    }
    
    return () => {
      if (autoSaveTimer) clearInterval(autoSaveTimer);
    };
  }, [consultationId, formData, results, setLastAutoSave]);
  
  return isSaving;
};

export default useAutoSave;
