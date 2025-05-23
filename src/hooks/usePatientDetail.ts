
// Re-export from the patient directory with added functionality
import { usePatientDetail as usePatientDetailBase } from './patient/usePatientDetail';
import { useNavigate } from 'react-router-dom';
import { Patient } from '@/types';

export const usePatientDetail = (patientId?: string) => {
  const navigate = useNavigate();
  const patientDetailHook = usePatientDetailBase(patientId);
  
  // Add the openPatientDetail function that other components expect
  const openPatientDetail = async (patientOrId: string | Patient) => {
    if (typeof patientOrId === 'string') {
      navigate(`/patients/${patientOrId}`);
    } else {
      navigate(`/patients/${patientOrId.id}`);
    }
    return Promise.resolve();
  };
  
  const closePatientDetail = () => {
    navigate('/patients');
  };
  
  const isModalOpen = !!patientId;
  
  return {
    ...patientDetailHook,
    openPatientDetail,
    closePatientDetail,
    isModalOpen
  };
};

export { usePatientDetailBase };
