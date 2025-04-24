
import React from 'react';

interface PatientHeaderProps {
  patientName: string;
}

const PatientHeader: React.FC<PatientHeaderProps> = ({ patientName }) => {
  return (
    <div className="mb-6">
      {patientName && (
        <p className="text-lg font-medium">
          Paciente: <span className="text-nutri-blue">{patientName}</span>
        </p>
      )}
    </div>
  );
};

export default PatientHeader;
