
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BasicInfoFieldsProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    secondaryPhone: string;
    cpf: string;
    sex?: 'M' | 'F' | 'O';
    objective: string;
    profile: string;
  };
  birthDate?: Date;
  setBirthDate: (date: Date | undefined) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  errors: Record<string, string>;
  validateField: (field: string, value: any) => void;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  formData,
  birthDate,
  setBirthDate,
  handleChange,
  handleSelectChange,
  errors,
  validateField
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Informações Básicas</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={(e) => validateField('name', e.target.value)}
            placeholder="Digite o nome completo"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={(e) => validateField('email', e.target.value)}
            placeholder="email@exemplo.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(11) 99999-9999"
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondaryPhone">Telefone Secundário</Label>
          <Input
            id="secondaryPhone"
            name="secondaryPhone"
            value={formData.secondaryPhone}
            onChange={handleChange}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            placeholder="000.000.000-00"
            className={errors.cpf ? 'border-red-500' : ''}
          />
          {errors.cpf && <p className="text-red-500 text-sm">{errors.cpf}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sex">Sexo</Label>
          <Select value={formData.sex || ''} onValueChange={(value) => handleSelectChange('sex', value)}>
            <SelectTrigger className={errors.sex ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecione o sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Masculino</SelectItem>
              <SelectItem value="F">Feminino</SelectItem>
              <SelectItem value="O">Outro</SelectItem>
            </SelectContent>
          </Select>
          {errors.sex && <p className="text-red-500 text-sm">{errors.sex}</p>}
        </div>

        <div className="space-y-2">
          <Label>Data de Nascimento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !birthDate && "text-muted-foreground",
                  errors.birthDate && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {birthDate ? format(birthDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={birthDate}
                onSelect={setBirthDate}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          {errors.birthDate && <p className="text-red-500 text-sm">{errors.birthDate}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="objective">Objetivo</Label>
          <Input
            id="objective"
            name="objective"
            value={formData.objective}
            onChange={handleChange}
            placeholder="Ex: Perda de peso, Ganho de massa muscular"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile">Perfil</Label>
          <Input
            id="profile"
            name="profile"
            value={formData.profile}
            onChange={handleChange}
            placeholder="Ex: Sedentário, Ativo, Atleta"
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoFields;
