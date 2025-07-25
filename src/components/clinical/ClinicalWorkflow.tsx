
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { ConsultationData } from '@/types/consultation';
import { ClinicalWorkflowStep } from '@/types/clinical';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PatientSelectionStep from './PatientSelectionStep';
import PatientInfoStep from './PatientInfoStep';
import AnthropometryStep from './AnthropometryStep';
import NutritionalEvaluationStep from './NutritionalEvaluationStep';
import MealPlanStep from './MealPlanStep';
import RecommendationsStep from './RecommendationsStep';
import AppointmentStep from './AppointmentStep';
import WorkflowHeader from './WorkflowHeader';
import WorkflowSteps from './WorkflowSteps';
import ClinicalFlowAuditPanel from './ClinicalFlowAuditPanel';
import PatientHistoryPanel from '../patient/PatientHistoryPanel';
import usePatientDataLoader from '@/hooks/usePatientDataLoader';

const ClinicalWorkflow: React.FC = () => {
  const { patientId, appointmentId } = useParams();
  const navigate = useNavigate();
  
  const { 
    selectedPatient,
    consultationData,
    currentStep,
    setCurrentStep,
    setSelectedPatient,
    isConsultationActive,
    isSaving,
    lastSaved,
    isLoading,
    patientHistoryData,
    autoSave,
    completeConsultation
  } = useConsultationData();
  
  const { 
    completeData, 
    isLoading: dataLoading 
  } = usePatientDataLoader({ 
    patientId: selectedPatient?.id, 
    enabled: !!selectedPatient?.id 
  });
  
  // Load patient from URL params if needed
  useEffect(() => {
    if (patientId && !selectedPatient) {
      console.log('Carregando paciente da URL para contexto integrado:', patientId);
      // This would need to load patient data and set it
      // For now, redirect to patient selection if no patient is selected
      if (currentStep !== 'patient-selection') {
        setCurrentStep('patient-selection');
      }
    }
  }, [patientId, selectedPatient, currentStep, setCurrentStep]);
  
  // Console log for debugging the integrated ecosystem
  React.useEffect(() => {
    console.log('🔄 Clinical Workflow State:', {
      selectedPatient: !!selectedPatient,
      patientName: selectedPatient?.name,
      consultationActive: isConsultationActive,
      currentStep,
      hasHistoryData: !!patientHistoryData,
      hasConsultationData: !!consultationData,
      hasResults: !!(consultationData?.results),
      isLoading: isLoading || dataLoading
    });
  }, [selectedPatient, isConsultationActive, currentStep, patientHistoryData, consultationData, isLoading, dataLoading]);
  
  // Unified handlers using the integrated context
  const handleSave = async () => {
    await autoSave();
  };

  const handleComplete = async () => {
    await completeConsultation();
  };

  // Render the appropriate step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'patient-selection':
        return <PatientSelectionStep />;
      
      case 'patient-info':
        return selectedPatient ? (
          <Card>
            <CardHeader>
              <CardTitle>Dados do Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientInfoStep />
            </CardContent>
          </Card>
        ) : null;
      
      case 'anthropometry':
        return selectedPatient ? <AnthropometryStep /> : null;
      
      case 'nutritional-evaluation':
        return selectedPatient ? <NutritionalEvaluationStep /> : null;
      
      case 'meal-plan':
        return selectedPatient ? <MealPlanStep /> : null;
      
      case 'recommendations':
        return selectedPatient ? <RecommendationsStep /> : null;
      
      case 'follow-up':
        return selectedPatient ? <AppointmentStep /> : null;
      
      default:
        return <PatientSelectionStep />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <WorkflowHeader
        activePatient={selectedPatient}
        activeConsultation={consultationData}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onSave={handleSave}
        onComplete={handleComplete}
      />
      
      <Tabs defaultValue="workflow" className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflow">Fluxo Clínico</TabsTrigger>
          <TabsTrigger value="history" disabled={!selectedPatient}>Histórico</TabsTrigger>
          <TabsTrigger value="audit">Auditoria Técnica</TabsTrigger>
        </TabsList>
        
        <TabsContent value="workflow" className="space-y-4">
          {currentStep !== 'patient-selection' && (
            <WorkflowSteps 
              currentStep={currentStep}
              patient={selectedPatient}
              consultation={consultationData}
            />
          )}
          
          {renderStepContent()}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <PatientHistoryPanel 
            completeData={completeData}
            isLoading={dataLoading}
          />
        </TabsContent>
        
        <TabsContent value="audit" className="space-y-4">
          <ClinicalFlowAuditPanel 
            patientId={selectedPatient?.id}
            appointmentId={appointmentId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClinicalWorkflow;
