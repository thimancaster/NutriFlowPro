
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePatient } from '@/contexts/PatientContext';
import { User, Calculator, Utensils, Eye, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const PatientBanner = () => {
  const { activePatient, endPatientSession } = usePatient();
  const navigate = useNavigate();

  if (!activePatient) return null;

  const handleViewProfile = () => {
    navigate(`/patients/${activePatient.id}`);
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  const age = calculateAge(activePatient.birth_date);

  return (
    <Card className="p-4 mb-6 bg-gradient-to-r from-nutri-blue/5 to-nutri-green/5 border-nutri-blue/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-nutri-blue/10 rounded-full">
            <User className="h-6 w-6 text-nutri-blue" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{activePatient.name}</h3>
              <Badge variant={activePatient.status === 'active' ? 'success' : 'secondary'}>
                {activePatient.status === 'active' ? 'Ativo' : 'Arquivado'}
              </Badge>
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-4">
              {age && <span>{age} anos</span>}
              {activePatient.email && <span>{activePatient.email}</span>}
              {activePatient.phone && <span>{activePatient.phone}</span>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleViewProfile}>
            <Eye className="h-4 w-4 mr-1" />
            Ver Perfil
          </Button>
          
          <Link to={`/calculator?patientId=${activePatient.id}`}>
            <Button variant="outline" size="sm">
              <Calculator className="h-4 w-4 mr-1" />
              Calculadora
            </Button>
          </Link>
          
          <Link to={`/meal-plans?patientId=${activePatient.id}`}>
            <Button variant="outline" size="sm">
              <Utensils className="h-4 w-4 mr-1" />
              Plano Alimentar
            </Button>
          </Link>
          
          <Button variant="ghost" size="sm" onClick={endPatientSession}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PatientBanner;
