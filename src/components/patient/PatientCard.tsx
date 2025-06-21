
import React from 'react';
import { Patient } from '@/types/patient';
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';
import { Badge } from '@/components/ui';
import { formatDate } from '@/utils/dateUtils';
import { calculateAge } from '@/utils/patient';

interface PatientCardProps {
  patient: Patient;
  variant?: 'default' | 'compact' | 'preview';
  onClick?: () => void;
  showActions?: boolean;
  className?: string;
}

const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  variant = 'default',
  onClick,
  showActions = true,
  className = ''
}) => {
  // Status indicator logic
  const getStatusIndicator = () => {
    if (patient.status === 'archived') {
      return <Badge variant="outline" className="magnetic-hover">Arquivado</Badge>;
    }
    
    return <Badge variant="success" className="magnetic-hover">Ativo</Badge>;
  };
  
  // Compact variant for list items
  if (variant === 'compact') {
    return (
      <div 
        className={`p-3 border-b hover:bg-gray-50 dark:hover:bg-dark-bg-elevated/60 cursor-pointer flex items-center justify-between transition-all duration-300 side-expand magnetic-hover hover:translate-x-1 ${className}`}
        onClick={onClick}
      >
        <div>
          <h3 className="font-medium text-glow-hover transition-all duration-300 hover:text-nutri-green dark:hover:text-dark-accent-green">{patient.name}</h3>
          <p className="text-sm text-gray-500 dark:text-dark-text-muted transition-colors duration-300">
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
      <ModernCard variant="magnetic" className={`w-72 shadow-lg ${className}`}>
        <ModernCardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-medium text-glow-hover">{patient.name}</h3>
            {getStatusIndicator()}
          </div>
          
          {patient.goals && (
            <div className="mb-2">
              <p className="text-sm transition-colors duration-300 hover:text-nutri-green dark:hover:text-dark-accent-green">
                <span className="text-gray-500 dark:text-dark-text-muted">Objetivo:</span> {patient.goals.objective || 'Não definido'}
              </p>
            </div>
          )}
          
          <div className="text-xs text-gray-500 dark:text-dark-text-muted transition-colors duration-300">
            Última consulta: {patient.last_appointment ? formatDate(patient.last_appointment) : 'Nenhuma'}
          </div>
        </ModernCardContent>
      </ModernCard>
    );
  }
  
  // Default full variant
  return (
    <ModernCard 
      variant="hover-lift" 
      interactive={!!onClick}
      className={className} 
      onClick={onClick}
    >
      <ModernCardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-glow-hover">{patient.name}</h2>
            <p className="text-gray-500 dark:text-dark-text-muted transition-colors duration-300 hover:text-nutri-green dark:hover:text-dark-accent-green">{patient.email || 'Sem email'}</p>
            <p className="text-gray-500 dark:text-dark-text-muted transition-colors duration-300 hover:text-nutri-green dark:hover:text-dark-accent-green">{patient.phone || 'Sem telefone'}</p>
            {patient.birth_date && (
              <p className="text-gray-500 dark:text-dark-text-muted transition-colors duration-300 hover:text-nutri-green dark:hover:text-dark-accent-green">{calculateAge(patient.birth_date)} anos</p>
            )}
          </div>
          {getStatusIndicator()}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {patient.goals && (
            <div className="space-y-1">
              <h3 className="text-sm font-medium mb-1 text-glow-hover">Objetivos</h3>
              <p className="text-sm transition-colors duration-300 hover:text-nutri-green dark:hover:text-dark-accent-green">{patient.goals.objective || 'Não definido'}</p>
              <p className="text-sm transition-colors duration-300 hover:text-nutri-green dark:hover:text-dark-accent-green">{patient.goals.profile || ''}</p>
            </div>
          )}
        </div>
        
        {showActions && (
          <div className="mt-4 flex justify-end">
            {/* Action buttons will be added here */}
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};

export default PatientCard;
