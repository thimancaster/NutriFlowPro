
import { usePatientOptions } from '@/hooks/usePatientOptions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface PatientSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const PatientSelect = ({ value, onChange }: PatientSelectProps) => {
  const { patients, isLoading } = usePatientOptions();
  
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="patient_id" className="text-right">
        Paciente
      </Label>
      <div className="col-span-3">
        <Select 
          name="patient_id"
          value={value || ''} 
          onValueChange={(value) => onChange(value)}
          disabled={isLoading}
        >
          <SelectTrigger className="transition-all duration-300 hover:border-nutri-green focus:border-nutri-green">
            <SelectValue placeholder="Selecione um paciente" />
          </SelectTrigger>
          <SelectContent>
            {patients.map(patient => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PatientSelect;
