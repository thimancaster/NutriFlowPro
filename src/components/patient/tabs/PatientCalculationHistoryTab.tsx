
import React from 'react';
import PatientCalculationHistory from '../PatientCalculationHistory';

interface PatientCalculationHistoryTabProps {
  patientId: string;
}

const PatientCalculationHistoryTab: React.FC<PatientCalculationHistoryTabProps> = ({ patientId }) => {
  return <PatientCalculationHistory patientId={patientId} />;
};

export default PatientCalculationHistoryTab;
