
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PatientPageHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-nutri-blue mb-2">Pacientes</h1>
        <p className="text-gray-600">Gerencie seus pacientes e acesse consultas anteriores</p>
      </div>
      <Button 
        className="bg-nutri-green hover:bg-nutri-green-dark mt-4 md:mt-0"
        onClick={() => navigate('/patients/new')}
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Novo Paciente
      </Button>
    </div>
  );
};

export default PatientPageHeader;
