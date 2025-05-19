
import React from 'react';
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
  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value });
  };

  const handleStatusFilterChange = (value: 'active' | 'archived' | 'all') => {
    onStatusChange(value);
  };

  const handleSearchClick = () => {
    onSearch();
  };

  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchField 
            value={filters.search || ''} 
            onChange={handleSearchChange}
            onSearch={handleSearchClick}
          />
        </div>
        
        <div className="w-full md:w-48">
          <StatusFilter 
            value={filters.status} 
            onChange={handleStatusFilterChange} 
          />
        </div>
        
        <div>
          <Button 
            variant="default" 
            onClick={handleSearchClick}
            className="w-full md:w-auto"
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatientFiltersComponent;
