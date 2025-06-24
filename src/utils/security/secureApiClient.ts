
import { supabase } from '@/integrations/supabase/client';
import { validateSessionIntegrity } from './secureAuth';
import { sanitizeText } from './inputValidation';

/**
 * Secure API client with enhanced security features
 */

export class SecureApiClient {
  private static instance: SecureApiClient;
  
  public static getInstance(): SecureApiClient {
    if (!SecureApiClient.instance) {
      SecureApiClient.instance = new SecureApiClient();
    }
    return SecureApiClient.instance;
  }

  // Secure premium access validation
  async validatePremiumAccess(feature: string, action = 'read'): Promise<any> {
    try {
      // Validate session first
      const sessionValid = await validateSessionIntegrity();
      if (!sessionValid) {
        throw new Error('Sessão inválida detectada');
      }
      
      const { data, error } = await supabase.rpc('validate_premium_access_secure', {
        feature_name: sanitizeText(feature),
        action_type: sanitizeText(action)
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Premium validation error:', error);
      throw error;
    }
  }

  // Secure patient operations
  async createPatient(patientData: any): Promise<any> {
    try {
      // Validate premium access first
      const accessCheck = await this.validatePremiumAccess('patients', 'create');
      if (!accessCheck.has_access) {
        throw new Error(accessCheck.reason || 'Acesso negado');
      }
      
      // Sanitize input data
      const sanitizedData = {
        name: sanitizeText(patientData.name),
        email: patientData.email ? sanitizeText(patientData.email) : null,
        phone: patientData.phone ? sanitizeText(patientData.phone) : null,
        cpf: patientData.cpf ? sanitizeText(patientData.cpf) : null,
        birth_date: patientData.birth_date,
        gender: sanitizeText(patientData.gender),
        address: patientData.address ? sanitizeText(patientData.address) : null,
        notes: patientData.notes ? sanitizeText(patientData.notes) : null,
        user_id: (await supabase.auth.getUser()).data.user?.id
      };
      
      const { data, error } = await supabase
        .from('patients')
        .insert(sanitizedData)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Secure calculation operations
  async createCalculation(calculationData: any): Promise<any> {
    try {
      // Validate premium access
      const accessCheck = await this.validatePremiumAccess('calculations', 'create');
      if (!accessCheck.has_access) {
        throw new Error(accessCheck.reason || 'Acesso negado');
      }
      
      // Sanitize and validate data
      const sanitizedData = {
        weight: Number(calculationData.weight),
        height: Number(calculationData.height),
        age: Number(calculationData.age),
        gender: sanitizeText(calculationData.gender),
        activity_level: sanitizeText(calculationData.activity_level),
        goal: sanitizeText(calculationData.goal),
        bmr: Number(calculationData.bmr),
        tdee: Number(calculationData.tdee),
        protein: Number(calculationData.protein),
        carbs: Number(calculationData.carbs),
        fats: Number(calculationData.fats),
        notes: calculationData.notes ? sanitizeText(calculationData.notes) : null,
        patient_id: calculationData.patient_id,
        user_id: (await supabase.auth.getUser()).data.user?.id
      };
      
      const { data, error } = await supabase
        .from('calculations')
        .insert(sanitizedData)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Secure meal plan operations
  async createMealPlan(mealPlanData: any): Promise<any> {
    try {
      // Validate premium access
      const accessCheck = await this.validatePremiumAccess('meal_plans', 'create');
      if (!accessCheck.has_access) {
        throw new Error(accessCheck.reason || 'Acesso negado');
      }
      
      // Use the secure database function for meal plan generation
      const { data, error } = await supabase.rpc('generate_meal_plan', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_patient_id: mealPlanData.patient_id,
        p_target_calories: Number(mealPlanData.total_calories),
        p_target_protein: Number(mealPlanData.total_protein),
        p_target_carbs: Number(mealPlanData.total_carbs),
        p_target_fats: Number(mealPlanData.total_fats),
        p_date: mealPlanData.date
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Secure food search
  async searchFoods(query: string, category?: string, limit = 20): Promise<any> {
    try {
      // Rate limiting check
      const rateLimitKey = `food_search_${(await supabase.auth.getUser()).data.user?.id}`;
      const rateLimitPassed = await this.checkRateLimit(rateLimitKey, 30, 60000); // 30 requests per minute
      
      if (!rateLimitPassed) {
        throw new Error('Muitas buscas. Aguarde um momento.');
      }
      
      // Use secure search function
      const { data, error } = await supabase.rpc('search_foods_secure', {
        search_query: sanitizeText(query),
        search_category: category ? sanitizeText(category) : null,
        search_limit: Math.min(limit, 50) // Limit to prevent abuse
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Client-side rate limiting
  private rateLimitStore = new Map<string, { count: number; lastReset: number }>();
  
  private async checkRateLimit(key: string, maxRequests = 10, windowMs = 300000): Promise<boolean> {
    const now = Date.now();
    const stored = this.rateLimitStore.get(key);
    
    if (!stored || now - stored.lastReset > windowMs) {
      this.rateLimitStore.set(key, { count: 1, lastReset: now });
      return true;
    }
    
    if (stored.count >= maxRequests) {
      return false;
    }
    
    stored.count++;
    return true;
  }
}

// Export singleton instance
export const secureApiClient = SecureApiClient.getInstance();
