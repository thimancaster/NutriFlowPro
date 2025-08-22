
import React from 'react';
import { Patient } from '@/types/patient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PatientViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
}

const PatientViewDialog: React.FC<PatientViewDialogProps> = ({ 
  isOpen, 
  onClose, 
  patient 
}) => {
  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes do Paciente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <strong>Nome:</strong> {patient.name}
          </div>
          <div>
            <strong>Email:</strong> {patient.email}
          </div>
          <div>
            <strong>Telefone:</strong> {patient.phone || 'Não informado'}
          </div>
          <div>
            <strong>Gênero:</strong> {patient.gender === 'male' ? 'Masculino' : 'Feminino'}
          </div>
          <div>
            <strong>Status:</strong> {patient.status === 'active' ? 'Ativo' : 'Arquivado'}
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientViewDialog;
