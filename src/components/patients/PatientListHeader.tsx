
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PatientFilters } from '@/types';

interface PatientListHeaderProps {
  totalItems: number;
  filters: PatientFilters;
  onFilterChange: (newFilters: Partial<PatientFilters>) => void;
}

const PatientListHeader = ({ totalItems, filters, onFilterChange }: PatientListHeaderProps) => {
  const navigate = useNavigate();
  
  const handleAddPatient = () => {
    navigate('/patients/new');
  };
  
  return (
    <div className="flex flex-wrap items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-nutri-blue mb-1">Pacientes</h1>
        <p className="text-gray-500">Gerencie seus pacientes ({totalItems} total)</p>
      </div>
      <Button onClick={handleAddPatient}>
        <UserPlus className="h-4 w-4 mr-2" /> Novo Paciente
      </Button>
    </div>
  );
};

export default PatientListHeader;
