
import React from 'react';
import { PatientFilters } from '@/hooks/usePatient';

export interface PatientEmptyStateProps {
  filters?: PatientFilters;
}

export const PatientEmptyState: React.FC<PatientEmptyStateProps> = ({ filters }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-gray-50 rounded-full p-6 mb-5">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M12 17h.01M12 20h.01M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum paciente encontrado</h3>
      <p className="text-gray-500 max-w-md mb-6">
        {filters && filters.searchTerm 
          ? "Não encontramos pacientes com esse termo de pesquisa. Tente usar palavras-chave diferentes."
          : filters && filters.status !== 'all'
          ? `Não há pacientes com o status "${filters.status}" no momento.`
          : "Você ainda não tem pacientes cadastrados. Comece adicionando um novo paciente agora mesmo!"}
      </p>
    </div>
  );
};

export default PatientEmptyState;
