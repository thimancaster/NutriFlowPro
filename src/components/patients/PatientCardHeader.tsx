
import React, { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import PatientStatusFilter from './PatientStatusFilter';
import { PatientFilters } from '@/types';

interface PatientCardHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'active' | 'archived' | 'all';
  onStatusFilterChange: (status: 'active' | 'archived' | 'all') => void;
}

const PatientCardHeader: React.FC<PatientCardHeaderProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}) => {
  // Handle search input change
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div className="flex-1 w-full md:w-auto">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar pacientes..."
            className="pl-9"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <PatientStatusFilter
          value={statusFilter}
          onValueChange={onStatusFilterChange}
        />
        
        <Link to="/patients/new" className="w-full sm:w-auto">
          <Button className="bg-nutri-green hover:bg-nutri-green-dark w-full gap-1">
            <Plus className="h-4 w-4" />
            Novo Paciente
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PatientCardHeader;
