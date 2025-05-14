
import React from 'react';
import { CardTitle } from '@/components/ui/card';

interface PatientTableHeaderProps {
  totalItems: number;
}

const PatientTableHeader = ({ totalItems }: PatientTableHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <CardTitle>Lista de Pacientes</CardTitle>
      <div className="text-sm text-gray-500">
        Total: {totalItems} pacientes
      </div>
    </div>
  );
};

export default PatientTableHeader;
