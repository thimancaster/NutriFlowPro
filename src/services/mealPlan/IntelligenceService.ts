/**
 * INTELLIGENCE SERVICE - STUB
 * Mantido para compatibilidade com componentes legados.
 * A lógica de geração foi centralizada em AutoGenerationService.
 */

export interface PatientPreferences {
  favoriteCategories: string[];
  dislikedCategories: string[];
  frequentMealTypes: string[];
  averagePortionSize: 'small' | 'medium' | 'large';
  preferredMealTimes: string[];
  foodCategories: { name: string; count: number }[];
  avoidedFoods: string[];
  averageMacros: { protein: number; carbs: number; fat: number; calories: number };
  insights: string[];
}

export interface SmartTemplate {
  id: string;
  name: string;
  description: string;
  compatibility: number;
  tags: string[];
  totalCalories: number;
}

export interface MealTemplate {
  id: string;
  name: string;
  description: string;
  tags: string[];
  meals: any[];
  totalCalories: number;
  compatibility?: number;
  suitability?: number;
  estimatedCalories?: number;
  highlightFeatures?: string[];
}

export interface ValidationWarning {
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export interface MealPlanValidation {
  isValid: boolean;
  score: number;
  warnings: ValidationWarning[];
  suggestions: string[];
  strengths: string[];
}

export class IntelligenceService {
  static async analyzePatientPreferences(patientId: string): Promise<PatientPreferences> {
    console.log('[STUB] IntelligenceService.analyzePatientPreferences');
    return {
      favoriteCategories: ['Frutas', 'Cereais', 'Proteínas'],
      dislikedCategories: [],
      frequentMealTypes: ['breakfast', 'lunch', 'dinner'],
      averagePortionSize: 'medium',
      preferredMealTimes: ['07:00', '12:00', '19:00'],
      foodCategories: [
        { name: 'Proteínas', count: 15 },
        { name: 'Cereais', count: 12 },
        { name: 'Frutas', count: 10 },
      ],
      avoidedFoods: [],
      averageMacros: { protein: 25, carbs: 50, fat: 25, calories: 2000 },
      insights: ['Preferência por alimentos ricos em proteína', 'Consumo equilibrado de macronutrientes']
    };
  }

  static async suggestSmartTemplates(patientId: string, nutritionalTargets?: any): Promise<SmartTemplate[]> {
    return [];
  }

  static async suggestTemplates(patientId: string, targets?: any): Promise<MealTemplate[]> {
    return [];
  }

  static async validateMealPlan(plan: any, targets?: any): Promise<MealPlanValidation> {
    return {
      isValid: true,
      score: 85,
      warnings: [],
      suggestions: ['Considere adicionar mais variedade de vegetais'],
      strengths: ['Boa distribuição de macronutrientes', 'Variedade adequada de alimentos']
    };
  }
}
