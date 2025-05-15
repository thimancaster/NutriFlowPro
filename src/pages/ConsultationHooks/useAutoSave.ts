
import { useState, useEffect } from 'react';
import { handleAutoSaveConsultation } from '@/components/calculator/handlers/consultationHandlers';
import { ConsultationData } from '@/types';

interface AutoSaveProps {
  id?: string;
}

// Auto-save interval in milliseconds (2 minutes)
const AUTO_SAVE_INTERVAL = 2 * 60 * 1000;

const useAutoSave = (id?: string) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  const saveConsultation = async (consultation: ConsultationData) => {
    if (!id || id === 'new') return;
    
    try {
      setIsSaving(true);
      setAutoSaveStatus('saving');
      
      // Update consultation data with current values
      const success = await handleAutoSaveConsultation(
        id,
        {
          bmr: consultation.results.bmr,
          tdee: consultation.results.tdee,
          weight: consultation.anthropometry.weight,
          height: consultation.anthropometry.height,
          age: consultation.anthropometry.age,
          gender: consultation.anthropometry.gender,
          protein: consultation.macroDistribution.protein,
          carbs: consultation.macroDistribution.carbs,
          fats: consultation.macroDistribution.fat,
          activity_level: consultation.anthropometry.activityFactor.toString(),
          goal: consultation.nutritionalObjectives.objective,
          status: 'em_andamento' // Default status
        }
      );
      
      if (success) {
        setLastAutoSave(new Date());
        setAutoSaveStatus('success');
        console.log('Auto-saved consultation at:', new Date().toLocaleTimeString());
      } else {
        setAutoSaveStatus('error');
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Auto-save timer
  useEffect(() => {
    let autoSaveTimer: NodeJS.Timeout | null = null;
    
    if (id && id !== 'new') {
      console.log('Setting up auto-save timer for consultation', id);
      
      autoSaveTimer = setInterval(() => {
        console.log('Auto-save interval triggered');
        setAutoSaveStatus('saving');
      }, AUTO_SAVE_INTERVAL);
    }
    
    return () => {
      if (autoSaveTimer) {
        console.log('Clearing auto-save timer');
        clearInterval(autoSaveTimer);
      }
    };
  }, [id]);
  
  return {
    saveConsultation,
    autoSaveStatus,
    lastAutoSave,
    isSaving
  };
};

export default useAutoSave;
