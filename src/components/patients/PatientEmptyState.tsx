
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PatientFilters } from '@/types';

interface PatientEmptyStateProps {
  filters: PatientFilters;
}

const PatientEmptyState = ({ filters }: PatientEmptyStateProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-8">
      <p className="text-gray-500">
        {filters.search 
          ? 'Nenhum paciente encontrado com os termos de busca.' 
          : filters.status === 'archived'
            ? 'Não há pacientes arquivados.'
            : filters.status === 'all'
              ? 'Você ainda não tem pacientes cadastrados.'
              : 'Você ainda não tem pacientes ativos cadastrados.'
        }
      </p>
      {!filters.search && (
        <Button 
          className="mt-4 bg-nutri-green hover:bg-nutri-green-dark"
          onClick={() => navigate('/patients/new')}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Paciente
        </Button>
      )}
    </div>
  );
};

export default PatientEmptyState;
