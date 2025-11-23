
import React, { useState, useMemo, useCallback } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus, Clock, User, AlertTriangle } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import AppointmentStatusBadge from './AppointmentStatusBadge';

interface AppointmentCalendarViewProps {
  appointments: Appointment[];
  onDateSelect: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onNewAppointment: (date?: Date) => void;
  selectedDate?: Date;
}

const AppointmentCalendarView: React.FC<AppointmentCalendarViewProps> = ({
  appointments,
  onDateSelect,
  onAppointmentClick,
  onNewAppointment,
  selectedDate
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate || new Date());

  // Memoize getAppointmentsForDate to avoid recalculating on every render
  const getAppointmentsForDate = useCallback(
    (date: Date) => {
      return appointments.filter(appointment => 
        isSameDay(parseISO(appointment.date), date)
      );
    },
    [appointments]
  );

  // Memoize hasConflicts calculation
  const hasConflicts = useCallback(
    (date: Date) => {
      const dayAppointments = getAppointmentsForDate(date);
      if (dayAppointments.length <= 1) return false;

      // Check for time overlaps
      const sortedAppointments = dayAppointments
        .filter(app => app.start_time && app.status !== 'cancelled')
        .sort((a, b) => a.start_time!.localeCompare(b.start_time!));

      for (let i = 0; i < sortedAppointments.length - 1; i++) {
        const current = new Date(sortedAppointments[i].start_time!);
        const next = new Date(sortedAppointments[i + 1].start_time!);
        const currentEnd = new Date(current.getTime() + 60 * 60 * 1000); // Assume 1 hour duration

        if (currentEnd > next) {
          return true;
        }
      }
      return false;
    },
    [getAppointmentsForDate]
  );

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        setCurrentDate(date);
        onDateSelect(date);
      }
    },
    [onDateSelect]
  );

  const appointmentsForSelectedDate = useMemo(
    () => getAppointmentsForDate(currentDate),
    [currentDate, getAppointmentsForDate]
  );

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
              hasAppointments: (date) => getAppointmentsForDate(date).length > 0,
              hasConflicts: (date) => hasConflicts(date)
            }}
            modifiersStyles={{
              hasAppointments: { 
                backgroundColor: 'rgb(59 130 246 / 0.1)',
                color: 'rgb(59 130 246)',
                fontWeight: 'bold'
              },
              hasConflicts: {
                backgroundColor: 'rgb(239 68 68 / 0.1)',
                color: 'rgb(239 68 68)',
                fontWeight: 'bold'
              }
            }}
          />
          
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
              <span>Com agendamentos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
              <span>Conflitos de horário</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments for Selected Date */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {format(currentDate, "dd 'de' MMMM", { locale: ptBR })}
            {hasConflicts(currentDate) && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
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
              .sort((a, b) => {
                const timeA = a.start_time || a.date;
                const timeB = b.start_time || b.date;
                return timeA.localeCompare(timeB);
              })
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onAppointmentClick(appointment)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{appointment.patientName || 'Paciente não encontrado'}</span>
                    </div>
                    <AppointmentStatusBadge status={appointment.status} size="sm" />
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {appointment.start_time 
                        ? format(parseISO(appointment.start_time), 'HH:mm')
                        : 'Horário não definido'
                      }
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {appointment.type}
                      </Badge>
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {appointment.notes}
                    </p>
                  )}
                </div>
              ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentCalendarView;
