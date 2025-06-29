
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { format, parseISO, isSameDay, addDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, User, Grip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { appointmentService } from '@/services/appointmentService';

interface DragDropAppointmentCalendarProps {
  appointments: Appointment[];
  onAppointmentUpdate: (appointment: Appointment) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

const DragDropAppointmentCalendar: React.FC<DragDropAppointmentCalendarProps> = ({
  appointments,
  onAppointmentUpdate,
  onAppointmentClick
}) => {
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ date: string; time: string } | null>(null);
  const { toast } = useToast();

  // Generate time slots (9 AM to 6 PM, 1-hour intervals)
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = 9 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Generate week days starting from Monday
  const currentWeek = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE dd/MM', { locale: ptBR })
    };
  });

  const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedAppointment(null);
    setDragOverSlot(null);
  };

  const handleDragOver = (e: React.DragEvent, date: string, time: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ date, time });
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = async (e: React.DragEvent, date: string, time: string) => {
    e.preventDefault();
    
    if (!draggedAppointment) return;

    try {
      const newDateTime = `${date}T${time}:00`;
      
      const updatedAppointment = {
        ...draggedAppointment,
        date,
        start_time: newDateTime,
        end_time: `${date}T${(parseInt(time.split(':')[0]) + 1).toString().padStart(2, '0')}:00:00`
      };

      const result = await appointmentService.updateAppointment(
        draggedAppointment.id,
        {
          date,
          start_time: newDateTime,
          end_time: updatedAppointment.end_time
        }
      );

      if (result.success) {
        onAppointmentUpdate(updatedAppointment);
        toast({
          title: 'Agendamento Reagendado',
          description: `${draggedAppointment.patientName} reagendado para ${format(parseISO(date), 'dd/MM/yyyy')} às ${time}`,
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível reagendar o agendamento',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao reagendar agendamento',
        variant: 'destructive',
      });
    }

    setDraggedAppointment(null);
    setDragOverSlot(null);
  };

  const getAppointmentForSlot = (date: string, time: string) => {
    return appointments.find(appointment => {
      if (!appointment.start_time) return false;
      const appointmentDate = format(parseISO(appointment.start_time), 'yyyy-MM-dd');
      const appointmentTime = format(parseISO(appointment.start_time), 'HH:mm');
      return appointmentDate === date && appointmentTime === time;
    });
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 border-green-300 text-green-800';
      case 'cancelled': return 'bg-red-100 border-red-300 text-red-800';
      case 'no_show': return 'bg-gray-100 border-gray-300 text-gray-800';
      case 'rescheduled': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grip className="h-5 w-5" />
          Calendário Interativo - Arraste para Reagendar
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header with days */}
            <div className="grid grid-cols-8 border-b">
              <div className="p-3 font-medium text-sm text-center border-r">Horário</div>
              {currentWeek.map((day) => (
                <div key={day.date} className="p-3 font-medium text-sm text-center border-r">
                  {day.label}
                </div>
              ))}
            </div>

            {/* Time slots grid */}
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-8 border-b min-h-[80px]">
                <div className="p-3 text-sm text-center border-r bg-gray-50 font-medium">
                  {time}
                </div>
                {currentWeek.map((day) => {
                  const appointment = getAppointmentForSlot(day.date, time);
                  const isDropZone = dragOverSlot?.date === day.date && dragOverSlot?.time === time;
                  
                  return (
                    <div
                      key={`${day.date}-${time}`}
                      className={`border-r p-2 transition-colors ${
                        isDropZone ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                      }`}
                      onDragOver={(e) => handleDragOver(e, day.date, time)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day.date, time)}
                    >
                      {appointment ? (
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, appointment)}
                          onDragEnd={handleDragEnd}
                          onClick={() => onAppointmentClick(appointment)}
                          className={`p-2 rounded-lg border-2 cursor-move hover:shadow-md transition-all ${getStatusColor(appointment.status)} ${
                            draggedAppointment?.id === appointment.id ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <User className="h-3 w-3" />
                            <span className="text-xs font-medium truncate">
                              {appointment.patientName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">{appointment.type}</span>
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {appointment.status}
                          </Badge>
                        </div>
                      ) : (
                        <div className="h-full min-h-[60px] rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                          {isDropZone && (
                            <span className="text-xs text-blue-600 font-medium">
                              Soltar aqui
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {draggedAppointment && (
          <div className="p-4 bg-blue-50 border-t border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Reagendando:</strong> {draggedAppointment.patientName} - {draggedAppointment.type}
            </p>
            <p className="text-xs text-blue-600">
              Arraste para um novo horário no calendário acima
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DragDropAppointmentCalendar;
