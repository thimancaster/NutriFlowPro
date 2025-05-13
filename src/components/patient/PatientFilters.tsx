
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PatientFilters as PatientFilterType } from '@/types';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

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
  
  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status as 'active' | 'archived' | 'all'
    });
  };
  
  const handleSortChange = (sortValue: string) => {
    const [sortBy, sortOrder] = sortValue.split(':');
    onFiltersChange({
      ...filters,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc'
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
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar por nome, CPF ou e-mail" 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchClick();
              }}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Select value={filters.status || 'active'} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="archived">Arquivados</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select 
                value={`${filters.sortBy || 'name'}:${filters.sortOrder || 'asc'}`} 
                onValueChange={handleSortChange}
              >
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
            </div>
            
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PP') : <span>Data inicial</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => handleDateChange('start', date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PP') : <span>Data final</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => handleDateChange('end', date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleReset}>Resetar</Button>
            <Button onClick={handleSearchClick}>Buscar</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientFilters;
