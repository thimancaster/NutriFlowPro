
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
  // Use dateFrom/dateTo instead of startDate/endDate
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.dateFrom ? new Date(filters.dateFrom) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.dateTo ? new Date(filters.dateTo) : undefined
  );
  
  const handleStatusChange = (status: 'active' | 'archived' | 'all') => {
    onFiltersChange({
      ...filters,
      status
    });
  };
  
  const handleSortChange = (sortBy: string, sortDirection: 'asc' | 'desc') => {
    onFiltersChange({
      ...filters,
      sortBy,
      sortDirection
    });
  };
  
  const handleDateChange = (type: 'start' | 'end', date?: Date) => {
    if (type === 'start') {
      setStartDate(date);
      if (date) {
        onFiltersChange({
          ...filters,
          dateFrom: date.toISOString().split('T')[0]
        });
      } else {
        const { dateFrom, ...rest } = filters;
        onFiltersChange(rest);
      }
    } else {
      setEndDate(date);
      if (date) {
        onFiltersChange({
          ...filters,
          dateTo: date.toISOString().split('T')[0]
        });
      } else {
        const { dateTo, ...rest } = filters;
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
      sortDirection: 'asc'
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
              value={`${filters.sortBy || 'name'}:${filters.sortDirection || 'asc'}`} 
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
