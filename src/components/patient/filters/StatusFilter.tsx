
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StatusFilterProps {
  value: string;
  onChange: (value: 'active' | 'archived' | 'all') => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  return (
    <Select value={value || 'all'} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos</SelectItem>
        <SelectItem value="active">Ativos</SelectItem>
        <SelectItem value="archived">Arquivados</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default StatusFilter;
