
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { Patient } from '@/types';
import { z } from 'zod';

// Validation schema matching server-side rules (migration 20251016195820)
const patientSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  email: z.string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone deve estar no formato (XX) XXXXX-XXXX')
    .optional()
    .or(z.literal('')),
  cpf: z.string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato XXX.XXX.XXX-XX')
    .optional()
    .or(z.literal('')),
  gender: z.enum(['male', 'female']).optional(),
  birth_date: z.string().optional(),
});

type ValidationErrors = Partial<Record<keyof Patient, string>>;

// Format phone as user types: (XX) XXXXX-XXXX
const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

// Format CPF as user types: XXX.XXX.XXX-XX
const formatCPF = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

interface PatientFormProps {
  onSubmit: (patientData: Partial<Patient>) => void;
  initialData?: Partial<Patient>;
  isLoading?: boolean;
}

const PatientForm: React.FC<PatientFormProps> = ({ 
  onSubmit, 
  initialData = {}, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    ...initialData
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = (field: keyof Patient, value: string): string | undefined => {
    try {
      const fieldSchema = patientSchema.shape[field as keyof typeof patientSchema.shape];
      if (fieldSchema) {
        fieldSchema.parse(value);
      }
      return undefined;
    } catch (e) {
      if (e instanceof z.ZodError) {
        return e.errors[0]?.message;
      }
      return undefined;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const result = patientSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: ValidationErrors = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof Patient;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    
    setErrors({});
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof Patient, value: string) => {
    let formattedValue = value;
    
    // Apply formatting for phone and CPF
    if (field === 'phone') {
      formattedValue = formatPhone(value);
    } else if (field === 'cpf') {
      formattedValue = formatCPF(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof Patient) => {
    const value = formData[field] as string || '';
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Dados do Paciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                className={errors.name ? 'border-destructive' : ''}
                required
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(XX) XXXXX-XXXX"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="XXX.XXX.XXX-XX"
                value={formData.cpf || ''}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                onBlur={() => handleBlur('cpf')}
                className={errors.cpf ? 'border-destructive' : ''}
              />
              {errors.cpf && <p className="text-sm text-destructive mt-1">{errors.cpf}</p>}
            </div>

            <div>
              <Label htmlFor="gender">Sexo</Label>
              <Select 
                value={formData.gender || 'male'} 
                onValueChange={(value) => handleInputChange('gender', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date || ''}
                onChange={(e) => handleInputChange('birth_date', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Continuar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientForm;
