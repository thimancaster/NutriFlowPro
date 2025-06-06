
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
import { Calendar, X } from 'lucide-react';

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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                {isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-base mt-1">
                {isEditing 
                  ? 'Edite os detalhes do agendamento abaixo.' 
                  : 'Preencha os detalhes para agendar uma nova consulta.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AppointmentFormFields 
            formData={formData}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
            isEditing={isEditing}
          />
          
          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="h-11 text-base font-medium"
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="h-11 text-base font-medium bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Salvando...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  {isEditing ? 'Atualizar Agendamento' : 'Criar Agendamento'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentFormDialog;
