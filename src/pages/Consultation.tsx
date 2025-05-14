import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import PatientHeader from '@/components/Anthropometry/PatientHeader';
import ConsultationWizard from '@/components/Consultation/ConsultationWizard';
import { supabase } from '@/integrations/supabase/client';
import { useConsultation } from '@/contexts/ConsultationContext';
import { Patient, ConsultationData } from '@/types';
import { getObjectiveFromGoals, calculateAge } from '@/utils/patientUtils';
import ConsultationForm from '@/components/Consultation/ConsultationForm';
import ConsultationResults from '@/components/Consultation/ConsultationResults';
import { useConsultationForm } from '@/hooks/useConsultationForm';
import usePatientData from './ConsultationHooks/usePatientData';
import useAutoSave from './ConsultationHooks/useAutoSave';
import { v4 as uuidv4 } from 'uuid';

const Consultation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { activePatient, setActivePatient, consultationData, setConsultationData } = useConsultation();
  const [patientId, setPatientId] = useState<string | null>(null);
  
  const patientData = location.state?.patientData || activePatient;
  const repeatConsultation = location.state?.repeatConsultation;
  
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
  
  useEffect(() => {
    if (patientData && patientData.id) {
      setPatientId(patientData.id);
    }
  }, [patientData]);
  
  const isSaving = useAutoSave({
    consultationId,
    formData,
    results,
    setLastAutoSave
  });
  
  // Fetch patient data if not available
  usePatientData({
    patientData,
    setActivePatient,
    setFormData
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId) {
      toast({
        title: "Erro",
        description: "ID do paciente não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    // Create complete consultation data object
    const fullConsultationData: ConsultationData = {
      id: consultationId || uuidv4(),
      user_id: supabase.auth.getUser()?.data?.user?.id || '',
      patient_id: patientId,
      patient: {
        id: patientId,
        name: patientData?.name || '',
        gender: formData.sex === 'M' ? 'M' : 'F', 
        age: formData.age ? parseInt(formData.age) : 0
      },
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      objective: formData.objective,
      activityLevel: formData.activityLevel,
      gender: formData.sex === 'M' ? 'male' : 'female',
      created_at: new Date().toISOString(),
      tipo: formData.consultationType || 'primeira_consulta',
      results: results
    };
    
    // Save consultation data to context
    setConsultationData(fullConsultationData);
    
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
          
          {patientData && (
            <PatientHeader 
              patientName={patientData.name}
              patientAge={formData.age ? parseInt(formData.age) : undefined}
              patientGender={patientData.gender}
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
