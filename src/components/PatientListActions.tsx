
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Archive, RotateCcw } from 'lucide-react';
import { Patient } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { updatePatientStatus } from '@/services/patient/operations/updatePatientStatus';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';

interface PatientListActionsProps {
  patient: Patient;
  onViewDetail: (patient: Patient) => void;
  onStatusChange: () => void;
}

const PatientListActions = ({ patient, onViewDetail, onStatusChange }: PatientListActionsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleEditClick = () => {
    navigate(`/patients/edit/${patient.id}`);
  };

  const handleArchiveClick = async () => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newStatus = patient.status === 'active' ? 'archived' : 'active';
      const result = await updatePatientStatus(
        patient.id, 
        user.id,
        newStatus as 'active' | 'archived'
      );

      if (result.success) {
        toast({
          title: newStatus === 'active' ? "Paciente reativado" : "Paciente arquivado",
          description: `${patient.name} foi ${newStatus === 'active' ? 'reativado(a)' : 'arquivado(a)'} com sucesso.`,
        });
        onStatusChange();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Não foi possível alterar o status do paciente. ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="icon" onClick={() => onViewDetail(patient)}>
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={handleEditClick}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={handleArchiveClick}>
        {patient.status === 'active' ? (
          <Archive className="h-4 w-4" />
        ) : (
          <RotateCcw className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default PatientListActions;
