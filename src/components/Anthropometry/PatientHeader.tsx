
import React from 'react';

interface PatientHeaderProps {
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientObjective?: string;
}

const PatientHeader: React.FC<PatientHeaderProps> = ({ 
  patientName, 
  patientAge, 
  patientGender, 
  patientObjective 
}) => {
  return (
    <div className="mb-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        {patientName && (
          <p className="text-lg font-medium">
            Paciente: <span className="text-nutri-blue">{patientName}</span>
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {patientAge && (
            <span className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700">
              {patientAge} anos
            </span>
          )}
          {patientGender && (
            <span className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700">
              {patientGender === 'male' || patientGender === 'M' ? 'Masculino' : 'Feminino'}
            </span>
          )}
          {patientObjective && (
            <span className="bg-nutri-green bg-opacity-20 rounded-full px-3 py-1 text-sm text-nutri-green-dark font-medium">
              Objetivo: {patientObjective}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientHeader;
