
import React from 'react';
import { Patient } from '@/types';

interface PatientBasicInfoProps {
  patient: Patient;
  formatDate: (date: string | null) => string;
  calculateAge: (birthDate: string | null) => number | null;
}

const PatientBasicInfo = ({ patient, formatDate, calculateAge }: PatientBasicInfoProps) => {
  const age = calculateAge(patient.birth_date);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Nome</h3>
          <p className="mt-1 text-base">{patient.name}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Data de Nascimento</h3>
          <p className="mt-1 text-base">{formatDate(patient.birth_date)}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Idade</h3>
          <p className="mt-1 text-base">{age !== null ? `${age} anos` : '-'}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Gênero</h3>
          <p className="mt-1 text-base">
            {patient.gender === 'F' ? 'Feminino' : 
             patient.gender === 'M' ? 'Masculino' : '-'}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">E-mail</h3>
          <p className="mt-1 text-base">{patient.email || '-'}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Telefone</h3>
          <p className="mt-1 text-base">{patient.phone || '-'}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Endereço</h3>
          <p className="mt-1 text-base">{patient.address || '-'}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Objetivo</h3>
          <p className="mt-1 text-base">
            {patient.goals?.objective 
              ? patient.goals.objective.charAt(0).toUpperCase() + patient.goals.objective.slice(1) 
              : '-'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientBasicInfo;
