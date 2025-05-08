
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format, addMinutes, parseISO } from 'date-fns';
import { usePatientOptions } from '@/hooks/usePatientOptions';
import { useAppointmentTypes } from '@/hooks/useAppointmentTypes';
import { Appointment } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const { patients, isLoading: isLoadingPatients } = usePatientOptions();
  const { appointmentTypes, isLoading: isLoadingAppointmentTypes } = useAppointmentTypes();
  
  const [formData, setFormData] = useState<Partial<Appointment>>({
    patient_id: '',
    title: '',
    start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    end_time: format(addMinutes(new Date(), 60), "yyyy-MM-dd'T'HH:mm"),
    duration_minutes: 60,
    appointment_type_id: '',
    notes: '',
    status: 'scheduled'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (appointment) {
      setFormData({
        ...appointment,
        start_time: appointment.start_time ? 
          format(parseISO(appointment.start_time), "yyyy-MM-dd'T'HH:mm") : 
          format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        end_time: appointment.end_time ? 
          format(parseISO(appointment.end_time), "yyyy-MM-dd'T'HH:mm") : 
          format(addMinutes(new Date(), 60), "yyyy-MM-dd'T'HH:mm"),
      });
    }
  }, [appointment]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      // If changing start_time, update end_time based on duration
      if (name === 'start_time') {
        const startDate = new Date(value);
        const endDate = addMinutes(startDate, prev.duration_minutes || 60);
        return { 
          ...prev, 
          [name]: value,
          end_time: format(endDate, "yyyy-MM-dd'T'HH:mm")
        };
      }
      
      // If changing appointment_type_id, update duration based on appointment type
      if (name === 'appointment_type_id') {
        const appointmentType = appointmentTypes.find(type => type.id === value);
        if (appointmentType) {
          const startDate = prev.start_time ? new Date(prev.start_time) : new Date();
          const endDate = addMinutes(startDate, appointmentType.duration_minutes);
          return { 
            ...prev, 
            [name]: value,
            duration_minutes: appointmentType.duration_minutes,
            end_time: format(endDate, "yyyy-MM-dd'T'HH:mm")
          };
        }
      }
      
      // For other fields, just update the value
      return { ...prev, [name]: value };
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    handleChange({ target: { name, value } } as React.ChangeEvent<HTMLSelectElement>);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient_id" className="text-right">
                Paciente
              </Label>
              <div className="col-span-3">
                <Select 
                  name="patient_id"
                  value={formData.patient_id || ''} 
                  onValueChange={(value) => handleSelectChange('patient_id', value)}
                  disabled={isLoadingPatients}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appointment_type_id" className="text-right">
                Tipo de Consulta
              </Label>
              <div className="col-span-3">
                <Select 
                  name="appointment_type_id"
                  value={formData.appointment_type_id || ''} 
                  onValueChange={(value) => handleSelectChange('appointment_type_id', value)}
                  disabled={isLoadingAppointmentTypes}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de consulta" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} ({type.duration_minutes} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_time" className="text-right">
                Data e Hora
              </Label>
              <Input
                id="start_time"
                name="start_time"
                type="datetime-local"
                value={formData.start_time || ''}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_time" className="text-right">
                Término
              </Label>
              <Input
                id="end_time"
                name="end_time"
                type="datetime-local"
                value={formData.end_time || ''}
                onChange={handleChange}
                className="col-span-3"
                required
                disabled // Auto-calculated based on start time and duration
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Observações
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                className="col-span-3"
                rows={3}
              />
            </div>

            {isEditing && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <div className="col-span-3">
                  <Select 
                    name="status"
                    value={formData.status || 'scheduled'} 
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="canceled">Cancelado</SelectItem>
                      <SelectItem value="rescheduled">Reagendado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          
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
