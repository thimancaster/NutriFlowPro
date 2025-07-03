
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useClinical } from '@/contexts/ClinicalContext';
import { ConsultationData } from '@/types/consultation';
import { ClinicalWorkflowStep } from '@/types/clinical';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PatientSelectionStep from './PatientSelectionStep';
import PatientInfoStep from './PatientInfoStep';
import WorkflowHeader from './WorkflowHeader';
import WorkflowSteps from './WorkflowSteps';
import ClinicalFlowAuditPanel from './ClinicalFlowAuditPanel';
import { useClinicalSession } from '@/hooks/clinical/useClinicalSession';

const ClinicalWorkflow: React.FC = () => {
  const { patientId, appointmentId } = useParams();
  const navigate = useNavigate();
  const { activePatient, loadPatientById } = usePatient();
  const { 
    activePatient: clinicalPatient, 
    activeConsultation: clinicalConsultation,
    currentStep: clinicalStep,
    setCurrentStep: setClinicalStep,
    isSaving: clinicalSaving,
    lastSaved: clinicalLastSaved
  } = useClinical();
  
  // Use clinical context state or fallback to local state
  const [currentStep, setCurrentStep] = useState<ClinicalWorkflowStep>(clinicalStep);
  const [consultation, setConsultation] = useState<ConsultationData | null>(clinicalConsultation);
  const [lastSaved, setLastSaved] = useState<Date | null>(clinicalLastSaved);
  
  // Use the new clinical session hook when we have a patient
  const effectivePatientId = patientId || activePatient?.id || clinicalPatient?.id;
  const { session, isLoading: isSessionLoading, isSaving, updateSession, completeSession } = useClinicalSession(
    effectivePatientId, 
    appointmentId
  );
  
  // Sync with clinical context
  useEffect(() => {
    if (clinicalPatient && clinicalPatient !== activePatient) {
      console.log('Sincronizando paciente do contexto clínico:', clinicalPatient);
    }
    
    if (clinicalConsultation) {
      setConsultation(clinicalConsultation);
    }
    
    if (clinicalStep !== currentStep) {
      setCurrentStep(clinicalStep);
    }
    
    if (clinicalLastSaved) {
      setLastSaved(clinicalLastSaved);
    }
  }, [clinicalPatient, clinicalConsultation, clinicalStep, clinicalLastSaved]);

  // Load patient from URL params if needed
  useEffect(() => {
    if (patientId && !activePatient && !clinicalPatient) {
      console.log('Carregando paciente da URL:', patientId);
      loadPatientById(patientId);
      setCurrentStep('patient-info');
      setClinicalStep('patient-info');
    }
  }, [patientId, activePatient, clinicalPatient, loadPatientById, setClinicalStep]);
  
  // Sync session data with consultation state
  React.useEffect(() => {
    if (session && session.clinical_data) {
      const consultationData: ConsultationData = {
        id: session.id,
        patient_id: session.patient_id,
        user_id: session.user_id,
        weight: session.clinical_data.weight || 0,
        height: session.clinical_data.height || 0,
        age: session.clinical_data.age || 0,
        gender: session.clinical_data.gender || 'female',
        activity_level: session.clinical_data.activity_level || 'moderado',
        objective: session.clinical_data.goal || 'manutenção',
        bmr: session.clinical_data.bmr || 0,
        protein: session.clinical_data.protein || 0,
        carbs: session.clinical_data.carbs || 0,
        fats: session.clinical_data.fats || 0,
        totalCalories: session.clinical_data.tdee || 0,
        date: session.created_at.split('T')[0],
        created_at: session.created_at,
        results: {
          bmr: session.clinical_data.bmr || 0,
          get: session.clinical_data.tdee || 0,
          vet: 0, // Calculate if needed
          adjustment: 0,
          macros: {
            protein: session.clinical_data.protein || 0,
            carbs: session.clinical_data.carbs || 0,
            fat: session.clinical_data.fats || 0
          }
        }
      };
      setConsultation(consultationData);
    }
  }, [session]);
  
  // Handle save action
  const handleSave = async () => {
    if (consultation && session) {
      await updateSession({
        weight: consultation.weight,
        height: consultation.height,
        age: consultation.age,
        gender: consultation.gender,
        activity_level: consultation.activity_level,
        goal: consultation.objective,
        bmr: consultation.bmr,
        tdee: consultation.totalCalories,
        protein: consultation.protein,
        carbs: consultation.carbs,
        fats: consultation.fats,
        notes: consultation.notes
      });
      setLastSaved(new Date());
    }
  };

  // Handle complete consultation
  const handleComplete = async () => {
    await completeSession();
    console.log('Consultation completed');
  };

  const updateConsultationData = (updates: Partial<ConsultationData>) => {
    setConsultation(prev => prev ? { ...prev, ...updates } : null);
    
    // Auto-save changes
    if (session) {
      updateSession({
        weight: updates.weight,
        height: updates.height,
        age: updates.age,
        gender: updates.gender,
        activity_level: updates.activity_level,
        goal: updates.objective,
        bmr: updates.bmr,
        tdee: updates.totalCalories,
        protein: updates.protein,
        carbs: updates.carbs,
        fats: updates.fats
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <WorkflowHeader
        activePatient={clinicalPatient || activePatient}
        activeConsultation={consultation}
        isSaving={isSaving || clinicalSaving}
        lastSaved={lastSaved}
        onSave={handleSave}
        onComplete={handleComplete}
      />
      
      <Tabs defaultValue="workflow" className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workflow">Fluxo Clínico</TabsTrigger>
          <TabsTrigger value="audit">Auditoria Técnica</TabsTrigger>
        </TabsList>
        
        <TabsContent value="workflow" className="space-y-4">
          {currentStep === 'patient-selection' && <PatientSelectionStep />}
          {currentStep !== 'patient-selection' && (
            <WorkflowSteps 
              currentStep={currentStep}
              patient={clinicalPatient || activePatient}
              consultation={consultation}
              setConsultation={updateConsultationData}
            />
          )}
          
          {currentStep === 'patient-info' && (clinicalPatient || activePatient) && (
            <Card>
              <CardHeader>
                <CardTitle>Dados do Paciente</CardTitle>
              </CardHeader>
              <CardContent>
                <PatientInfoStep />
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="audit" className="space-y-4">
          <ClinicalFlowAuditPanel 
            patientId={effectivePatientId}
            appointmentId={appointmentId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClinicalWorkflow;
