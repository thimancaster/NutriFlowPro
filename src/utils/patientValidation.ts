
import { z } from "zod";
import { Json } from '@/integrations/supabase/types';

// CPF validation
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

// Phone validation for Brazilian format
const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;

// CEP validation
const cepRegex = /^\d{5}-\d{3}$/;

// Email validation
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// CPF validation function
export const validateCpf = (cpf: string): boolean => {
  // Empty CPF is considered valid (since it's optional)
  if (!cpf || cpf.trim() === '') return true;
  
  // Remove non-numeric characters
  cpf = cpf.replace(/[^\d]/g, '');

  // Check if CPF has 11 digits
  if (cpf.length !== 11) return false;

  // Check for known invalid CPFs (all repeated digits)
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Calculate first verification digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  const firstDigit = remainder > 9 ? 0 : remainder;

  // Calculate second verification digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  const secondDigit = remainder > 9 ? 0 : remainder;

  // Check if calculated verification digits match the last two digits of the CPF
  return (
    parseInt(cpf.charAt(9)) === firstDigit &&
    parseInt(cpf.charAt(10)) === secondDigit
  );
};

// Address schema for validation
const addressSchema = z.object({
  cep: z.string().regex(cepRegex, { message: "CEP inválido: Use o formato XXXXX-XXX" }).or(z.string().length(0)).optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

// Patient schema for validation with improved CPF handling
export const patientSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "E-mail inválido" }).or(z.string().length(0)),
  phone: z.string().regex(phoneRegex, { message: "Telefone inválido: Use o formato (XX) XXXXX-XXXX" }).or(z.string().length(0)),
  secondaryPhone: z.string().regex(phoneRegex, { message: "Telefone secundário inválido: Use o formato (XX) XXXXX-XXXX" }).or(z.string().length(0)).optional(),
  sex: z.enum(["M", "F", "O"], { message: "Selecione o gênero" }),
  birthDate: z.date({ required_error: "Data de nascimento é obrigatória" }).optional(),
  cpf: z.string()
       .refine(
         (value) => {
           // Accept empty values
           if (!value || value.trim() === '') return true;
           // Accept both formatted and unformatted CPFs
           return value.match(cpfRegex) !== null || value.match(/^\d{11}$/) !== null;
         },
         { message: "CPF inválido: Use o formato XXX.XXX.XXX-XX ou apenas números" }
       )
       .refine(
         (value) => !value || value.trim() === '' || validateCpf(value), 
         { message: "CPF inválido: dígitos verificadores não conferem" }
       ),
  objective: z.string().min(1, { message: "Objetivo é obrigatório" }),
  profile: z.string().min(1, { message: "Perfil é obrigatório" }),
  address: addressSchema.optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "archived"], { message: "Status inválido" }).default("active"),
});

export type PatientFormData = z.infer<typeof patientSchema>;

// Validate specific field
export const validateField = (field: string, value: any): string | null => {
  try {
    // For empty optional fields, don't validate
    if ((field === 'email' || field === 'phone' || field === 'secondaryPhone' || field === 'cpf') && 
        (!value || value === '')) {
      return null;
    }
    
    // Handle nested fields like address.cep
    if (field.includes('.')) {
      const [parentField, childField] = field.split('.');
      
      if (parentField === 'address') {
        const addressField = addressSchema.shape[childField as keyof typeof addressSchema.shape];
        if (addressField) {
          addressField.parse(value);
          return null;
        }
      }
      return null;
    }
    
    // Special case for CPF validation
    if (field === 'cpf' && value && value.length > 0) {
      // First check if it's a valid format (with or without dots/dash)
      if (!cpfRegex.test(value) && !/^\d{11}$/.test(value)) {
        return "CPF inválido: Use o formato XXX.XXX.XXX-XX ou apenas números";
      }
      
      // Then check the mathematical validation
      if (!validateCpf(value)) {
        return "CPF inválido: dígitos verificadores não conferem";
      }
      
      return null;
    }
    
    // Special case for birthDate
    if (field === 'birthDate' && !value) {
      return "Data de nascimento é obrigatória";
    }
    
    // Handle standard fields
    const fieldSchema = patientSchema.shape[field as keyof typeof patientSchema.shape];
    if (fieldSchema) {
      fieldSchema.parse(value);
      return null;
    }
    return null;
  } catch (error: any) {
    console.error("Field validation error:", field, error);
    if (error.errors && error.errors.length > 0) {
      return error.errors[0].message;
    }
    return "Campo inválido";
  }
};

// CPF mask function - updated to be more forgiving with input formats
export const formatCpf = (value: string) => {
  if (!value) return '';
  
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '');
  
  // Apply CPF format (XXX.XXX.XXX-XX)
  return numbers
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1'); // Prevent more than 11 digits
};

// Phone mask function
export const formatPhone = (value: string) => {
  if (!value) return '';
  
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '');
  
  // Apply phone format ((XX) XXXXX-XXXX)
  return numbers
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1'); // Prevent more than 11 digits
};

// CEP mask function
export const formatCep = (value: string) => {
  if (!value) return '';
  
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '');
  
  // Apply CEP format (XXXXX-XXX)
  return numbers
    .replace(/(\d{5})(\d{0,3})/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1'); // Prevent more than 8 digits
};
