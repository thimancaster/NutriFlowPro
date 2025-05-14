
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface StatusSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const StatusSelect = ({ value, onChange }: StatusSelectProps) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="status" className="text-right">
        Status
      </Label>
      <div className="col-span-3">
        <Select 
          name="status"
          value={value || 'scheduled'} 
          onValueChange={onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Agendado</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="canceled">Cancelado</SelectItem>
            <SelectItem value="rescheduled">Reagendado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default StatusSelect;
