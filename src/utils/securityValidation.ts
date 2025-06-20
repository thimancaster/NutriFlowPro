
export interface ValidationResult {
  isValid: boolean;
  sanitizedTerm?: string;
  sanitizedContent?: string;
  sanitizedData?: any;
  error?: string;
  errors?: Record<string, string>;
}

export const validateSecureForm = {
  foodSearch: (searchTerm: string): ValidationResult => {
    // Basic validation
    if (!searchTerm) {
      return { isValid: false, error: 'Termo de busca não pode estar vazio' };
    }

    if (searchTerm.length > 100) {
      return { isValid: false, error: 'Termo de busca muito longo' };
    }

    // Remove potentially dangerous characters
    const sanitized = searchTerm.replace(/[<>\"'%;()&+]/g, '');
    
    // Check for SQL injection patterns
    const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i;
    if (sqlPatterns.test(sanitized)) {
      return { isValid: false, error: 'Termo de busca contém caracteres não permitidos' };
    }

    return { isValid: true, sanitizedTerm: sanitized.trim() };
  },

  notes: (content: string): ValidationResult => {
    // Basic validation for notes content
    if (!content) {
      return { isValid: true, sanitizedContent: '' };
    }

    if (content.length > 10000) {
      return { isValid: false, error: 'Conteúdo muito longo (máximo 10.000 caracteres)' };
    }

    // Remove potentially dangerous HTML/script tags but keep line breaks
    const sanitized = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');

    return { isValid: true, sanitizedContent: sanitized };
  },

  patient: (patientData: any): ValidationResult => {
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
  },

  calculation: (calculationData: any): ValidationResult => {
    const errors: Record<string, string> = {};
    const sanitizedData: any = {};

    // Validate weight
    if (!calculationData.weight || calculationData.weight <= 0) {
      errors.weight = 'Peso deve ser um número positivo';
    } else if (calculationData.weight < 20 || calculationData.weight > 300) {
      errors.weight = 'Peso deve estar entre 20kg e 300kg';
    } else {
      sanitizedData.weight = Number(calculationData.weight);
    }

    // Validate height
    if (!calculationData.height || calculationData.height <= 0) {
      errors.height = 'Altura deve ser um número positivo';
    } else if (calculationData.height < 100 || calculationData.height > 250) {
      errors.height = 'Altura deve estar entre 100cm e 250cm';
    } else {
      sanitizedData.height = Number(calculationData.height);
    }

    // Validate age
    if (!calculationData.age || calculationData.age <= 0) {
      errors.age = 'Idade deve ser um número positivo';
    } else if (calculationData.age < 10 || calculationData.age > 100) {
      errors.age = 'Idade deve estar entre 10 e 100 anos';
    } else {
      sanitizedData.age = Number(calculationData.age);
    }

    // Validate sex
    if (!calculationData.sex || !['M', 'F'].includes(calculationData.sex)) {
      errors.sex = 'Sexo deve ser M ou F';
    } else {
      sanitizedData.sex = calculationData.sex;
    }

    // Validate activity level
    const validActivityLevels = ['sedentario', 'leve', 'moderado', 'intenso', 'muito_intenso'];
    if (!calculationData.activityLevel || !validActivityLevels.includes(calculationData.activityLevel)) {
      errors.activityLevel = 'Nível de atividade inválido';
    } else {
      sanitizedData.activityLevel = calculationData.activityLevel;
    }

    // Validate objective
    const validObjectives = ['emagrecimento', 'manutenção', 'hipertrofia', 'personalizado'];
    if (!calculationData.objective || !validObjectives.includes(calculationData.objective)) {
      errors.objective = 'Objetivo inválido';
    } else {
      sanitizedData.objective = calculationData.objective;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData
    };
  },

  mealPlan: (mealPlanData: any): ValidationResult => {
    const errors: Record<string, string> = {};
    const sanitizedData: any = {};

    // Validate total calories
    if (!mealPlanData.totalCalories || mealPlanData.totalCalories <= 0) {
      errors.totalCalories = 'Total de calorias deve ser positivo';
    } else if (mealPlanData.totalCalories < 800 || mealPlanData.totalCalories > 5000) {
      errors.totalCalories = 'Total de calorias deve estar entre 800 e 5000';
    } else {
      sanitizedData.totalCalories = Number(mealPlanData.totalCalories);
    }

    // Validate macronutrients
    if (mealPlanData.totalProtein && (mealPlanData.totalProtein < 0 || mealPlanData.totalProtein > 500)) {
      errors.totalProtein = 'Proteína deve estar entre 0 e 500g';
    } else if (mealPlanData.totalProtein) {
      sanitizedData.totalProtein = Number(mealPlanData.totalProtein);
    }

    if (mealPlanData.totalCarbs && (mealPlanData.totalCarbs < 0 || mealPlanData.totalCarbs > 800)) {
      errors.totalCarbs = 'Carboidratos deve estar entre 0 e 800g';
    } else if (mealPlanData.totalCarbs) {
      sanitizedData.totalCarbs = Number(mealPlanData.totalCarbs);
    }

    if (mealPlanData.totalFats && (mealPlanData.totalFats < 0 || mealPlanData.totalFats > 200)) {
      errors.totalFats = 'Gorduras deve estar entre 0 e 200g';
    } else if (mealPlanData.totalFats) {
      sanitizedData.totalFats = Number(mealPlanData.totalFats);
    }

    // Validate patient ID if provided
    if (mealPlanData.patientId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(mealPlanData.patientId)) {
        errors.patientId = 'ID do paciente inválido';
      } else {
        sanitizedData.patientId = mealPlanData.patientId;
      }
    }

    // Validate meals array
    if (mealPlanData.meals && Array.isArray(mealPlanData.meals)) {
      sanitizedData.meals = mealPlanData.meals.map((meal: any) => ({
        ...meal,
        name: meal.name ? meal.name.toString().trim().slice(0, 100) : '',
        items: Array.isArray(meal.items) ? meal.items : []
      }));
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData
    };
  }
};

class RateLimiter {
  private requests = new Map<string, number[]>();
  
  checkLimit(key: string, maxRequests: number, windowMs: number) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requests = this.requests.get(key)!;
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return { allowed: false, retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000) };
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return { allowed: true };
  }
}

export const rateLimiter = new RateLimiter();

export const csrfProtection = {
  generateToken: (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },
  
  attachToken: <T extends object>(data: T): T & { _csrf: string } => {
    return {
      ...data,
      _csrf: csrfProtection.generateToken()
    };
  },
  
  validateToken: (token: string): boolean => {
    // Basic token validation - in production this would be more sophisticated
    return typeof token === 'string' && token.length > 10;
  }
};
