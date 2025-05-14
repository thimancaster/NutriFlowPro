
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';
import { calculateAge, getObjectiveFromGoals } from '@/utils/patientUtils';

interface UsePatientDataProps {
  patientData: any;
  setActivePatient: (patient: Patient) => void;
  setFormData: (cb: (prev: any) => any) => void;
}

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

const usePatientData = ({ patientData, setActivePatient, setFormData }: UsePatientDataProps) => {
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPatient = async () => {
      if (patientData) {
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
  }, [location, patientData, toast, setActivePatient, setFormData]);
};

export default usePatientData;
