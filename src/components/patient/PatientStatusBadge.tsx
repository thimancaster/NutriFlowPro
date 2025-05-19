
import React from 'react';
import { Patient } from '@/types/patient';
import { getPatientStatusInfo } from '@/utils/patient';
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  Archive, 
  UserPlus,
  LucideIcon
} from 'lucide-react';
import { Badge } from '@/components/ui';

interface PatientStatusBadgeProps {
  patient: Patient;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PatientStatusBadge: React.FC<PatientStatusBadgeProps> = ({
  patient,
  showIcon = true,
  size = 'md',
  className = ''
}) => {
  const statusInfo = getPatientStatusInfo(patient);
  
  // Map icons
  const iconMap: Record<string, LucideIcon> = {
    'check-circle': CheckCircle,
    'alert-triangle': AlertTriangle,
    'alert-circle': AlertCircle,
    'archive': Archive,
    'user-plus': UserPlus
  };
  
  const IconComponent = iconMap[statusInfo.icon] || CheckCircle;
  
  // Map colors to badge variants
  const variantMap: Record<string, string> = {
    'green': 'success',
    'red': 'destructive',
    'amber': 'warning',
    'blue': 'info',
    'gray': 'outline'
  };
  
  const variant = variantMap[statusInfo.color] || 'default';
  
  // Sizes
  const sizeClasses = {
    sm: 'text-xs py-0',
    md: 'text-xs',
    lg: 'text-sm py-1'
  };
  
  return (
    <Badge 
      variant={variant as any} 
      className={`${sizeClasses[size]} ${className}`}
    >
      {showIcon && (
        <IconComponent className={`${size !== 'sm' ? 'mr-1' : ''} h-3.5 w-3.5`} />
      )}
      {size !== 'sm' && statusInfo.label}
    </Badge>
  );
};

export default PatientStatusBadge;
