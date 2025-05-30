
import { z } from 'zod';

// Schema para dados do paciente
export const patientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  address: z.string().optional(),
  notes: z.string().optional()
});

// Schema para dados de consulta
export const consultationSchema = z.object({
  weight: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Peso deve ser um número positivo'),
  height: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Altura deve ser um número positivo'),
  age: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0 && Number(val) < 150, 'Idade deve ser um número entre 1 e 149'),
  gender: z.enum(['male', 'female'], { required_error: 'Sexo é obrigatório' }),
  activity_level: z.string().min(1, 'Nível de atividade é obrigatório'),
  objective: z.string().min(1, 'Objetivo é obrigatório'),
  consultation_type: z.enum(['primeira_consulta', 'retorno'])
});

// Schema para macronutrientes
export const macroSchema = z.object({
  carbsPercentage: z.string().refine(val => {
    const num = Number(val);
    return !isNaN(num) && num >= 10 && num <= 70;
  }, 'Carboidratos deve estar entre 10% e 70%'),
  proteinPercentage: z.string().refine(val => {
    const num = Number(val);
    return !isNaN(num) && num >= 10 && num <= 50;
  }, 'Proteínas deve estar entre 10% e 50%'),
  fatPercentage: z.string().refine(val => {
    const num = Number(val);
    return !isNaN(num) && num >= 15 && num <= 40;
  }, 'Gorduras deve estar entre 15% e 40%')
}).refine(data => {
  const total = Number(data.carbsPercentage) + Number(data.proteinPercentage) + Number(data.fatPercentage);
  return Math.abs(total - 100) <= 1; // Allow 1% tolerance
}, {
  message: 'A soma dos macronutrientes deve ser 100%',
  path: ['total']
});

// Schema para plano alimentar
export const mealPlanSchema = z.object({
  patient_id: z.string().uuid('ID do paciente inválido'),
  total_calories: z.number().min(800, 'Calorias deve ser pelo menos 800').max(5000, 'Calorias não pode exceder 5000'),
  total_protein: z.number().min(30, 'Proteína deve ser pelo menos 30g'),
  total_carbs: z.number().min(50, 'Carboidratos deve ser pelo menos 50g'),
  total_fats: z.number().min(20, 'Gorduras deve ser pelo menos 20g'),
  date: z.string().refine(val => !isNaN(Date.parse(val)), 'Data inválida')
});

// Funções de validação
export const validatePatient = (data: any) => {
  return patientSchema.safeParse(data);
};

export const validateConsultation = (data: any) => {
  return consultationSchema.safeParse(data);
};

export const validateMacros = (data: any) => {
  return macroSchema.safeParse(data);
};

export const validateMealPlan = (data: any) => {
  return mealPlanSchema.safeParse(data);
};

// Função para extrair mensagens de erro amigáveis
export const getValidationErrors = (result: z.SafeParseError<any>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });
  
  return errors;
};

// Hook para validação em tempo real
export const useValidation = <T>(schema: z.ZodSchema<T>) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = (data: any): boolean => {
    const result = schema.safeParse(data);
    
    if (result.success) {
      setErrors({});
      return true;
    } else {
      setErrors(getValidationErrors(result));
      return false;
    }
  };
  
  const clearErrors = () => setErrors({});
  
  return { errors, validate, clearErrors, hasErrors: Object.keys(errors).length > 0 };
};
