
import React from 'react';
import { Patient } from '@/types';
import PatientBasicInfo from '../PatientBasicInfo';

interface PatientBasicInfoTabProps {
  patient: Patient;
  onUpdatePatient: (data: Partial<Patient>) => Promise<void>;
}

const PatientBasicInfoTab: React.FC<PatientBasicInfoTabProps> = ({ 
  patient, 
  onUpdatePatient 
}) => {
  return <PatientBasicInfo patient={patient} onUpdatePatient={onUpdatePatient} />;
};

export default PatientBasicInfoTab;
