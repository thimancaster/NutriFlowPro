
import { useAppointmentTypes } from '@/hooks/useAppointmentTypes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AppointmentType } from '@/types/appointment';

interface AppointmentTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const AppointmentTypeSelect = ({ value, onChange }: AppointmentTypeSelectProps) => {
  const { appointmentTypes, isLoading } = useAppointmentTypes();
  
  // Make appointment types available to the form hook
  if (!window.appointmentTypes && appointmentTypes.length > 0) {
    window.appointmentTypes = appointmentTypes;
  }
  
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="appointment_type_id" className="text-right">
        Tipo de Consulta
      </Label>
      <div className="col-span-3">
        <Select 
          name="appointment_type_id"
          value={value || ''} 
          onValueChange={onChange}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de consulta" />
          </SelectTrigger>
          <SelectContent>
            {appointmentTypes.map(type => (
              <SelectItem key={type.id} value={type.id}>
                {type.name} ({type.duration_minutes} min)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default AppointmentTypeSelect;
