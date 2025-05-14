
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientFilters as PatientFilterType } from '@/types';
import { 
  SearchField, 
  StatusFilter, 
  SortFilter, 
  DateFilter, 
  FilterActions 
} from './filters';

interface PatientFiltersProps {
  filters: PatientFilterType;
  onFiltersChange: (filters: PatientFilterType) => void;
  onSearch: () => void;
}

const PatientFilters: React.FC<PatientFiltersProps> = ({ 
  filters, 
  onFiltersChange, 
  onSearch 
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  );
  
  const handleStatusChange = (status: 'active' | 'archived' | 'all') => {
    onFiltersChange({
      ...filters,
      status
    });
  };
  
  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    onFiltersChange({
      ...filters,
      sortBy,
      sortOrder
    });
  };
  
  const handleDateChange = (type: 'start' | 'end', date?: Date) => {
    if (type === 'start') {
      setStartDate(date);
      if (date) {
        onFiltersChange({
          ...filters,
          startDate: date.toISOString().split('T')[0]
        });
      } else {
        const { startDate, ...rest } = filters;
        onFiltersChange(rest);
      }
    } else {
      setEndDate(date);
      if (date) {
        onFiltersChange({
          ...filters,
          endDate: date.toISOString().split('T')[0]
        });
      } else {
        const { endDate, ...rest } = filters;
        onFiltersChange(rest);
      }
    }
  };
  
  const handleSearchClick = () => {
    onFiltersChange({
      ...filters,
      search: searchTerm,
      page: 1 // Reset to first page on new search
    });
    onSearch();
  };
  
  const handleReset = () => {
    setSearchTerm('');
    setStartDate(undefined);
    setEndDate(undefined);
    onFiltersChange({
      page: 1,
      pageSize: filters.pageSize,
      status: 'active',
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle>Filtrar Pacientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <SearchField 
            value={searchTerm} 
            onChange={setSearchTerm} 
            onSearch={handleSearchClick}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatusFilter 
              value={filters.status || 'active'} 
              onChange={handleStatusChange} 
            />
            
            <SortFilter 
              value={`${filters.sortBy || 'name'}:${filters.sortOrder || 'asc'}`} 
              onChange={handleSortChange} 
            />
            
            <DateFilter 
              label="Data inicial" 
              date={startDate} 
              onChange={(date) => handleDateChange('start', date)} 
            />
            
            <DateFilter 
              label="Data final" 
              date={endDate} 
              onChange={(date) => handleDateChange('end', date)} 
            />
          </div>
          
          <FilterActions 
            onReset={handleReset} 
            onSearch={handleSearchClick} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientFilters;
