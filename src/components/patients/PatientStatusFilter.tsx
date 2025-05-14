
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PatientStatusFilterProps {
  status: string;
  onStatusChange: (value: 'active' | 'archived' | 'all') => void;
}

const PatientStatusFilter = ({ status, onStatusChange }: PatientStatusFilterProps) => {
  return (
    <div className="w-[180px]">
      <Select value={status} onValueChange={(value) => onStatusChange(value as 'active' | 'archived' | 'all')}>
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="archived">Arquivados</SelectItem>
          <SelectItem value="all">Todos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PatientStatusFilter;
