
import React from 'react';
import PatientAlerts from '../PatientAlerts';
import { Patient } from '@/types';

interface PatientAlertsTabProps {
  patient: Patient;
}

const PatientAlertsTab: React.FC<PatientAlertsTabProps> = ({ patient }) => {
  return <PatientAlerts patient={patient} />;
};

export default PatientAlertsTab;
