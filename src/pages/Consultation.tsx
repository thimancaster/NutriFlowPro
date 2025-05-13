import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import PatientHeader from '@/components/Anthropometry/PatientHeader';
import ConsultationWizard from '@/components/Consultation/ConsultationWizard';
import { supabase } from '@/integrations/supabase/client';
import { useConsultation } from '@/contexts/ConsultationContext';
import { Patient } from '@/types';
import { getObjectiveFromGoals, calculateAge } from '@/utils/patientUtils';
import ConsultationForm from '@/components/Consultation/ConsultationForm';
import ConsultationResults from '@/components/Consultation/ConsultationResults';
import { useConsultationForm } from '@/hooks/useConsultationForm';
import { updateConsultationStatus, updateConsultationType } from '@/components/calculator/handlers/consultationHandlers';
import { handleAutoSaveConsultation } from '@/components/calculator/handlers/consultationHandlers';

// Auto-save interval in milliseconds (2 minutes)
const AUTO_SAVE_INTERVAL = 2 * 60 * 1000;

// Helper function to convert patient data in the component when it's loaded
const convertPatientData = (dbPatient: any): Patient => {
  let address = dbPatient.address;
  if (typeof address === 'string') {
    try {
      address = JSON.parse(address);
    } catch (e) {
      address = {}; // Initialize with empty object that matches the Patient interface
    }
  }
  
  let goals = dbPatient.goals;
  if (typeof goals === 'string') {
    try {
      goals = JSON.parse(goals);
    } catch (e) {
      goals = { objective: undefined, profile: undefined };
    }
  }
  
  return {
    ...dbPatient,
    address: address || {},
    goals: goals || {}
  };
};

const Consultation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { activePatient, setActivePatient, consultationData, setConsultationData } = useConsultation();
  
  const patientData = location.state?.patientData || activePatient;
  const repeatConsultation = location.state?.repeatConsultation;
  
  const [patient, setPatient] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize form with any repeat consultation data if available
  const initialFormData = repeatConsultation ? {
    weight: repeatConsultation.weight?.toString() || '',
    height: repeatConsultation.height?.toString() || '',
    sex: repeatConsultation.sex || 'M',
    objective: repeatConsultation.objective || 'manutenção',
    profile: repeatConsultation.profile || 'magro',
    activityLevel: repeatConsultation.activityLevel || 'moderado',
    consultationType: repeatConsultation.tipo || 'primeira_consulta',
    consultationStatus: repeatConsultation.status || 'em_andamento'
  } : {};
  
  const { 
    formData, 
    results, 
    handleInputChange, 
    handleSelectChange, 
    setFormData,
    lastAutoSave,
    setLastAutoSave,
    consultationId,
    setConsultationId
  } = useConsultationForm(initialFormData);
  
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
  
  // Fetch patient data if not available
  useEffect(() => {
    const fetchPatient = async () => {
      if (patientData) {
        setPatient(patientData);
        setActivePatient(patientData as Patient);
        
        if (patientData.birth_date) {
          const age = calculateAge(patientData.birth_date);
          
          setFormData(prev => ({ 
            ...prev, 
            age: age ? age.toString() : '',
            sex: patientData.gender === 'female' ? 'F' : 'M',
            objective: getObjectiveFromGoals(patientData.goals)
          }));
        }
        return;
      }
      
      const urlParams = new URLSearchParams(location.search);
      const patientId = urlParams.get('patientId');
      
      if (patientId) {
        try {
          const { data, error } = await supabase
            .from('patients')
            .select('*')
            .eq('id', patientId)
            .single();
          
          if (error) throw error;
          
          // Convert the raw data to a Patient type with correct goals structure
          const dbPatient = data;
          const patient = convertPatientData(dbPatient);
          
          setPatient(patient);
          setActivePatient(patient);
          
          if (data.birth_date) {
            const age = calculateAge(data.birth_date);
            
            setFormData(prev => ({ 
              ...prev, 
              age: age ? age.toString() : '',
              sex: data.gender === 'female' ? 'F' : 'M',
              objective: getObjectiveFromGoals(data.goals)
            }));
          }
        } catch (error: any) {
          console.error('Error fetching patient:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do paciente.",
            variant: "destructive"
          });
        }
      }
    };
    
    fetchPatient();
  }, [location, patientData, repeatConsultation, toast, setActivePatient, setFormData]);
  
  const handleSubmit = async (e: React.FormEvent) => {
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
          formData.consultationStatus as 'em_andamento' | 'completo'
        );
      } catch (error) {
        console.error('Error updating consultation metadata:', error);
      }
    }
    
    toast({
      title: "Consulta salva com sucesso",
      description: "Os resultados foram calculados e estão prontos para gerar um plano alimentar.",
    });
    
    navigate('/meal-plan-generator');
  };
  
  const handleNext = () => {
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };
  
  const handleBack = () => {
    navigate('/patients');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <ConsultationWizard 
          currentStep={1} 
          onNext={handleNext} 
          onBack={handleBack}
          canGoNext={formData.weight && formData.height && formData.age ? true : false}
          nextButtonLabel="Gerar Plano Alimentar"
        >
          <h1 className="text-3xl font-bold mb-6 text-nutri-blue">Nova Consulta</h1>
          
          {patient && (
            <PatientHeader 
              patientName={patient.name}
              patientAge={formData.age ? parseInt(formData.age) : undefined}
              patientGender={patient.gender}
              patientObjective={formData.objective}
            />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card className="nutri-card shadow-lg border-none">
                <CardHeader>
                  <CardTitle>Dados da Consulta</CardTitle>
                </CardHeader>
                <CardContent>
                  <ConsultationForm 
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleSelectChange}
                    onSubmit={handleSubmit}
                    lastAutoSave={lastAutoSave}
                  />
                  
                  {isSaving && (
                    <div className="text-xs text-blue-500 mt-2">
                      Salvando alterações...
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card className="nutri-card shadow-lg border-none">
                <CardHeader>
                  <CardTitle>Resultados do Cálculo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ConsultationResults results={results} />
                </CardContent>
              </Card>
            </div>
          </div>
        </ConsultationWizard>
      </div>
    </div>
  );
};

export default Consultation;
