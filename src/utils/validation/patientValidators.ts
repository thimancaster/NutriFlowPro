
import { ValidationResult } from './types';

export const validatePatient = (patientData: any): ValidationResult => {
  const errors: Record<string, string> = {};
  const sanitizedData: any = {};

  // Validate and sanitize name
  if (!patientData.name || patientData.name.trim().length === 0) {
    errors.name = 'Nome é obrigatório';
  } else if (patientData.name.length > 100) {
    errors.name = 'Nome muito longo';
  } else {
    sanitizedData.name = patientData.name.trim().replace(/[<>\"'%;()&+]/g, '');
  }

  // Validate email if provided
  if (patientData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientData.email)) {
      errors.email = 'Email inválido';
    } else {
      sanitizedData.email = patientData.email.trim().toLowerCase();
    }
  }

  // Validate phone if provided
  if (patientData.phone) {
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    if (!phoneRegex.test(patientData.phone)) {
      errors.phone = 'Telefone inválido';
    } else {
      sanitizedData.phone = patientData.phone.replace(/[^\d]/g, '');
    }
  }

  // Validate CPF if provided
  if (patientData.cpf) {
    const cpfRegex = /^\d{11}$/;
    const cleanCpf = patientData.cpf.replace(/[^\d]/g, '');
    if (!cpfRegex.test(cleanCpf)) {
      errors.cpf = 'CPF inválido';
    } else {
      sanitizedData.cpf = cleanCpf;
    }
  }

  // Validate gender
  if (patientData.sex) {
    if (!['M', 'F', 'O'].includes(patientData.sex)) {
      errors.sex = 'Sexo inválido';
    } else {
      sanitizedData.sex = patientData.sex;
    }
  }

  // Validate objectives
  if (patientData.objective) {
    const validObjectives = ['emagrecimento', 'manutenção', 'hipertrofia', 'saúde', 'desempenho'];
    if (!validObjectives.includes(patientData.objective)) {
      errors.objective = 'Objetivo inválido';
    } else {
      sanitizedData.objective = patientData.objective;
    }
  }

  // Validate profile
  if (patientData.profile) {
    const validProfiles = ['eutrofico', 'sobrepeso_obesidade', 'atleta'];
    if (!validProfiles.includes(patientData.profile)) {
      errors.profile = 'Perfil inválido';
    } else {
      sanitizedData.profile = patientData.profile;
    }
  }

  // Validate address
  if (patientData.address) {
    sanitizedData.address = {};
    for (const [key, value] of Object.entries(patientData.address)) {
      if (typeof value === 'string' && value.length > 0) {
        sanitizedData.address[key] = (value as string).trim().replace(/[<>\"'%;()&+]/g, '');
      }
    }
  }

  // Copy other safe fields
  if (patientData.secondaryPhone) {
    sanitizedData.secondaryPhone = patientData.secondaryPhone.replace(/[^\d]/g, '');
  }
  if (patientData.status) {
    sanitizedData.status = patientData.status;
  }
  if (patientData.birthDate) {
    sanitizedData.birthDate = patientData.birthDate;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
};
