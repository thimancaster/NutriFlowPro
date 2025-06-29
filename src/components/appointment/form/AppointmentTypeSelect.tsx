
import React from 'react';
import { useAppointmentTypes } from '@/hooks/appointments/useAppointmentTypes';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface AppointmentTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const AppointmentTypeSelect: React.FC<AppointmentTypeSelectProps> = ({ value, onChange }) => {
  const { types, loading, error } = useAppointmentTypes();
  
  if (loading) {
    return <Skeleton className="h-12 w-full" />;
  }

  if (error) {
    console.warn('Error loading appointment types:', error);
    // Still render with fallback, don't block the UI
  }
  
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-12 text-base bg-white dark:bg-dark-bg-elevated border-gray-300 dark:border-dark-border-secondary text-gray-900 dark:text-dark-text-primary focus:border-nutri-green focus:ring-nutri-green/20 dark:focus:border-dark-accent-green">
        <SelectValue placeholder="Selecione o tipo de consulta" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Tipos de Consulta</SelectLabel>
          {types.map((type) => (
            <SelectItem 
              key={type.id} 
              value={type.id}
              className="flex items-center py-3"
            >
              <div className="flex items-center w-full">
                <span 
                  className="inline-block w-3 h-3 mr-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: type.color }}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{type.name}</span>
                  <span className="text-xs text-gray-500">
                    {type.duration_minutes || 30} min
                    {type.description && ` • ${type.description}`}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default AppointmentTypeSelect;
