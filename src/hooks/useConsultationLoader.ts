
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ConsultationData } from '@/types';
import { PatientService } from '@/services/patient';
import { useToast } from '@/hooks/use-toast';

// Define internal hooks for consultation data
const useConsultationData = (consultationId?: string) => {
  const [consultation, setConsultation] = useState<ConsultationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const createNewConsultation = (patientId: string, patientName: string) => {
    // Create new consultation logic
    const newConsultation = {
      id: `new-${Date.now()}`,
      patient_id: patientId,
      patient: { name: patientName },
    } as ConsultationData;
    
    setConsultation(newConsultation);
    return newConsultation;
  };
  
  return {
    consultation,
    setConsultation,
    isLoading,
    error,
    createNewConsultation
  };
};

// Define internal hook for patient data
const useConsultationPatient = (patientId?: string) => {
  const [patient, setPatient] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [isPatientsLoading, setIsPatientsLoading] = useState(false);
  const { toast } = useToast();
  
  const loadPatient = async (id: string) => {
    if (!id) return;
    
    try {
      const result = await PatientService.getPatient(id);
      
      if (result && result.success) {
        setPatient(result.data);
      } else if (result && result.error) {
        console.error("Failed to load patient:", result.error);
        toast({
          title: "Erro ao carregar paciente",
          description: "Não foi possível carregar os dados do paciente."
        });
      }
    } catch (error: any) {
      console.error("Error loading patient:", error);
    }
  };
  
  return { patient, patients, isPatientsLoading, loadPatient };
};

export function useConsultationLoader() {
  const params = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Extract ID from either URL parameter or query parameter
  const consultationId = params.id;
  const searchParams = new URLSearchParams(location.search);
  const patientIdFromQuery = searchParams.get('patientId');
  
  // Custom hooks
  const { 
    consultation, 
    setConsultation, 
    isLoading, 
    error, 
    createNewConsultation 
  } = useConsultationData(consultationId);
  
  const { 
    patient, 
    patients, 
    isPatientsLoading,
    loadPatient 
  } = useConsultationPatient(consultation?.patient_id || patientIdFromQuery || undefined);
  
  // Load patient data when patientId changes
  useEffect(() => {
    const patientId = consultation?.patient_id || patientIdFromQuery;
    if (patientId && !patient) {
      console.log("Loading patient data for ID:", patientId);
      loadPatient(patientId);
    }
  }, [consultation?.patient_id, patientIdFromQuery, patient, loadPatient]);
  
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
            console.error("Failed to fetch patient data:", patientResult.error);
            throw new Error("Failed to fetch patient data");
          }
          
          const patientName = patientResult.data.name;
          console.log("Patient name retrieved:", patientName);
          
          // Create a new consultation with this patient
          const newConsultation = createNewConsultation(patientIdFromQuery, patientName);
          console.log("New consultation created:", newConsultation);
          
          // If there's a redirect parameter, handle it
          const redirectTo = searchParams.get('redirectTo');
          if (redirectTo) {
            console.log("Will redirect to:", redirectTo);
          }
        } catch (error) {
          console.error("Error setting up consultation:", error);
          toast({
            title: "Erro ao criar consulta",
            description: "Não foi possível criar uma nova consulta para o paciente selecionado",
            variant: "destructive"
          });
        }
      }
    };
    
    setupConsultationData();
  }, [patientIdFromQuery, consultationId, consultation, isLoading, createNewConsultation, searchParams, toast]);

  // Add debug logs for monitoring state changes
  useEffect(() => {
    console.log("Consultation data:", consultation ? {
      id: consultation.id,
      patient_id: consultation.patient_id,
      patientName: consultation.patient?.name
    } : null);
    
    console.log("Patient data:", patient ? {
      id: patient.id,
      name: patient.name
    } : null);
  }, [consultation, patient]);

  return {
    consultationId,
    patientIdFromQuery,
    consultation, 
    setConsultation,
    patient,
    patients,
    isLoading: isLoading || isPatientsLoading,
    error,
    navigate
  };
}
