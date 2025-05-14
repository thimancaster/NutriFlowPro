
import React from 'react';
import { Button } from '@/components/ui/button';

export interface PatientStatusFilterProps {
  currentStatus: 'active' | 'archived' | 'all';
  onStatusChange: (status: 'active' | 'archived' | 'all') => void;
}

const PatientStatusFilter: React.FC<PatientStatusFilterProps> = ({ 
  currentStatus, 
  onStatusChange 
}) => {
  return (
    <div className="flex space-x-2">
      <Button
        variant={currentStatus === 'active' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStatusChange('active')}
      >
        Ativos
      </Button>
      <Button
        variant={currentStatus === 'archived' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStatusChange('archived')}
      >
        Arquivados
      </Button>
      <Button
        variant={currentStatus === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStatusChange('all')}
      >
        Todos
      </Button>
    </div>
  );
};

export default PatientStatusFilter;
