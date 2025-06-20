
import { useState } from 'react';
import { Patient, ConsultationData } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { ClinicalWorkflowStep } from '@/types/clinical';
import { saveMeasurement } from '@/services/anthropometryService';

export const useClinicalActions = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Start a new consultation for a patient
  const startNewConsultation = async (
    patient: Patient,
    setActivePatient: (patient: Patient | null) => void,
    setActiveConsultation: (consultation: ConsultationData | null) => void,
    setCurrentStep: (step: ClinicalWorkflowStep) => void
  ) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para iniciar uma consulta.",
        variant: "destructive"
      });
      return;
    }
    
    setActivePatient(patient);
    
    // Create initial consultation data
    const newConsultation: ConsultationData = {
      id: uuidv4(),
      patient_id: patient.id,
      user_id: user.id,
      date: new Date().toISOString(),
      weight: 0, // Will be set in the form
      height: 0, // Will be set in the form
      age: patient.age || 0,
      bmr: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      totalCalories: 0,
      gender: patient.gender || 'female',
      activity_level: 'moderado',
      objective: patient.goals?.objective || 'manutenção',
      results: {
        bmr: 0,
        get: 0,
        vet: 0,
        adjustment: 0,
        macros: {
          protein: 0,
          carbs: 0,
          fat: 0
        }
      }
    };
    
    setActiveConsultation(newConsultation);
    setCurrentStep('patient-info');
    
    try {
      // Save initial consultation data to database
      const { error } = await supabase
        .from('calculations')
        .insert({
          id: newConsultation.id,
          patient_id: patient.id,
          user_id: user.id,
          bmr: 0,
          tdee: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          weight: 0, // Will be updated when form is filled
          height: 0, // Will be updated when form is filled
          age: patient.age || 0,
          gender: patient.gender || 'female',
          activity_level: 'moderado',
          goal: patient.goals?.objective || 'manutenção',
          status: 'em_andamento'
        });
        
      if (error) {
        console.error('Error creating new consultation:', error);
        toast({
          title: "Erro",
          description: "Não foi possível criar uma nova consulta.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error starting new consultation:', error);
    }
  };
  
  // Save consultation data
  const saveConsultationData = async (
    activeConsultation: ConsultationData | null,
    setActiveConsultation: (consultation: ConsultationData | null) => void,
    data: Partial<ConsultationData>
  ): Promise<boolean> => {
    if (!activeConsultation || !user) return false;
    
    setIsSaving(true);
    
    try {
      // Update local state
      const updatedConsultation = {
        ...activeConsultation,
        ...data,
        updated_at: new Date().toISOString()
      };
      
      setActiveConsultation(updatedConsultation);
      
      // Save to calculations table
      const { error } = await supabase
        .from('calculations')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeConsultation.id);
        
      if (error) {
        console.error('Error saving consultation data:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar os dados da consulta.",
          variant: "destructive"
        });
        return false;
      }

      // If weight and height are provided, also save to anthropometry table
      if (data.weight && data.height && activeConsultation.patient_id) {
        const measurementData = {
          patient_id: activeConsultation.patient_id,
          date: new Date().toISOString(),
          weight: data.weight,
          height: data.height,
          imc: data.weight / Math.pow(data.height / 100, 2)
        };

        const measurementResult = await saveMeasurement(measurementData, user.id);
        if (!measurementResult.success) {
          console.error('Error saving measurement:', measurementResult.error);
          // Don't fail the whole operation if measurement save fails
        }
      }
      
      setLastSaved(new Date());
      return true;
    } catch (error) {
      console.error('Error in saveConsultationData:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  
  // Complete consultation
  const completeConsultation = async (
    activeConsultation: ConsultationData | null
  ): Promise<boolean> => {
    if (!activeConsultation || !user) return false;
    
    setIsSaving(true);
    
    try {
      // Update consultation status in database
      const { error } = await supabase
        .from('calculations')
        .update({
          status: 'completo',
          updated_at: new Date().toISOString()
        })
        .eq('id', activeConsultation.id);
        
      if (error) {
        console.error('Error completing consultation:', error);
        toast({
          title: "Erro",
          description: "Não foi possível finalizar a consulta.",
          variant: "destructive"
        });
        return false;
      }
      
      // Update appointment if created from appointment
      if (activeConsultation.appointment_id) {
        await supabase
          .from('appointments')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', activeConsultation.appointment_id);
      }
      
      // Update patient's last appointment date
      await supabase
        .from('patients')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', activeConsultation.patient_id);
      
      toast({
        title: "Consulta finalizada",
        description: "A consulta foi finalizada com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('Error in completeConsultation:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    lastSaved,
    startNewConsultation,
    saveConsultationData,
    completeConsultation
  };
};

export default useClinicalActions;
