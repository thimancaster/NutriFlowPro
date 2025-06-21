
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus, Clock, User } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EnhancedAppointment } from '@/types/appointments';
import { useAppointmentTypes } from '@/hooks/useAppointmentTypes';

interface AppointmentCalendarProps {
  appointments: EnhancedAppointment[];
  onDateSelect: (date: Date) => void;
  onAppointmentClick: (appointment: EnhancedAppointment) => void;
  onNewAppointment: (date?: Date) => void;
  selectedDate?: Date;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onDateSelect,
  onAppointmentClick,
  onNewAppointment,
  selectedDate
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate || new Date());
  const { getTypeInfo } = useAppointmentTypes();

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(parseISO(appointment.date), date)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      case 'no_show': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'scheduled': return 'Agendado';
      case 'completed': return 'Finalizado';
      case 'cancelled': return 'Cancelado';
      case 'no_show': return 'Faltou';
      default: return status;
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      onDateSelect(date);
    }
  };

  const appointmentsForSelectedDate = getAppointmentsForDate(currentDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Calendário de Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={handleDateSelect}
            locale={ptBR}
            className="rounded-md border"
            modifiers={{
              hasAppointments: (date) => getAppointmentsForDate(date).length > 0
            }}
            modifiersStyles={{
              hasAppointments: { 
                backgroundColor: 'rgb(59 130 246 / 0.1)',
                color: 'rgb(59 130 246)',
                fontWeight: 'bold'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Appointments for Selected Date */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {format(currentDate, "dd 'de' MMMM", { locale: ptBR })}
          </CardTitle>
          <Button 
            size="sm" 
            onClick={() => onNewAppointment(currentDate)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {appointmentsForSelectedDate.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Nenhum agendamento para esta data</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => onNewAppointment(currentDate)}
              >
                Agendar Consulta
              </Button>
            </div>
          ) : (
            appointmentsForSelectedDate
              .sort((a, b) => (a.start_time || a.date).localeCompare(b.start_time || b.date))
              .map((appointment) => {
                const typeInfo = getTypeInfo(appointment.appointment_type_id);
                
                return (
                  <div
                    key={appointment.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onAppointmentClick(appointment)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{appointment.patient_name}</span>
                      </div>
                      <Badge 
                        className={`${getStatusColor(appointment.status)} text-white`}
                      >
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {appointment.start_time 
                          ? format(parseISO(appointment.start_time), 'HH:mm')
                          : 'Horário não definido'
                        }
                      </div>
                      
                      <div 
                        className="flex items-center gap-1"
                        style={{ color: typeInfo.color }}
                      >
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: typeInfo.color }}
                        />
                        {typeInfo.name}
                      </div>
                      
                      {appointment.duration_minutes && (
                        <span>{appointment.duration_minutes}min</span>
                      )}
                    </div>
                    
                    {appointment.notes && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {appointment.notes}
                      </p>
                    )}
                  </div>
                );
              })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentCalendar;
