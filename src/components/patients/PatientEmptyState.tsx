
import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PatientFilters } from '@/types';

export interface PatientEmptyStateProps {
  hasSearchFilter?: boolean;
  filters?: PatientFilters;
}

const PatientEmptyState: React.FC<PatientEmptyStateProps> = ({ hasSearchFilter = false, filters }) => {
  const hasActiveFilters = hasSearchFilter || 
                          (filters && (filters.search || 
                                     filters.status !== 'active' || 
                                     filters.startDate || 
                                     filters.endDate));
                                    
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="rounded-full bg-gray-100 p-3 mb-4">
        <Users className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium mb-2">
        {hasActiveFilters 
          ? 'Nenhum paciente encontrado' 
          : 'Nenhum paciente cadastrado'}
      </h3>
      <p className="text-sm text-gray-500 text-center mb-4">
        {hasActiveFilters 
          ? 'Tente ajustar seus filtros para encontrar o que procura.'
          : 'Comece adicionando seu primeiro paciente.'}
      </p>
      {!hasActiveFilters && (
        <Button asChild>
          <Link to="/patients/new">
            Adicionar paciente
          </Link>
        </Button>
      )}
    </div>
  );
};

export default PatientEmptyState;
