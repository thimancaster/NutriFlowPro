
import React from 'react';
import PatientEvaluations from '../PatientEvaluations';

interface PatientEvaluationsTabProps {
  patientId: string;
}

const PatientEvaluationsTab: React.FC<PatientEvaluationsTabProps> = ({ patientId }) => {
  return <PatientEvaluations patientId={patientId} />;
};

export default PatientEvaluationsTab;
