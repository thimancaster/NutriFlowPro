
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PatientFilters } from '@/types';

interface PatientEmptyStateProps {
  filters?: PatientFilters;
  hasSearchFilter?: boolean;
}

const PatientEmptyState: React.FC<PatientEmptyStateProps> = ({ filters, hasSearchFilter }) => {
  // Determine if empty state is due to filters
  const isFiltered = hasSearchFilter || (filters && (filters.search || filters.status !== 'active'));
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-gray-100 rounded-full p-4 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      
      <h3 className="text-lg font-medium text-gray-900">
        {isFiltered ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
      </h3>
      
      <p className="mt-1 text-sm text-gray-500 text-center max-w-md">
        {isFiltered
          ? 'Não foram encontrados pacientes com os filtros selecionados. Tente ajustar seus critérios de busca.'
          : 'Você ainda não tem nenhum paciente cadastrado. Comece adicionando seu primeiro paciente.'}
      </p>
      
      <div className="mt-6">
        {isFiltered ? (
          <Button variant="outline" onClick={() => window.location.href = '/patients'}>
            Limpar filtros
          </Button>
        ) : (
          <Link to="/patients/new">
            <Button className="flex gap-1 items-center bg-nutri-green hover:bg-nutri-green-dark">
              <Plus className="h-4 w-4" />
              Novo Paciente
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default PatientEmptyState;
