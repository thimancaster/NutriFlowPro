
import React from 'react';
import { Patient } from '@/types';
import { Archive, RotateCcw, Trash, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PatientStatusIndicator from './PatientStatusIndicator';

interface PatientModalHeaderProps {
  patient: Patient;
  onArchive?: () => void;
  onDelete?: () => void;
}

const PatientModalHeader: React.FC<PatientModalHeaderProps> = ({ 
  patient, 
  onArchive, 
  onDelete 
}) => {
  const isArchived = patient.status === 'archived';

  return (
    <div className="flex justify-between items-center">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{patient.name}</h2>
          <PatientStatusIndicator status={patient.status || 'active'} />
        </div>
        <p className="text-sm text-muted-foreground">
          {patient.email || patient.phone || 'Sem contato disponível'}
        </p>
      </div>

      <div className="flex gap-2">
        {onArchive && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onArchive}
            className={isArchived ? "text-green-600" : "text-amber-600"}
          >
            {isArchived ? (
              <>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reativar
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 mr-1" />
                Arquivar
              </>
            )}
          </Button>
        )}
        
        {onDelete && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDelete}
            className="text-red-600"
          >
            <Trash className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        )}
      </div>
    </div>
  );
};

export default PatientModalHeader;
