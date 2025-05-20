
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  onAddNew: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddNew }) => (
  <div className="text-center py-10">
    <Calendar className="mx-auto h-10 w-10 text-gray-400" />
    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma consulta encontrada</h3>
    <p className="mt-1 text-sm text-gray-500">
      Comece agendando uma nova consulta para seus pacientes.
    </p>
    <div className="mt-6">
      <Button onClick={onAddNew} className="bg-nutri-green hover:bg-nutri-green-dark">
        <PlusCircle className="mr-2 h-4 w-4" /> Nova Consulta
      </Button>
    </div>
  </div>
);

export default memo(EmptyState);
