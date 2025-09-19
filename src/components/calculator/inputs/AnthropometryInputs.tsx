import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OfficialCalculatorFormData } from '@/hooks/useOfficialCalculations';

interface AnthropometryInputsProps {
  form: UseFormReturn<OfficialCalculatorFormData>;
}

export default function AnthropometryInputs({ form }: AnthropometryInputsProps) {
  const handleNumericChange = (field: any, value: string) => {
    const parsedValue = parseInt(value, 10);
    field.onChange(isNaN(parsedValue) ? 0 : parsedValue);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <FormField
        control={form.control}
        name="weight"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Peso (kg)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ex: 70"
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
        name="height"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Altura (cm)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ex: 175"
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
        name="age"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Idade</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ex: 30"
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
        name="sex"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sexo</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Feminino</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
