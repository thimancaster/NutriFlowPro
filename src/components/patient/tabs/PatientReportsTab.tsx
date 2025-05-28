
import React from 'react';
import PatientReports from '../PatientReports';
import { Patient } from '@/types';

interface PatientReportsTabProps {
  patient: Patient;
}

const PatientReportsTab: React.FC<PatientReportsTabProps> = ({ patient }) => {
  return <PatientReports patient={patient} />;
};

export default PatientReportsTab;
