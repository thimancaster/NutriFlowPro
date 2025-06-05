
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PatientFilters } from '@/types';
import { Search } from 'lucide-react';
import SearchField from './filters/SearchField';
import StatusFilter from './filters/StatusFilter';

interface PatientFiltersComponentProps {
  filters: PatientFilters;
  onFiltersChange: (filters: Partial<PatientFilters>) => void;
  onStatusChange: (status: 'active' | 'archived' | 'all') => void;
  onSearch: () => void;
}

const PatientFiltersComponent: React.FC<PatientFiltersComponentProps> = ({
  filters,
  onFiltersChange,
  onStatusChange,
  onSearch
}) => {
  const [localSearchValue, setLocalSearchValue] = useState(filters.search || '');

  const handleSearchChange = (value: string) => {
    setLocalSearchValue(value);
  };

  const handleSearchSubmit = () => {
    onFiltersChange({ search: localSearchValue, page: 1 });
    onSearch();
  };

  const handleStatusFilterChange = (value: 'active' | 'archived' | 'all') => {
    onStatusChange(value);
  };

  const handleClearFilters = () => {
    setLocalSearchValue('');
    onFiltersChange({ search: '', status: '', page: 1 });
  };

  return (
    <div className="mb-6 bg-white dark:bg-dark-bg-card p-4 rounded-lg shadow-sm border dark:border-dark-border-primary space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchField 
            value={localSearchValue} 
            onChange={handleSearchChange}
            onSearch={handleSearchSubmit}
          />
        </div>
        
        <div className="w-full md:w-48">
          <StatusFilter 
            value={filters.status || 'all'} 
            onChange={handleStatusFilterChange} 
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="default" 
            onClick={handleSearchSubmit}
            className="w-full md:w-auto"
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleClearFilters}
            className="w-full md:w-auto"
          >
            Limpar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatientFiltersComponent;
