
import React from 'react';
import { Patient, AddressDetails } from '@/types';
import { format } from 'date-fns';

interface PatientBasicInfoProps {
  patient: Patient;
  onUpdatePatient?: (data: Partial<Patient>) => Promise<void>;
}

const PatientBasicInfo: React.FC<PatientBasicInfoProps> = ({ patient, onUpdatePatient }) => {
  // Format birth date if it exists
  const formattedBirthDate = patient.birth_date 
    ? typeof patient.birth_date === 'string'
      ? patient.birth_date
      : format(patient.birth_date, 'dd/MM/yyyy')
    : 'Não informado';

  // Format address for display
  const formatAddress = (address: string | AddressDetails | undefined): string => {
    if (!address) return 'Não informado';
    
    if (typeof address === 'string') {
      return address;
    }
    
    // If address is an object, format it
    const parts = [
      address.street,
      address.number && `n° ${address.number}`,
      address.complement,
      address.neighborhood && `${address.neighborhood},`,
      address.city && `${address.city},`,
      address.state
    ].filter(Boolean);
    
    return parts.join(' ') || 'Não informado';
  };

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
          <p className="text-gray-900">{formattedBirthDate}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500">Gênero</p>
          <p className="text-gray-900">{patient.gender || 'Não informado'}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500">Endereço</p>
          <p className="text-gray-900">{formatAddress(patient.address)}</p>
        </div>
      </div>

      {/* Could add Edit buttons and forms here when onUpdatePatient is provided */}
    </div>
  );
};

export default PatientBasicInfo;
