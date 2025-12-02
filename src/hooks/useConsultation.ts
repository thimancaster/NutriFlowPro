
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ConsultationData } from '@/types';
import { updateConsultationStatus, updateConsultationType, handleAutoSaveConsultation } from '@/components/calculator/handlers/consultationHandlers';

export const useConsultation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSubmitConsultation = async (
    e: React.FormEvent,
    formData: any,
    results: any,
    consultationId: string | null,
    setConsultationData: (data: ConsultationData) => void
  ) => {
    e.preventDefault();
    
    const consultationFormData = {
      ...formData,
      results
    };
    
    // Save consultation data to context
    setConsultationData(consultationFormData);
    
    // If we have a consultation ID, update the type and status
    if (consultationId) {
      try {
        await updateConsultationType(
          consultationId, 
          formData.consultationType as 'primeira_consulta' | 'retorno'
        );
        
        await updateConsultationStatus(
          consultationId,
          formData.consultationStatus as 'em_andamento' | 'concluida'
        );
      } catch (error) {
        console.error('Error updating consultation metadata:', error);
      }
    }
    
    toast({
      title: "Consulta salva com sucesso",
      description: "Os resultados foram calculados e estão prontos para gerar um plano alimentar.",
    });
    
    navigate('/meal-plan-builder');
  };
  
  const saveAutoChanges = useCallback(async (
    consultationId: string,
    formData: any,
    results: any
  ) => {
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
          status: formData.consultationStatus as 'em_andamento' | 'concluida'
        }
      );
      
      return success;
    } catch (error) {
      console.error('Auto-save error:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    isSaving,
    handleSubmitConsultation,
    saveAutoChanges
  };
};

export default useConsultation;
