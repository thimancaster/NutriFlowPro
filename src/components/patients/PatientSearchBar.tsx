
import React, { useState, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PatientSearchBarProps {
  value: string;
  onSearchChange: (value: string) => void;
}

const PatientSearchBar: React.FC<PatientSearchBarProps> = ({ value, onSearchChange }) => {
  const [searchInput, setSearchInput] = useState(value);
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  
  const handleSearch = () => {
    onSearchChange(searchInput);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <div className="flex items-center w-full max-w-md">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar pacientes..."
          className="pl-9 pr-3"
          value={searchInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      <Button 
        onClick={handleSearch}
        className="ml-2"
      >
        Buscar
      </Button>
    </div>
  );
};

export default PatientSearchBar;
