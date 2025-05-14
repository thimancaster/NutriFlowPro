
import React from 'react';
import PatientSearchBar from './PatientSearchBar';
import PatientStatusFilter from './PatientStatusFilter';
import PatientFilters from '@/components/patient/PatientFilters';
import { PatientFilters as PatientFiltersType } from '@/types';

interface PatientCardHeaderProps {
  filters: PatientFiltersType;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  onStatusChange: (value: 'active' | 'archived' | 'all') => void;
  onFiltersChange: (newFilters: PatientFiltersType) => void;
  onSearch: () => void;
}

const PatientCardHeader = ({ 
  filters, 
  onSearchChange, 
  onClearSearch, 
  onStatusChange, 
  onFiltersChange, 
  onSearch 
}: PatientCardHeaderProps) => {
  return (
    <div className="flex flex-wrap gap-4">
      <PatientSearchBar 
        searchValue={filters.search} 
        onSearchChange={onSearchChange} 
        onClearSearch={onClearSearch}
      />
      
      <PatientStatusFilter 
        status={filters.status} 
        onStatusChange={onStatusChange}
      />
      
      <PatientFilters 
        filters={filters} 
        onFiltersChange={onFiltersChange} 
        onSearch={onSearch}
      />
    </div>
  );
};

export default PatientCardHeader;
