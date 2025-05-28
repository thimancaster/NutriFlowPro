
import React from 'react';
import PatientCalculationComparison from '../PatientCalculationComparison';

interface PatientComparisonTabProps {
  patientId: string;
}

const PatientComparisonTab: React.FC<PatientComparisonTabProps> = ({ patientId }) => {
  return <PatientCalculationComparison patientId={patientId} />;
};

export default PatientComparisonTab;
