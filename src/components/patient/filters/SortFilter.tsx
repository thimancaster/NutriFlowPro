
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SortFilterProps {
  value: string;
  onChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

const SortFilter: React.FC<SortFilterProps> = ({ value, onChange }) => {
  const handleChange = (sortValue: string) => {
    const [sortBy, sortOrder] = sortValue.split(':');
    onChange(sortBy, sortOrder as 'asc' | 'desc');
  };
  
  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger>
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="name:asc">Nome (A-Z)</SelectItem>
        <SelectItem value="name:desc">Nome (Z-A)</SelectItem>
        <SelectItem value="created_at:desc">Data Cadastro (Recente)</SelectItem>
        <SelectItem value="created_at:asc">Data Cadastro (Antigo)</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SortFilter;
