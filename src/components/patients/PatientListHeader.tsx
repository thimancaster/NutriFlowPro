
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PatientListHeaderProps {
  title: string;
  subtitle: string;
}

const PatientListHeader = ({ title, subtitle }: PatientListHeaderProps) => {
  const navigate = useNavigate();
  
  const handleAddPatient = () => {
    navigate('/patients/new');
  };
  
  return (
    <div className="flex flex-wrap items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-nutri-blue mb-1">{title}</h1>
        <p className="text-gray-500">{subtitle}</p>
      </div>
      <Button onClick={handleAddPatient}>
        <UserPlus className="h-4 w-4 mr-2" /> Novo Paciente
      </Button>
    </div>
  );
};

export default PatientListHeader;
