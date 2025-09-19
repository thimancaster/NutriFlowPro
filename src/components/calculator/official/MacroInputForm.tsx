import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { OfficialCalculatorFormData } from '@/hooks/useOfficialCalculations';

interface MacroInputFormProps {
  form: UseFormReturn<OfficialCalculatorFormData>;
}

export default function MacroInputForm({ form }: MacroInputFormProps) {
  const handleNumericChange = (field: any, value: string) => {
    const parsedValue = parseFloat(value);
    field.onChange(isNaN(parsedValue) ? 0 : parsedValue);
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="proteinPerKg"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Proteína (g/kg)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ex: 1.8"
                step="0.1"
                {...field}
                onChange={(e) => handleNumericChange(field, e.target.value)}
                onFocus={(e) => e.target.value === '0' && field.onChange('')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="fatPerKg"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gordura (g/kg)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ex: 1.0"
                step="0.1"
                {...field}
                onChange={(e) => handleNumericChange(field, e.target.value)}
                onFocus={(e) => e.target.value === '0' && field.onChange('')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
