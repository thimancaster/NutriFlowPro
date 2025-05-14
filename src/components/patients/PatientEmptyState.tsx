
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface PatientEmptyStateProps {
  hasSearchFilter?: boolean;
}

const PatientEmptyState: React.FC<PatientEmptyStateProps> = ({ hasSearchFilter = false }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center">
        <div className="bg-gray-100 rounded-full p-4 mb-4 inline-flex">
          <PlusCircle className="h-10 w-10 text-gray-400" />
        </div>
        
        <h3 className="text-xl font-medium mb-2">
          {hasSearchFilter 
            ? 'Nenhum paciente encontrado'
            : 'Nenhum paciente cadastrado'}
        </h3>
        
        <p className="text-gray-500 mb-6 max-w-md">
          {hasSearchFilter
            ? 'Tente ajustar seus filtros de busca ou cadastre um novo paciente.'
            : 'Comece adicionando seu primeiro paciente para iniciar o acompanhamento nutricional.'}
        </p>
        
        <Button
          onClick={() => navigate('/patients/new')}
          className="flex items-center bg-nutri-green hover:bg-nutri-green-dark"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Paciente
        </Button>
      </div>
    </div>
  );
};

export default PatientEmptyState;
