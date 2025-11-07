/**
 * INTELLIGENCE SERVICE
 * Serviço de inteligência artificial para análise e otimização de planos
 */

import { supabase } from '@/integrations/supabase/client';
import { ConsolidatedMealPlan } from '@/types/mealPlanTypes';

export interface PatientPreferences {
  foodCategories: string[];
  avoidedFoods: string[];
  preferredMeals: string[];
  averageMacros?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  insights: string[];
}

export interface MealPlanValidation {
  isValid: boolean;
  score: number;
  warnings?: Array<{
    type: 'caloria' | 'macro' | 'variedade' | 'distribuicao' | 'praticidade';
    severity: 'baixa' | 'media' | 'alta';
    message: string;
  }>;
  suggestions: string[];
  strengths?: string[];
}

export interface MealTemplate {
  name: string;
  description: string;
  suitability: string;
  estimatedCalories?: number;
  highlightFeatures?: string[];
}

export class IntelligenceService {
  /**
   * Analisa preferências do paciente baseado no histórico
   */
  static async analyzePatientPreferences(patientId: string): Promise<PatientPreferences> {
    try {
      console.log('🧠 IntelligenceService: Analisando preferências...');

      const { data, error } = await supabase.functions.invoke('analyze-patient-preferences', {
        body: { patientId }
      });

      if (error) throw error;

      console.log('✅ IntelligenceService: Preferências analisadas');
      return data.preferences;
    } catch (error) {
      console.error('❌ IntelligenceService: Erro ao analisar preferências', error);
      throw error;
    }
  }

  /**
   * Valida um plano alimentar com IA
   */
  static async validateMealPlan(
    mealPlan: ConsolidatedMealPlan,
    targets: { calories: number; protein: number; carbs: number; fats: number },
    patientData?: any
  ): Promise<MealPlanValidation> {
    try {
      console.log('🧠 IntelligenceService: Validando plano...');

      const { data, error } = await supabase.functions.invoke('validate-meal-plan', {
        body: { 
          mealPlan,
          targets,
          patientData
        }
      });

      if (error) throw error;

      console.log('✅ IntelligenceService: Plano validado', data.validation);
      return data.validation;
    } catch (error) {
      console.error('❌ IntelligenceService: Erro ao validar plano', error);
      throw error;
    }
  }

  /**
   * Sugere templates inteligentes baseados no histórico
   */
  static async suggestTemplates(
    userId: string,
    targets: { calories: number; protein: number; carbs: number; fats: number },
    patientPreferences?: PatientPreferences
  ): Promise<MealTemplate[]> {
    try {
      console.log('🧠 IntelligenceService: Sugerindo templates...');

      const { data, error } = await supabase.functions.invoke('suggest-meal-templates', {
        body: { 
          userId,
          targets,
          patientPreferences
        }
      });

      if (error) throw error;

      console.log('✅ IntelligenceService: Templates sugeridos');
      return data.templates || [];
    } catch (error) {
      console.error('❌ IntelligenceService: Erro ao sugerir templates', error);
      throw error;
    }
  }
}
