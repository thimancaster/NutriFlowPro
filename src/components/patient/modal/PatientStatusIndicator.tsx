
import React from 'react';
import { Patient } from '@/types';

interface PatientStatusIndicatorProps {
  status: Patient['status'];
}

const PatientStatusIndicator = ({ status }: PatientStatusIndicatorProps) => {
  return (
    <div className="flex items-center space-x-2">
      <span className={`inline-block h-3 w-3 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
      <span className="text-sm text-gray-500">{status === 'active' ? 'Ativo' : 'Arquivado'}</span>
    </div>
  );
};

export default PatientStatusIndicator;
