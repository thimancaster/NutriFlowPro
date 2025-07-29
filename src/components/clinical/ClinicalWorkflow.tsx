
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUnifiedEcosystem } from '@/contexts/UnifiedEcosystemContext';
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

const ClinicalWorkflow: React.FC = () => {
  const { patientId, appointmentId } = useParams();
  const navigate = useNavigate();
  
  const { 
    state,
    setActivePatient,
    setCurrentStep,
    saveCurrentState,
    resetEcosystem
  } = useUnifiedEcosystem();
  
  const {
    activePatient,
    currentStep,
    consultationData,
    isLoading,
    lastSaved
  } = state;
  
  // Load patient from URL params if needed
  useEffect(() => {
    if (patientId && !activePatient) {
      console.log('Carregando paciente da URL para contexto integrado:', patientId);
      // For now, redirect to patient selection if no patient is selected
      if (currentStep !== 'patient-selection') {
        setCurrentStep('patient-selection');
      }
    }
  }, [patientId, activePatient, currentStep, setCurrentStep]);
  
  // Console log for debugging the integrated ecosystem
  useEffect(() => {
    console.log('🔄 Clinical Workflow State:', {
      activePatient: !!activePatient,
      patientName: activePatient?.name,
      currentStep,
      hasConsultationData: !!consultationData,
      isLoading
    });
  }, [activePatient, currentStep, consultationData, isLoading]);
  
  // Unified handlers using the integrated context
  const handleSave = async () => {
    await saveCurrentState();
  };

  const handleComplete = async () => {
    await saveCurrentState();
    navigate('/dashboard');
  };

  // Map unified context steps to clinical workflow steps
  const mapUnifiedStepToClinical = (unifiedStep: string): ClinicalWorkflowStep => {
    switch (unifiedStep) {
      case 'patient': return 'patient-selection';
      case 'calculation': return 'nutritional-evaluation';
      case 'clinical': return 'anthropometry';
      case 'meal_plan': return 'meal-plan';
      case 'completed': return 'completed';
      default: return 'patient-selection';
    }
  };

  const mappedCurrentStep = mapUnifiedStepToClinical(currentStep);

  // Render the appropriate step content
  const renderStepContent = () => {
    switch (mappedCurrentStep) {
      case 'patient-selection':
        return <PatientSelectionStep />;
      
      case 'patient-info':
        return activePatient ? <PatientInfoStep /> : <PatientSelectionStep />;
        
      case 'anthropometry':
        return activePatient ? <AnthropometryStep /> : <PatientSelectionStep />;
      
      case 'nutritional-evaluation':
        return activePatient ? (
          <Card>
            <CardHeader>
              <CardTitle>Avaliação Nutricional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p>Complete a avaliação nutricional para continuar</p>
                <button 
                  onClick={() => navigate('/calculator')}
                  className="bg-nutri-green text-white px-4 py-2 rounded hover:bg-nutri-green-dark"
                >
                  Ir para Calculadora
                </button>
              </div>
            </CardContent>
          </Card>
        ) : <PatientSelectionStep />;
      
      case 'meal-plan':
        return activePatient ? <MealPlanStep /> : <PatientSelectionStep />;
      
      case 'recommendations':
        return activePatient ? <RecommendationsStep /> : <PatientSelectionStep />;
        
      case 'follow-up':
        return activePatient ? <AppointmentStep /> : <PatientSelectionStep />;
      
      case 'completed':
        return activePatient ? <RecommendationsStep /> : <PatientSelectionStep />;
      
      default:
        return <PatientSelectionStep />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <WorkflowHeader
        activePatient={activePatient}
        activeConsultation={consultationData}
        isSaving={isLoading}
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
          {mappedCurrentStep !== 'patient-selection' && (
            <WorkflowSteps 
              currentStep={mappedCurrentStep}
              patient={activePatient}
              consultation={consultationData}
            />
          )}
          
          {renderStepContent()}
        </TabsContent>
        
        <TabsContent value="audit" className="space-y-4">
          <ClinicalFlowAuditPanel 
            patientId={activePatient?.id}
            appointmentId={appointmentId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClinicalWorkflow;
