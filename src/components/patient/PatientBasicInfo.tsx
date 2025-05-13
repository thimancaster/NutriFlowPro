
import React from 'react';
import { calculateAge } from '@/utils/patientUtils';

interface PatientBasicInfoProps {
  patient: any;
}

const PatientBasicInfo = ({ patient }: PatientBasicInfoProps) => {
  const age = calculateAge(patient?.birth_date);
  
  // Format the address as a string
  const formatAddress = (address: any) => {
    if (!address) return 'Não informado';
    
    // If address is a string, try to parse it
    if (typeof address === 'string') {
      try {
        const parsedAddress = JSON.parse(address);
        return formatAddressObject(parsedAddress);
      } catch (e) {
        return address || 'Não informado';
      }
    }
    
    // If address is already an object
    return formatAddressObject(address);
  };
  
  const formatAddressObject = (addressObj: any) => {
    if (!addressObj) return 'Não informado';
    
    const parts = [];
    
    if (addressObj.street) {
      parts.push(`${addressObj.street}${addressObj.number ? `, ${addressObj.number}` : ''}`);
    }
    
    if (addressObj.complement) {
      parts.push(addressObj.complement);
    }
    
    if (addressObj.neighborhood) {
      parts.push(addressObj.neighborhood);
    }
    
    if (addressObj.city && addressObj.state) {
      parts.push(`${addressObj.city} - ${addressObj.state}`);
    } else if (addressObj.city) {
      parts.push(addressObj.city);
    } else if (addressObj.state) {
      parts.push(addressObj.state);
    }
    
    if (addressObj.cep) {
      parts.push(`CEP: ${addressObj.cep}`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'Não informado';
  };
  
  // Format the phone
  const formatPhone = (phone: string | null) => {
    if (!phone) return 'Não informado';
    return phone;
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Informações Pessoais</h3>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm text-gray-500">Nome</h4>
            <p>{patient?.name || 'Não informado'}</p>
          </div>
          <div>
            <h4 className="text-sm text-gray-500">Gênero</h4>
            <p>{patient?.gender === 'M' ? 'Masculino' : patient?.gender === 'F' ? 'Feminino' : patient?.gender === 'O' ? 'Outro' : 'Não informado'}</p>
          </div>
          <div>
            <h4 className="text-sm text-gray-500">Data de Nascimento / Idade</h4>
            <p>
              {patient?.birth_date 
                ? `${new Date(patient.birth_date).toLocaleDateString('pt-BR')} (${age} anos)`
                : 'Não informado'}
            </p>
          </div>
          <div>
            <h4 className="text-sm text-gray-500">CPF</h4>
            <p>{patient?.cpf || 'Não informado'}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-3">Contato e Endereço</h3>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm text-gray-500">Telefone Principal</h4>
            <p>{formatPhone(patient?.phone)}</p>
          </div>
          <div>
            <h4 className="text-sm text-gray-500">Telefone Secundário</h4>
            <p>{formatPhone(patient?.secondaryPhone)}</p>
          </div>
          <div>
            <h4 className="text-sm text-gray-500">Email</h4>
            <p>{patient?.email || 'Não informado'}</p>
          </div>
          <div>
            <h4 className="text-sm text-gray-500">Endereço</h4>
            <p className="break-words">{formatAddress(patient?.address)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientBasicInfo;
