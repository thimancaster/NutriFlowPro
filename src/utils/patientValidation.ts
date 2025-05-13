
import { z } from "zod";

// CPF validation
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

// Phone validation for Brazilian format
const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;

// CEP validation
const cepRegex = /^\d{5}-\d{3}$/;

// Email validation
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Patient schema for validation
export const patientSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "E-mail inválido" }).or(z.string().length(0)),
  phone: z.string().regex(phoneRegex, { message: "Telefone inválido: Use o formato (XX) XXXXX-XXXX" }).or(z.string().length(0)),
  secondaryPhone: z.string().regex(phoneRegex, { message: "Telefone secundário inválido: Use o formato (XX) XXXXX-XXXX" }).or(z.string().length(0)).optional(),
  sex: z.enum(["M", "F", "O"], { message: "Selecione o gênero" }),
  birthDate: z.date({ required_error: "Data de nascimento é obrigatória" }),
  cpf: z.string().regex(cpfRegex, { message: "CPF inválido: Use o formato XXX.XXX.XXX-XX" }).or(z.string().length(0)).optional(),
  objective: z.string().min(1, { message: "Objetivo é obrigatório" }),
  profile: z.string().min(1, { message: "Perfil é obrigatório" }),
  address: z.object({
    cep: z.string().regex(cepRegex, { message: "CEP inválido: Use o formato XXXXX-XXX" }).or(z.string().length(0)).optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "archived"], { message: "Status inválido" }).default("active"),
});

export type PatientFormData = z.infer<typeof patientSchema>;

// Validate specific field
export const validateField = (field: keyof PatientFormData, value: any): string | null => {
  try {
    if (field === "address") {
      const addressSchema = patientSchema.shape.address;
      addressSchema.parse(value);
      return null;
    }
    
    const fieldSchema = patientSchema.shape[field as keyof typeof patientSchema.shape];
    if (fieldSchema) {
      fieldSchema.parse(value);
      return null;
    }
    return null;
  } catch (error: any) {
    if (error.errors && error.errors.length > 0) {
      return error.errors[0].message;
    }
    return "Campo inválido";
  }
};

// CPF mask function
export const formatCpf = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

// Phone mask function
export const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

// CEP mask function
export const formatCep = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
};
