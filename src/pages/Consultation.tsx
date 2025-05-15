
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConsultationWizard from '@/components/Consultation/ConsultationWizard';
import ConsultationForm from '@/components/Consultation/ConsultationForm';
import ConsultationResults from '@/components/Consultation/ConsultationResults';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { consultationService } from '@/services';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/hooks/usePatient';
import { ConsultationData } from '@/types';
import { usePatientOptions } from '@/hooks/usePatientOptions';
import useAutoSave from './ConsultationHooks/useAutoSave';
import usePatientData from './ConsultationHooks/usePatientData';

const emptyConsultation: ConsultationData = {
  patient: {
    name: '',
  },
  date: new Date().toISOString().split('T')[0],
  anthropometry: {
    weight: 0,
    height: 0,
    age: 0,
    gender: 'female',
    activityFactor: 1.2,
    bodyFat: null,
  },
  nutritionalObjectives: {
    objective: 'maintenance',
    customCalories: null,
  },
  macroDistribution: {
    protein: 0,
    carbs: 0,
    fat: 0,
  },
  results: {
    bmr: 0,
    tdee: 0, // Changed from tdee to match the result structure
    adjustedCalories: 0,
    proteinGrams: 0,
    carbsGrams: 0,
    fatGrams: 0,
  },
  recommendations: '',
  notes: '',
};

const Consultation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [consultation, setConsultation] = useState<ConsultationData>(emptyConsultation);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { patient } = usePatient(consultation?.patient_id);
  const { patients } = usePatientOptions();
  
  const { saveConsultation, autoSaveStatus } = useAutoSave(id);
  const { updatePatientData } = usePatientData();
  
  const fetchConsultation = async () => {
    if (!id || id === 'new') return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('calculations') // Using calculations table instead of consultations
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Transform data to match ConsultationData type
      const consultationData: ConsultationData = {
        patient: {
          name: '',
        },
        patient_id: data.patient_id,
        anthropometry: {
          weight: data.weight || 0,
          height: data.height || 0,
          age: data.age || 0,
          gender: data.gender === 'male' ? 'male' : 'female',
          activityFactor: parseActivityFactor(data.activity_level),
          bodyFat: null,
        },
        nutritionalObjectives: {
          objective: data.goal || 'maintenance',
          customCalories: null,
        },
        macroDistribution: {
          protein: data.protein || 0,
          carbs: data.carbs || 0,
          fat: data.fats || 0,
        },
        results: {
          bmr: data.bmr || 0,
          tdee: data.tdee || 0,
          adjustedCalories: 0, // Calculate based on goal
          proteinGrams: 0, // Calculate from macros
          carbsGrams: 0,   // Calculate from macros
          fatGrams: 0,     // Calculate from macros
        },
        recommendations: data.notes || '',
        notes: data.notes || '',
      };
      
      // Find patient in the list
      const patientInfo = patients.find(p => p.id === data.patient_id);
      if (patientInfo) {
        consultationData.patient.name = patientInfo.name;
      }
      
      setConsultation(consultationData);
    } catch (err) {
      console.error('Error loading consultation:', err);
      toast({
        title: 'Error',
        description: `Failed to load consultation: ${(err as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to parse activity level to activity factor
  const parseActivityFactor = (activityLevel: string | null): number => {
    switch (activityLevel) {
      case 'sedentario': return 1.2;
      case 'leve': return 1.375;
      case 'moderado': return 1.55;
      case 'intenso': return 1.725;
      case 'muito_intenso': return 1.9;
      default: return 1.2;
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchConsultation();
    }
  }, [id, user, patients]);
  
  const handleFormChange = (data: Partial<ConsultationData>) => {
    setConsultation(prev => ({
      ...prev,
      ...data,
    }));
    
    // Auto-save when changes are made
    saveConsultation({
      ...consultation,
      ...data,
    });
  };
  
  const handleStepChange = (newStep: number) => {
    setStep(newStep);
  };
  
  const handleSaveConsultation = async () => {
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
      const result = await consultationService.saveConsultation({
        id: id !== 'new' ? id : undefined,
        patient_id: consultation.patient_id || '',
        date: consultation.date,
        anthropometry: consultation.anthropometry,
        nutritional_objectives: consultation.nutritionalObjectives,
        macro_distribution: consultation.macroDistribution,
        results: consultation.results,
        recommendations: consultation.recommendations,
        notes: consultation.notes,
        user_id: user.id,
      });
      
      if (result.id) {
        toast({
          title: 'Success',
          description: 'Consultation saved successfully',
        });
        
        // Update patient data if this is a new consultation
        if (consultation.patient_id) {
          await updatePatientData(consultation.patient_id, {
            measurements: {
              weight: consultation.anthropometry.weight,
              height: consultation.anthropometry.height,
            },
          });
        }
        
        // Redirect to the saved consultation
        if (id === 'new') {
          navigate(`/consultation/${result.id}`);
        }
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save consultation',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error saving consultation:', err);
      toast({
        title: 'Error',
        description: `Failed to save consultation: ${(err as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <ConsultationWizard
        currentStep={step}
        onStepChange={handleStepChange}
        isLoading={isLoading}
      >
        <ConsultationForm
          consultation={consultation}
          onFormChange={handleFormChange}
          patient={patient}
          patients={patients}
          autoSaveStatus={autoSaveStatus}
        />
        
        <ConsultationResults
          consultation={consultation}
          onSave={handleSaveConsultation}
          isSaving={isSubmitting}
        />
      </ConsultationWizard>
    </div>
  );
};

export default Consultation;
