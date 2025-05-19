
import React from 'react';
import { Patient } from '@/types/patient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/dateUtils';
import { calculateAge } from '@/utils/patientUtils';

interface PatientCardProps {
  patient: Patient;
  variant?: 'default' | 'compact' | 'preview';
  onClick?: () => void;
  showActions?: boolean;
  className?: string;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  variant = 'default',
  onClick,
  showActions = true,
  className = ''
}) => {
  // Status indicator logic
  const getStatusIndicator = () => {
    if (patient.status === 'archived') {
      return <Badge variant="outline">Arquivado</Badge>;
    }
    
    return <Badge variant="success">Ativo</Badge>;
  };
  
  // Calcular IMC se houver dados suficientes
  const calculateBMI = () => {
    if (
      patient.weight && 
      patient.height && 
      patient.height > 0
    ) {
      const heightInMeters = patient.height / 100;
      const bmi = patient.weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };
  
  // Compact variant for list items
  if (variant === 'compact') {
    return (
      <div 
        className={`p-3 border-b hover:bg-gray-50 cursor-pointer flex items-center justify-between ${className}`}
        onClick={onClick}
      >
        <div>
          <h3 className="font-medium">{patient.name}</h3>
          <p className="text-sm text-gray-500">
            {patient.email || patient.phone || 'Sem contato'}
          </p>
        </div>
        {getStatusIndicator()}
      </div>
    );
  }
  
  // Preview variant for quick view
  if (variant === 'preview') {
    return (
      <Card className={`w-72 shadow-lg ${className}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-medium">{patient.name}</h3>
            {getStatusIndicator()}
          </div>
          
          {patient.weight && patient.height && (
            <div className="mb-2">
              <p className="text-sm">
                <span className="text-gray-500">Peso:</span> {patient.weight} kg
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Altura:</span> {patient.height} cm
              </p>
              {calculateBMI() && (
                <p className="text-sm">
                  <span className="text-gray-500">IMC:</span> {calculateBMI()}
                </p>
              )}
            </div>
          )}
          
          {patient.goals && (
            <div className="mb-2">
              <p className="text-sm">
                <span className="text-gray-500">Objetivo:</span> {patient.goals.objective || 'Não definido'}
              </p>
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            Última consulta: {patient.last_appointment ? formatDate(patient.last_appointment) : 'Nenhuma'}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Default full variant
  return (
    <Card className={`${onClick ? 'cursor-pointer' : ''} ${className}`} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">{patient.name}</h2>
            <p className="text-gray-500">{patient.email || 'Sem email'}</p>
            <p className="text-gray-500">{patient.phone || 'Sem telefone'}</p>
            {patient.birth_date && (
              <p className="text-gray-500">{calculateAge(patient.birth_date)} anos</p>
            )}
          </div>
          {getStatusIndicator()}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {(patient.weight || patient.height) && (
            <div>
              <h3 className="text-sm font-medium mb-1">Medidas</h3>
              {patient.weight && <p className="text-sm">Peso: {patient.weight} kg</p>}
              {patient.height && <p className="text-sm">Altura: {patient.height} cm</p>}
              {calculateBMI() && (
                <p className="text-sm">IMC: {calculateBMI()}</p>
              )}
            </div>
          )}
          
          {patient.goals && (
            <div>
              <h3 className="text-sm font-medium mb-1">Objetivos</h3>
              <p className="text-sm">{patient.goals.objective || 'Não definido'}</p>
              <p className="text-sm">{patient.goals.profile || ''}</p>
            </div>
          )}
        </div>
        
        {showActions && (
          <div className="mt-4 flex justify-end">
            {/* Action buttons will be added here */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientCard;
