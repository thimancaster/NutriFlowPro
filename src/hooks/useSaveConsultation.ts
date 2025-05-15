
import { useState } from 'react';
import { useToast } from './use-toast';
import { useNavigate } from 'react-router-dom';
import { ConsultationData } from '@/types';
import { consultationService } from '@/services';
import { useAuth } from '@/contexts/auth/AuthContext';

export const useSaveConsultation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSaveConsultation = async (
    id: string | undefined, 
    consultation: ConsultationData,
    updatePatientData?: (patientId: string, data: any) => Promise<void>
  ) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save a consultation',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare the data for saving
      const consultationToSave = {
        id: id !== 'new' ? id : undefined,
        patient_id: consultation.patient_id || '',
        weight: consultation.weight,
        height: consultation.height,
        age: consultation.age || 0,
        gender: consultation.gender,
        activity_level: consultation.activity_level,
        goal: consultation.goal || consultation.objective,
        bmr: consultation.results?.bmr || consultation.bmr,
        tdee: consultation.results?.get || consultation.tdee,
        protein: consultation.results?.macros.protein || consultation.protein,
        carbs: consultation.results?.macros.carbs || consultation.carbs,
        fats: consultation.results?.macros.fat || consultation.fats,
        notes: consultation.notes || '',
        tipo: 'primeira_consulta', // Default value
        status: 'em_andamento', // Default value
        user_id: user.id,
      };
      
      const result = await consultationService.saveConsultation(consultationToSave);
      
      if (result.success && result.data?.id) {
        toast({
          title: 'Success',
          description: 'Consultation saved successfully',
        });
        
        // Update patient data if this is a new consultation and we have a callback
        if (consultation.patient_id && updatePatientData) {
          await updatePatientData(consultation.patient_id, {
            measurements: {
              weight: consultation.weight,
              height: consultation.height,
            },
          });
        }
        
        // Redirect to the saved consultation
        if (id === 'new') {
          navigate(`/consultation/${result.data.id}`);
        }
        
        return result.data.id;
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save consultation',
          variant: 'destructive',
        });
        return null;
      }
    } catch (err) {
      console.error('Error saving consultation:', err);
      toast({
        title: 'Error',
        description: `Failed to save consultation: ${(err as Error).message}`,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    handleSaveConsultation,
    isSubmitting
  };
};
