
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StatusFilterProps {
  value: string;
  onChange: (value: 'active' | 'archived' | 'all') => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  const handleValueChange = (newValue: string) => {
    onChange(newValue as 'active' | 'archived' | 'all');
  };

  const getDisplayValue = () => {
    switch (value) {
      case 'active':
        return 'Ativos';
      case 'archived':
        return 'Arquivados';
      case 'all':
      case '':
        return 'Todos';
      default:
        return 'Status';
    }
  };

  return (
    <Select value={value || 'all'} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Status">
          {getDisplayValue()}
        </SelectValue>
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
