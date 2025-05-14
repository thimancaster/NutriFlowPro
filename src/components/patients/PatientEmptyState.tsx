
import React from 'react';
import { User } from 'lucide-react';

interface PatientEmptyStateProps {
  hasSearchFilter: boolean;
}

const PatientEmptyState = ({ hasSearchFilter }: PatientEmptyStateProps) => {
  return (
    <div className="text-center py-10">
      <User className="h-12 w-12 mx-auto text-gray-400" />
      <h3 className="mt-2 text-lg font-medium">Nenhum paciente encontrado</h3>
      <p className="text-gray-500 mt-1">
        {hasSearchFilter 
          ? 'Tente uma busca diferente ou limpe os filtros' 
          : 'Clique em "Novo Paciente" para adicionar seu primeiro paciente'}
      </p>
    </div>
  );
};

export default PatientEmptyState;
