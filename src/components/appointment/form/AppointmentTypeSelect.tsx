
import React from 'react';
import { useAppointmentTypes } from '@/hooks/useAppointmentTypes';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface AppointmentTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const AppointmentTypeSelect: React.FC<AppointmentTypeSelectProps> = ({ value, onChange }) => {
  const { types, isLoading } = useAppointmentTypes();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Tipo</Label>
        <div className="col-span-3 h-10 rounded-md bg-gray-100 animate-pulse"></div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="appointment_type_id" className="text-right">
        Tipo
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger id="appointment_type_id" className="col-span-3">
          <SelectValue placeholder="Selecione o tipo de consulta" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Tipos de Consulta</SelectLabel>
            {types.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name} ({type.duration_minutes || 30}min)
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AppointmentTypeSelect;
