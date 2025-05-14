
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

const SearchField: React.FC<SearchFieldProps> = ({ value, onChange, onSearch }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <Input 
        placeholder="Buscar por nome, CPF ou e-mail" 
        className="pl-10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSearch();
        }}
      />
    </div>
  );
};

export default SearchField;
