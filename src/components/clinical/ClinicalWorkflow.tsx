
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatient } from '@/contexts/patient/PatientContext';
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
  
  const [currentStep, setCurrentStep] = useState<ClinicalWorkflowStep>('patient-selection');
  const [consultation, setConsultation] = useState<ConsultationData | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Use the new clinical session hook
  const { session, isLoading: isSessionLoading, isSaving, updateSession, completeSession } = useClinicalSession(
    patientId || activePatient?.id, 
    appointmentId
  );
  
  // Load patient from URL params if needed
  React.useEffect(() => {
    if (patientId && !activePatient) {
      loadPatientById(patientId);
      setCurrentStep('patient-info');
    }
  }, [patientId, activePatient, loadPatientById]);
  
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
        activePatient={activePatient}
        activeConsultation={consultation}
        isSaving={isSaving}
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
          <WorkflowSteps 
            currentStep={currentStep}
            patient={activePatient}
            consultation={consultation}
            setConsultation={updateConsultationData}
          />
        </TabsContent>
        
        <TabsContent value="audit" className="space-y-4">
          <ClinicalFlowAuditPanel 
            patientId={patientId || activePatient?.id}
            appointmentId={appointmentId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClinicalWorkflow;
