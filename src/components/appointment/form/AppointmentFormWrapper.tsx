
import React from 'react';
import AppointmentErrorBoundary from '../AppointmentErrorBoundary';
import AppointmentFormDialog from '../AppointmentFormDialog';
import { Appointment } from '@/types/appointment';

interface AppointmentFormWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Appointment>) => Promise<void>;
  appointment: Appointment | null;
}

const AppointmentFormWrapper: React.FC<AppointmentFormWrapperProps> = (props) => {
  return (
    <AppointmentErrorBoundary>
      <AppointmentFormDialog {...props} />
    </AppointmentErrorBoundary>
  );
};

export default AppointmentFormWrapper;
