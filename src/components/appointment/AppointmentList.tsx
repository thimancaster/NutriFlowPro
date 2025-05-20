
import React, { useState, memo } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Appointment } from '@/types';
import { 
  AppointmentItem,
  EmptyState,
  ErrorState,
  LoadingState
} from './list';
import { filterAppointmentsByDate, sortAppointmentsByDate } from './utils/dateUtils';

interface AppointmentListProps {
  appointments: Appointment[];
  isLoading: boolean;
  error: Error | null;
  onAddNew: () => void;
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  isLoading,
  error,
  onAddNew,
  onEdit,
  onDelete
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const filteredAppointments = appointments
    .sort(sortAppointmentsByDate)
    .filter(appointment => filterAppointmentsByDate(appointment, selectedDate));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl font-bold">Consultas</CardTitle>
        <Button onClick={onAddNew} className="bg-nutri-green hover:bg-nutri-green-dark">
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Consulta
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={() => {}} />
        ) : appointments.length === 0 ? (
          <EmptyState onAddNew={onAddNew} />
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <AppointmentItem 
                key={appointment.id} 
                appointment={appointment} 
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default memo(AppointmentList);
