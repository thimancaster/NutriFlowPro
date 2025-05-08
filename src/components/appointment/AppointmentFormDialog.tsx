
import React, { useState, useEffect } from 'react';
import { format, addMinutes, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePatientOptions } from '@/hooks/usePatientOptions';
import { useAppointmentTypes } from '@/hooks/useAppointmentTypes';
import { Appointment } from '@/types';

interface AppointmentFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Partial<Appointment>) => void;
  appointment: Appointment | null;
  selectedDate?: Date;
}

const AppointmentFormDialog: React.FC<AppointmentFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  appointment,
  selectedDate
}) => {
  const { toast } = useToast();
  const { patients, isLoading: isPatientsLoading } = usePatientOptions();
  const { appointmentTypes, isLoading: isTypesLoading } = useAppointmentTypes();

  const [formData, setFormData] = useState({
    title: '',
    patientId: '',
    appointmentTypeId: '',
    date: selectedDate || new Date(),
    startTime: '09:00',
    endTime: '10:00',
    durationMinutes: 60,
    notes: '',
  });

  useEffect(() => {
    if (appointment) {
      const startDate = new Date(appointment.start_time);
      const endDate = new Date(appointment.end_time);
      
      setFormData({
        title: appointment.title,
        patientId: appointment.patient_id,
        appointmentTypeId: appointment.appointment_type_id || '',
        date: startDate,
        startTime: format(startDate, 'HH:mm'),
        endTime: format(endDate, 'HH:mm'),
        durationMinutes: appointment.duration_minutes,
        notes: appointment.notes || '',
      });
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate,
        title: '',
        patientId: '',
        appointmentTypeId: '',
        startTime: '09:00',
        endTime: '10:00',
        durationMinutes: 60,
        notes: '',
      }));
    } else {
      setFormData({
        title: '',
        patientId: '',
        appointmentTypeId: '',
        date: new Date(),
        startTime: '09:00',
        endTime: '10:00',
        durationMinutes: 60,
        notes: '',
      });
    }
  }, [appointment, selectedDate, isOpen]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    
    // If appointment type changes, update duration and end time
    if (name === 'appointmentTypeId') {
      const selectedType = appointmentTypes.find(type => type.id === value);
      if (selectedType) {
        const durationMinutes = selectedType.duration_minutes;
        const startTimeParts = formData.startTime.split(':');
        const startDate = new Date();
        startDate.setHours(parseInt(startTimeParts[0], 10));
        startDate.setMinutes(parseInt(startTimeParts[1], 10));
        
        const endDate = addMinutes(startDate, durationMinutes);
        const endTime = format(endDate, 'HH:mm');
        
        setFormData(prev => ({ 
          ...prev, 
          durationMinutes, 
          endTime 
        }));
      }
    }
  };
  
  const handleTimeChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    
    // Update end time whenever start time changes
    if (name === 'startTime') {
      const startTimeParts = value.split(':');
      const startDate = new Date();
      startDate.setHours(parseInt(startTimeParts[0], 10));
      startDate.setMinutes(parseInt(startTimeParts[1], 10));
      
      const endDate = addMinutes(startDate, formData.durationMinutes);
      const endTime = format(endDate, 'HH:mm');
      
      setFormData(prev => ({ ...prev, endTime }));
    }
  };
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData({ ...formData, date });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId) {
      toast({
        title: "Erro",
        description: "Selecione um paciente",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.title) {
      toast({
        title: "Erro",
        description: "Informe um título para o agendamento",
        variant: "destructive"
      });
      return;
    }

    const dateStr = format(formData.date, 'yyyy-MM-dd');
    const startDateTimeStr = `${dateStr}T${formData.startTime}:00`;
    const endDateTimeStr = `${dateStr}T${formData.endTime}:00`;
    
    const appointmentData: Partial<Appointment> = {
      title: formData.title,
      patient_id: formData.patientId,
      appointment_type_id: formData.appointmentTypeId || undefined,
      start_time: new Date(startDateTimeStr).toISOString(),
      end_time: new Date(endDateTimeStr).toISOString(),
      duration_minutes: formData.durationMinutes,
      notes: formData.notes,
      status: appointment?.status || 'scheduled'
    };
    
    onSave(appointmentData);
  };

  const isDisabled = isPatientsLoading || isTypesLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título*</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ex: Consulta de Avaliação"
              required
              disabled={isDisabled}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="patientId">Paciente*</Label>
            <Select
              value={formData.patientId}
              onValueChange={(value) => handleSelectChange('patientId', value)}
              disabled={isDisabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um paciente" />
              </SelectTrigger>
              <SelectContent>
                {isPatientsLoading ? (
                  <SelectItem value="loading" disabled>
                    Carregando pacientes...
                  </SelectItem>
                ) : (
                  patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="appointmentTypeId">Tipo de Consulta</Label>
            <Select
              value={formData.appointmentTypeId}
              onValueChange={(value) => handleSelectChange('appointmentTypeId', value)}
              disabled={isDisabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de consulta" />
              </SelectTrigger>
              <SelectContent>
                {isTypesLoading ? (
                  <SelectItem value="loading" disabled>
                    Carregando tipos...
                  </SelectItem>
                ) : (
                  appointmentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.duration_minutes} min)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data*</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={isDisabled}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? (
                      format(formData.date, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={handleDateChange}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Hora de Início*</Label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleTimeChange('startTime', e.target.value)}
                  className="flex-1"
                  disabled={isDisabled}
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duração (minutos)*</Label>
              <Input
                id="durationMinutes"
                name="durationMinutes"
                type="number"
                min="15"
                step="15"
                value={formData.durationMinutes}
                onChange={handleInputChange}
                disabled={isDisabled}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">Hora de Término*</Label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange(e)}
                  className="flex-1"
                  disabled={isDisabled}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Adicione informações adicionais sobre a consulta"
              rows={3}
              disabled={isDisabled}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isDisabled}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-nutri-green hover:bg-nutri-green-dark"
              disabled={isDisabled}
            >
              {appointment ? 'Atualizar' : 'Agendar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentFormDialog;
