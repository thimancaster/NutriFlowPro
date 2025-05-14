import React from 'react';
import { Patient } from '@/types';

interface PatientBasicInfoProps {
  patient: Patient;
  onUpdatePatient?: (data: Partial<Patient>) => Promise<void>;
}

const PatientBasicInfo: React.FC<PatientBasicInfoProps> = ({ patient, onUpdatePatient }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Nome</p>
          <p className="text-gray-900">{patient.name}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500">Email</p>
          <p className="text-gray-900">{patient.email || 'Não informado'}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500">Telefone</p>
          <p className="text-gray-900">{patient.phone || 'Não informado'}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500">Data de Nascimento</p>
          <p className="text-gray-900">{patient.birth_date || 'Não informado'}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500">Gênero</p>
          <p className="text-gray-900">{patient.gender || 'Não informado'}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500">Endereço</p>
          <p className="text-gray-900">{patient.address || 'Não informado'}</p>
        </div>
      </div>

      {/* Could add Edit buttons and forms here when onUpdatePatient is provided */}
    </div>
  );
};

export default PatientBasicInfo;
