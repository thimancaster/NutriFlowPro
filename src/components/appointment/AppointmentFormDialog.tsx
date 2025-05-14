
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/types';
import { useAppointmentForm } from '@/hooks/appointments/useAppointmentForm';
import AppointmentFormFields from './form/AppointmentFormFields';

// Add this global declaration to allow storage of appointment types in window
declare global {
  interface Window {
    appointmentTypes?: Array<{
      id: string;
      name: string;
      duration_minutes: number;
    }>;
  }
}

interface AppointmentFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Appointment>) => Promise<void>;
  appointment: Appointment | null;
}

const AppointmentFormDialog: React.FC<AppointmentFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  appointment
}) => {
  const isEditing = !!appointment;
  
  const {
    formData,
    isSubmitting,
    handleChange,
    handleSelectChange,
    handleSubmit
  } = useAppointmentForm({ 
    appointment, 
    onSubmit 
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edite os detalhes do agendamento abaixo.' 
              : 'Preencha os detalhes para agendar uma nova consulta.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <AppointmentFormFields 
            formData={formData}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
            isEditing={isEditing}
          />
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Agendar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentFormDialog;
