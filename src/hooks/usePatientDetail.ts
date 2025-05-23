
// Re-export from the patient directory with added functionality
import { usePatientDetail as usePatientDetailBase } from './patient/usePatientDetail';
import { useNavigate } from 'react-router-dom';

export const usePatientDetail = (patientId?: string) => {
  const navigate = useNavigate();
  const patientDetailHook = usePatientDetailBase(patientId);
  
  // Add the openPatientDetail function that other components expect
  const openPatientDetail = (id: string) => {
    navigate(`/patients/${id}`);
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
