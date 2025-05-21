
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ConsultationWizard from '@/components/Consultation/ConsultationWizard';
import ConsultationResults from '@/components/Consultation/ConsultationResults';
import { ConsultationData } from '@/types';
import ConsultationFormWrapper from '@/components/Consultation/ConsultationFormWrapper';
import { useConsultationData } from '@/hooks/useConsultationData';
import { useConsultationPatient } from '@/hooks/patient/useConsultationPatient';
import { useSaveConsultation } from '@/hooks/useSaveConsultation';
import useAutoSave from './ConsultationHooks/useAutoSave';
import usePatientData from './ConsultationHooks/usePatientData';
import { Card, CardContent } from '@/components/ui/card';
import { PatientService } from '@/services/patient';

// Wrapper for updatePatientData to match expected signature
const patientDataUpdateWrapper = async (
  patientId: string, 
  updateData: any
): Promise<void> => {
  const { updatePatientData } = usePatientData();
  await updatePatientData(patientId, updateData);
}

const Consultation = () => {
  const params = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Extract ID from either URL parameter or query parameter
  const consultationId = params.id;
  const searchParams = new URLSearchParams(location.search);
  const patientIdFromQuery = searchParams.get('patientId');
  
  // Add console logs to help with debugging
  console.log("Consultation page rendering", { 
    "consultationId from params": consultationId,
    "patientId from query": patientIdFromQuery
  });
  
  // Custom hooks
  const { consultation, setConsultation, isLoading, error, createNewConsultation } = useConsultationData(consultationId);
  const { patient, patients, isPatientsLoading } = useConsultationPatient(consultation?.patient_id || patientIdFromQuery || undefined);
  const { saveConsultation, autoSaveStatus } = useAutoSave(consultationId);
  const { updatePatientData } = usePatientData();
  const { handleSaveConsultation, isSubmitting } = useSaveConsultation();
  
  // If we have a patientId from query but no consultation, create a new one
  useEffect(() => {
    const setupConsultationData = async () => {
      // Only create a new consultation if we have a patientId from query and no existing consultation
      if (patientIdFromQuery && !consultationId && !consultation && !isLoading) {
        try {
          console.log("Creating new consultation for patient:", patientIdFromQuery);
          
          // First, fetch the patient to get their name
          const patientResult = await PatientService.getPatient(patientIdFromQuery);
          
          if (!patientResult.success) {
            throw new Error("Failed to fetch patient data");
          }
          
          const patientName = patientResult.data.name;
          
          // Create a new consultation with this patient
          const newConsultation = createNewConsultation(patientIdFromQuery, patientName);
          console.log("New consultation created:", newConsultation);
        } catch (error) {
          console.error("Error setting up consultation:", error);
        }
      }
    };
    
    setupConsultationData();
  }, [patientIdFromQuery, consultationId, consultation, isLoading, createNewConsultation]);
  
  useEffect(() => {
    console.log("Consultation data:", consultation);
    console.log("Patient:", patient);
  }, [consultation, patient]);
  
  const handleFormChange = (data: Partial<ConsultationData>) => {
    if (!consultation) return;
    
    const updatedConsultation = {
      ...consultation,
      ...data,
    };
    
    setConsultation(updatedConsultation);
    
    // Auto-save when changes are made
    saveConsultation(updatedConsultation);
  };
  
  const handleStepChange = (newStep: number) => {
    setStep(newStep);
  };
  
  const handleSaveConsultationClick = async () => {
    if (!consultation) return;
    await handleSaveConsultation(
      consultationId || '', 
      consultation, 
      patientDataUpdateWrapper
    );
  };
  
  // Handle loading and error states
  if (isLoading || isPatientsLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutri-green"></div>
            <span className="ml-3">Carregando consulta...</span>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-8">
            <h2 className="text-xl font-bold text-red-600 mb-4">Erro ao carregar consulta</h2>
            <p>{error.message || "Ocorreu um erro ao carregar os dados da consulta"}</p>
            <button 
              className="mt-4 px-4 py-2 bg-nutri-blue text-white rounded hover:bg-blue-700"
              onClick={() => navigate('/dashboard')}
            >
              Voltar para o Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!consultation) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-8">
            <h2 className="text-xl font-bold mb-4">Consulta não encontrada</h2>
            <p>A consulta solicitada não foi encontrada ou você não tem permissão para acessá-la.</p>
            <button 
              className="mt-4 px-4 py-2 bg-nutri-blue text-white rounded hover:bg-blue-700"
              onClick={() => navigate('/dashboard')}
            >
              Voltar para o Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <ConsultationWizard
        currentStep={step}
        onStepChange={handleStepChange}
        isLoading={isLoading}
      >
        {step === 1 && consultation && (
          <ConsultationFormWrapper
            consultation={consultation}
            onFormChange={handleFormChange}
            patient={patient}
            patients={patients}
            autoSaveStatus={autoSaveStatus}
          />
        )}
        
        {step === 2 && consultation && consultation.results && (
          <ConsultationResults
            results={consultation.results}
            onSave={handleSaveConsultationClick}
            isSaving={isSubmitting}
          />
        )}
      </ConsultationWizard>
    </div>
  );
};

export default Consultation;
