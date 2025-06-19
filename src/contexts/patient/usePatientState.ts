
import { useState, useCallback } from 'react';
import { Patient } from '@/types/patient';
import { PatientService } from '@/services/patient';
import { useToast } from '@/hooks/use-toast';

export const usePatientState = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPatients = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await PatientService.getPatients(userId);
      
      if (result.success && result.data) {
        // Transform the data to match Patient interface
        const transformedPatients = result.data.map((patient: any) => ({
          id: patient.id,
          name: patient.name,
          email: patient.email || '',
          phone: patient.phone || '',
          secondaryPhone: patient.secondaryphone || '',
          cpf: patient.cpf || '',
          birth_date: patient.birth_date || '',
          gender: patient.gender as 'male' | 'female' | 'other' || 'other',
          address: patient.address || '',
          notes: patient.notes || '',
          status: patient.status as 'active' | 'inactive' || 'active',
          goals: patient.goals || {},
          created_at: patient.created_at,
          updated_at: patient.updated_at,
          user_id: patient.user_id,
          age: patient.birth_date ? calculateAge(patient.birth_date) : undefined
        }));
        
        setPatients(transformedPatients);
      } else {
        setError(result.error || 'Failed to fetch patients');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createPatient = useCallback(async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await PatientService.savePatient(patientData);
      
      if (result.success && result.data) {
        const newPatient = {
          ...result.data,
          age: result.data.birth_date ? calculateAge(result.data.birth_date) : undefined
        } as Patient;
        
        setPatients(prev => [...prev, newPatient]);
        toast({
          title: "Success",
          description: "Patient created successfully",
        });
        return { success: true, data: newPatient };
      } else {
        setError(result.error || 'Failed to create patient');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updatePatient = useCallback(async (patientId: string, patientData: Partial<Patient>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await PatientService.updatePatient(patientId, patientData);
      
      if (result.success && result.data) {
        const updatedPatient = {
          ...result.data,
          age: result.data.birth_date ? calculateAge(result.data.birth_date) : undefined
        } as Patient;
        
        setPatients(prev => 
          prev.map(patient => 
            patient.id === patientId ? updatedPatient : patient
          )
        );
        toast({
          title: "Success",
          description: "Patient updated successfully",
        });
        return { success: true, data: updatedPatient };
      } else {
        setError(result.error || 'Failed to update patient');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deletePatient = useCallback(async (patientId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await PatientService.deletePatient(patientId);
      
      if (result.success) {
        setPatients(prev => prev.filter(patient => patient.id !== patientId));
        toast({
          title: "Success",
          description: "Patient deleted successfully",
        });
        return { success: true };
      } else {
        setError(result.error || 'Failed to delete patient');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
    setPatients,
    setLoading,
    setError
  };
};

// Helper function to calculate age
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};
