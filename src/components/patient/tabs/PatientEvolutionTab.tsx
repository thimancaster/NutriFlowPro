
import React from 'react';
import PatientEvolution from '../PatientEvolution';

interface PatientEvolutionTabProps {
  patientId: string;
}

const PatientEvolutionTab: React.FC<PatientEvolutionTabProps> = ({ patientId }) => {
  return <PatientEvolution patientId={patientId} />;
};

export default PatientEvolutionTab;
