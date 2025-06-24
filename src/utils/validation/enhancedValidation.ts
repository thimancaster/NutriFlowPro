
/**
 * Enhanced validation utilities with security focus
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

// Basic input sanitization function
const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Limit length
};

// Enhanced patient data validation
export const validatePatientData = (data: any): ValidationResult => {
  const errors: string[] = [];
  const sanitizedData: any = {};

  // Name validation
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Nome é obrigatório');
  } else {
    const sanitizedName = sanitizeInput(data.name);
    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      errors.push('Nome deve ter entre 2 e 100 caracteres');
    } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(sanitizedName)) {
      errors.push('Nome deve conter apenas letras e espaços');
    }
    sanitizedData.name = sanitizedName;
  }

  // Email validation
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email é obrigatório');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitizedEmail = sanitizeInput(data.email.toLowerCase());
    if (!emailRegex.test(sanitizedEmail)) {
      errors.push('Email inválido');
    } else if (sanitizedEmail.length > 254) {
      errors.push('Email muito longo');
    }
    sanitizedData.email = sanitizedEmail;
  }

  // Phone validation
  if (data.phone) {
    const sanitizedPhone = data.phone.replace(/\D/g, '');
    if (sanitizedPhone.length < 10 || sanitizedPhone.length > 11) {
      errors.push('Telefone deve ter 10 ou 11 dígitos');
    }
    sanitizedData.phone = sanitizedPhone;
  }

  // Age validation
  if (data.age !== undefined) {
    const age = Number(data.age);
    if (isNaN(age) || age < 0 || age > 150) {
      errors.push('Idade deve estar entre 0 e 150 anos');
    }
    sanitizedData.age = age;
  }

  // Weight validation
  if (data.weight !== undefined) {
    const weight = Number(data.weight);
    if (isNaN(weight) || weight < 1 || weight > 1000) {
      errors.push('Peso deve estar entre 1 e 1000 kg');
    }
    sanitizedData.weight = weight;
  }

  // Height validation
  if (data.height !== undefined) {
    const height = Number(data.height);
    if (isNaN(height) || height < 30 || height > 300) {
      errors.push('Altura deve estar entre 30 e 300 cm');
    }
    sanitizedData.height = height;
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
};

// Enhanced calculation data validation
export const validateCalculationData = (data: any): ValidationResult => {
  const errors: string[] = [];
  const sanitizedData: any = {};

  // Required numeric fields
  const numericFields = [
    { key: 'weight', min: 1, max: 1000, label: 'Peso' },
    { key: 'height', min: 30, max: 300, label: 'Altura' },
    { key: 'age', min: 0, max: 150, label: 'Idade' }
  ];

  numericFields.forEach(field => {
    const value = Number(data[field.key]);
    if (isNaN(value) || value < field.min || value > field.max) {
      errors.push(`${field.label} deve estar entre ${field.min} e ${field.max}`);
    } else {
      sanitizedData[field.key] = value;
    }
  });

  // Sex validation
  if (!['M', 'F'].includes(data.sex)) {
    errors.push('Sexo deve ser M ou F');
  } else {
    sanitizedData.sex = data.sex;
  }

  // Activity level validation
  const validActivityLevels = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
  if (!validActivityLevels.includes(data.activityLevel)) {
    errors.push('Nível de atividade inválido');
  } else {
    sanitizedData.activityLevel = data.activityLevel;
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
};

// File upload validation
export const validateFileUpload = (file: File): ValidationResult => {
  const errors: string[] = [];
  
  // File size validation (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    errors.push('Arquivo deve ter no máximo 5MB');
  }
  
  // File type validation
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Tipo de arquivo não permitido');
  }
  
  // Filename validation
  const sanitizedName = sanitizeInput(file.name);
  if (sanitizedName.length > 255) {
    errors.push('Nome do arquivo muito longo');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
