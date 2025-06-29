
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { appointmentService } from '@/services/appointmentService';
import { format, parseISO, isSameDay, isWithinInterval, addMinutes } from 'date-fns';

interface AppointmentConflictCheckerProps {
  selectedDate: string;
  selectedTime?: string;
  duration?: number;
  excludeId?: string;
  onConflictChange?: (hasConflict: boolean) => void;
}

const AppointmentConflictChecker: React.FC<AppointmentConflictCheckerProps> = ({
  selectedDate,
  selectedTime,
  duration = 60,
  excludeId,
  onConflictChange
}) => {
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (selectedDate && selectedTime && user?.id) {
      checkForConflicts();
    }
  }, [selectedDate, selectedTime, duration, user?.id]);

  const checkForConflicts = async () => {
    if (!user?.id || !selectedDate || !selectedTime) return;

    setIsChecking(true);
    try {
      const appointmentDateTime = new Date(`${selectedDate}T${selectedTime}`);
      const appointmentEnd = addMinutes(appointmentDateTime, duration);

      // Get appointments for the selected date
      const result = await appointmentService.getAppointments(user.id, {
        startDate: selectedDate,
        endDate: selectedDate
      });

      if (result.success && result.data) {
        const conflictingAppointments = result.data.filter(appointment => {
          // Skip the appointment being edited
          if (excludeId && appointment.id === excludeId) return false;
          
          // Skip cancelled appointments
          if (appointment.status === 'cancelled') return false;

          try {
            const existingStart = new Date(appointment.start_time || appointment.date);
            const existingEnd = addMinutes(existingStart, 60); // Default duration

            // Check for time overlap
            return (
              (appointmentDateTime >= existingStart && appointmentDateTime < existingEnd) ||
              (appointmentEnd > existingStart && appointmentEnd <= existingEnd) ||
              (appointmentDateTime <= existingStart && appointmentEnd >= existingEnd)
            );
          } catch {
            return false;
          }
        });

        setConflicts(conflictingAppointments);
        onConflictChange?.(conflictingAppointments.length > 0);
      }
    } catch (error) {
      console.error('Error checking conflicts:', error);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Verificando conflitos de horário...
        </AlertDescription>
      </Alert>
    );
  }

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <strong>Conflito de horário detectado!</strong>
        <div className="mt-2 space-y-1">
          {conflicts.map((conflict, index) => (
            <div key={index} className="text-sm">
              • {conflict.title || conflict.type} às {
                format(new Date(conflict.start_time || conflict.date), 'HH:mm')
              }
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default AppointmentConflictChecker;
