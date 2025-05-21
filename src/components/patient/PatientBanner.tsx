
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Calculator, Utensils, X } from 'lucide-react';
import { usePatient } from '@/contexts/PatientContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const PatientBanner: React.FC = () => {
  const { activePatient, endPatientSession } = usePatient();

  if (!activePatient) return null;

  // Get first initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Calculate age if birth_date is available
  const getAge = () => {
    if (!activePatient.birth_date) return '';
    
    const birthDate = new Date(activePatient.birth_date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return `${age} anos`;
  };

  // Format measurements for display
  const getFormattedMeasurements = () => {
    const measurements = activePatient.measurements || {};
    const weight = measurements.weight ? `${measurements.weight}kg` : '';
    const height = measurements.height ? `${measurements.height}cm` : '';
    
    return [weight, height].filter(Boolean).join(' • ');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-nutri-green text-white">
            {getInitials(activePatient.name)}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-lg">{activePatient.name}</h3>
            <Badge variant="outline" className="text-xs">
              {activePatient.status === 'active' ? 'Ativo' : 'Arquivado'}
            </Badge>
          </div>
          
          <p className="text-gray-600 text-sm">
            {getAge()}
            {activePatient.gender && ` • ${activePatient.gender === 'male' ? 'Masculino' : 'Feminino'}`}
            {getFormattedMeasurements() && ` • ${getFormattedMeasurements()}`}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Link to={`/patients/${activePatient.id}`}>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </Button>
        </Link>
        
        <Link to={`/calculator?patientId=${activePatient.id}`}>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Calculadora</span>
          </Button>
        </Link>
        
        <Link to={`/meal-plans?patientId=${activePatient.id}`}>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Utensils className="h-4 w-4" />
            <span className="hidden sm:inline">Plano Alimentar</span>
          </Button>
        </Link>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={endPatientSession} 
          title="Encerrar sessão do paciente"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PatientBanner;
