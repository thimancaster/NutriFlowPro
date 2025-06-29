
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AppointmentStatus } from '@/types/appointment';
import { getStatusLabel, getStatusColor } from '@/hooks/appointments/utils/statusUtils';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  size?: 'sm' | 'md' | 'lg';
}

const AppointmentStatusBadge: React.FC<AppointmentStatusBadgeProps> = ({ 
  status, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-base px-3 py-2'
  };

  return (
    <Badge 
      className={`${getStatusColor(status)} ${sizeClasses[size]} font-medium`}
      variant="secondary"
    >
      {getStatusLabel(status)}
    </Badge>
  );
};

export default AppointmentStatusBadge;
