
import React from 'react';
import PatientGoals from '../PatientGoals';
import { Patient } from '@/types';

interface PatientGoalsTabProps {
  patient: Patient;
  onUpdatePatient: (data: Partial<Patient>) => Promise<void>;
}

const PatientGoalsTab: React.FC<PatientGoalsTabProps> = ({ patient, onUpdatePatient }) => {
  return <PatientGoals patient={patient} onUpdatePatient={onUpdatePatient} />;
};

export default PatientGoalsTab;
