/**
 * 🎯 PLAN WORKFLOW ORCHESTRATION
 * Centralizes meal plan generation workflow ensuring proper data flow:
 * Patient → Calculation → Meal Plan Generation
 */

import { supabase } from '@/integrations/supabase/client';
import { normalizeCalculationStatus, normalizeGender, sanitizeCalculationData } from '@/utils/calculationValidation';
import { ConsolidatedMealPlan } from '@/types/mealPlanTypes';

export interface PatientData {
  id: string;
  name: string;
  weight?: number;
  height?: number;
  age?: number;
  gender?: 'male' | 'female' | 'M' | 'F';
  birth_date?: string;
}

export interface CalculationResults {
  id: string;
  patient_id: string;
  user_id: string;
  totalCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  tmb: number;
  get: number;
  vet: number;
  objective: string;
  status: string;
}

export interface MealPlanWorkflowParams {
  patientData: PatientData;
  calculationResults?: CalculationResults;
  userId: string;
}

export class PlanWorkflowService {
  
  /**
   * Main orchestration function - generates meal plan using saved calculations
   */
  static async gerarPlanoAlimentar(params: MealPlanWorkflowParams): Promise<ConsolidatedMealPlan | null> {
    const { patientData, userId } = params;
    
    console.log('🚀 [PLAN_WORKFLOW] Iniciando geração de plano alimentar:', {
      patient: patientData.name,
      userId
    });

    try {
      // 1. Validate patient data completeness
      const validation = this.validatePatientData(patientData);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // 2. Get or create calculation results
      let calculationResults = params.calculationResults;
      if (!calculationResults) {
        calculationResults = await this.getOrCreateCalculation(patientData, userId);
      }

      // 3. Validate calculation completeness
      if (!this.isCalculationComplete(calculationResults)) {
        throw new Error('Complete os cálculos antes de gerar o plano alimentar.');
      }

      // 4. Generate meal plan using Supabase RPC
      const mealPlanId = await this.callMealPlanRPC(calculationResults, userId);
      
      // 5. Link calculation and meal plan in consultations
      await this.linkConsultation(calculationResults.id, mealPlanId, patientData.id);

      // 6. Retrieve generated meal plan
      const mealPlan = await this.getMealPlanById(mealPlanId);
      
      console.log('✅ [PLAN_WORKFLOW] Plano alimentar gerado com sucesso:', mealPlanId);
      return mealPlan;

    } catch (error: any) {
      console.error('❌ [PLAN_WORKFLOW] Erro na geração:', error);
      throw new Error(`Erro ao gerar plano alimentar: ${error.message}`);
    }
  }

  /**
   * Validates patient data completeness for meal plan generation
   */
  private static validatePatientData(patient: PatientData) {
    if (!patient.id || !patient.name) {
      return { isValid: false, message: 'Selecione um paciente válido.' };
    }

    // Calculate age if birth_date is available
    const age = patient.birth_date 
      ? Math.floor((new Date().getTime() - new Date(patient.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : patient.age;

    if (!patient.weight || !patient.height || !age || !patient.gender) {
      return { 
        isValid: false, 
        message: 'Complete os dados básicos do paciente (peso, altura, idade, sexo) antes de gerar o plano alimentar.' 
      };
    }

    return { isValid: true, message: 'Dados válidos' };
  }

  /**
   * Gets existing calculation or creates a new one
   */
  private static async getOrCreateCalculation(patient: PatientData, userId: string): Promise<CalculationResults> {
    // Try to get most recent completed calculation for this patient
    const { data: existingCalc, error: fetchError } = await supabase
      .from('calculations')
      .select('*')
      .eq('patient_id', patient.id)
      .eq('user_id', userId)
      .eq('status', 'concluida')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingCalc && !fetchError) {
      console.log('📊 [PLAN_WORKFLOW] Using existing calculation:', existingCalc.id);
      return {
        id: existingCalc.id,
        patient_id: existingCalc.patient_id,
        user_id: existingCalc.user_id,
        totalCalories: existingCalc.tdee,
        protein: existingCalc.protein,
        carbs: existingCalc.carbs,
        fats: existingCalc.fats,
        tmb: existingCalc.bmr,
        get: existingCalc.tdee, // Using TDEE as GET
        vet: existingCalc.vet || existingCalc.tdee,
        objective: existingCalc.goal,
        status: existingCalc.status
      };
    }

    // Create new calculation if none exists
    console.log('🧮 [PLAN_WORKFLOW] Creating new calculation for patient:', patient.name);
    return await this.createNewCalculation(patient, userId);
  }

  /**
   * Creates a new calculation with patient data
   */
  private static async createNewCalculation(patient: PatientData, userId: string): Promise<CalculationResults> {
    const age = patient.birth_date 
      ? Math.floor((new Date().getTime() - new Date(patient.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : patient.age || 30;

    const weight = patient.weight || 70;
    const height = patient.height || 170;
    const gender = normalizeGender(patient.gender);
    
    let bmr: number, tdee: number, protein: number, carbs: number, fats: number;

    try {
      // Use official calculation system for consistency
      const { calculateComplete_Official } = await import('@/utils/nutrition/official/officialCalculations');
      
      // Use official calculation engine
      const officialResult = calculateComplete_Official({
        weight,
        height,
        age,
        gender: gender as 'M' | 'F',
        profile: 'eutrofico', // Default profile
        activityLevel: 'moderado', // Default activity
        objective: 'manutenção', // Default objective
        macroInputs: { proteinPerKg: 1.6, fatPerKg: 1.0 } // Default macros
      });
      
      bmr = officialResult.tmb.value;
      tdee = officialResult.vet;
      protein = officialResult.macros.protein.grams;
      carbs = officialResult.macros.carbs.grams;
      fats = officialResult.macros.fat.grams;
      
    } catch (error) {
      // Fallback to basic calculation if official fails
      console.warn('[PLAN_WORKFLOW] Official calculation failed, using fallback:', error);
      
      bmr = gender === 'M' 
        ? 66 + (13.7 * weight) + (5.0 * height) - (6.8 * age)
        : 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age);
      
      tdee = bmr * 1.55;
      protein = (tdee * 0.25) / 4; 
      carbs = (tdee * 0.50) / 4;   
      fats = (tdee * 0.25) / 9;    
    }

    const calculationData = sanitizeCalculationData({
      patient_id: patient.id,
      user_id: userId,
      weight,
      height,
      age,
      gender,
      bmr,
      tdee,
      vet: tdee,
      protein,
      carbs,
      fats,
      goal: 'manutencao',
      activity_level: 'moderado',
      status: 'concluida'
    });

    const { data, error } = await supabase
      .from('calculations')
      .insert([calculationData])
      .select()
      .single();

    if (error) {
      console.error('❌ [PLAN_WORKFLOW] Error creating calculation:', error);
      throw error;
    }

    return {
      id: data.id,
      patient_id: data.patient_id,
      user_id: data.user_id,
      totalCalories: data.tdee,
      protein: data.protein,
      carbs: data.carbs,
      fats: data.fats,
      tmb: data.bmr,
      get: data.tdee,
      vet: data.vet,
      objective: data.goal,
      status: data.status
    };
  }

  /**
   * Validates if calculation is complete and ready for meal plan generation
   */
  private static isCalculationComplete(calculation: CalculationResults): boolean {
    return !!(
      calculation &&
      calculation.totalCalories > 0 &&
      calculation.protein > 0 &&
      calculation.carbs > 0 &&
      calculation.fats > 0 &&
      normalizeCalculationStatus(calculation.status) === 'concluida'
    );
  }

  /**
   * Calls Supabase RPC function to generate meal plan with cultural rules
   */
  private static async callMealPlanRPC(calculation: CalculationResults, userId: string): Promise<string> {
    console.log('🍽️ [PLAN_WORKFLOW] Calling meal plan RPC with:', {
      calories: calculation.totalCalories,
      protein: calculation.protein,
      carbs: calculation.carbs,
      fats: calculation.fats
    });

    const { data: mealPlanId, error } = await supabase.rpc(
      'generate_meal_plan_with_cultural_rules',
      {
        p_user_id: userId,
        p_patient_id: calculation.patient_id,
        p_target_calories: calculation.totalCalories,
        p_target_protein: calculation.protein,
        p_target_carbs: calculation.carbs,
        p_target_fats: calculation.fats,
        p_date: new Date().toISOString().split('T')[0]
      }
    );

    if (error) {
      console.error('❌ [PLAN_WORKFLOW] RPC Error:', error);
      throw new Error(`Erro na geração do plano: ${error.message}`);
    }

    return mealPlanId;
  }

  /**
   * Links calculation and meal plan in consultations table
   */
  private static async linkConsultation(calculationId: string, mealPlanId: string, patientId: string): Promise<void> {
    const { error } = await supabase
      .from('consultations')
      .insert({
        patient_id: patientId,
        calculation_id: calculationId,
        meal_plan_id: mealPlanId,
        date: new Date().toISOString().split('T')[0],
        metrics: {}
      });

    if (error) {
      console.warn('⚠️ [PLAN_WORKFLOW] Could not link consultation:', error);
      // Don't throw - this is not critical for meal plan generation
    }
  }

  /**
   * Retrieves generated meal plan by ID
   */
  private static async getMealPlanById(mealPlanId: string): Promise<ConsolidatedMealPlan> {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*, meal_plan_items(*)')
      .eq('id', mealPlanId)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar plano gerado: ${error.message}`);
    }

    // Transform to ConsolidatedMealPlan format
    const mealPlan: ConsolidatedMealPlan = {
      id: data.id,
      patient_id: data.patient_id,
      user_id: data.user_id,
      name: 'Plano Alimentar Brasileiro',
      description: 'Plano gerado com inteligência cultural brasileira',
      date: data.date,
      total_calories: data.total_calories,
      total_protein: data.total_protein,
      total_carbs: data.total_carbs,
      total_fats: data.total_fats,
      meals: this.transformMealsFromDB(data.meals, data.meal_plan_items || []),
      created_at: data.created_at,
      updated_at: data.updated_at,
      notes: data.notes,
      targets: {
        calories: data.total_calories,
        protein: data.total_protein,
        carbs: data.total_carbs,
        fats: data.total_fats
      }
    };

    return mealPlan;
  }

  /**
   * Transforms database meals JSON to ConsolidatedMealPlan format
   */
  private static transformMealsFromDB(mealsJson: any, mealPlanItems: any[]): any[] {
    if (Array.isArray(mealsJson)) {
      return mealsJson.map((meal: any) => ({
        id: meal.id,
        name: meal.name,
        type: meal.type,
        time: meal.time || '',
        total_calories: meal.total_calories || 0,
        total_protein: meal.total_protein || 0,
        total_carbs: meal.total_carbs || 0,
        total_fats: meal.total_fats || 0,
        items: Array.isArray(meal.foods) ? meal.foods.map((food: any) => ({
          id: food.id,
          food_id: food.food_id,
          food_name: food.name,
          quantity: food.quantity,
          unit: food.unit,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fats: food.fats
        })) : []
      }));
    }

    // Fallback: group meal_plan_items by meal_type
    if (!Array.isArray(mealPlanItems)) {
      return [];
    }

    const mealGroups = mealPlanItems.reduce((groups: Record<string, any[]>, item: any) => {
      const mealType = item.meal_type || 'other';
      if (!groups[mealType]) {
        groups[mealType] = [];
      }
      groups[mealType].push(item);
      return groups;
    }, {} as Record<string, any[]>);

    return Object.entries(mealGroups).map(([type, items]: [string, any[]]) => ({
      id: `meal-${type}`,
      name: this.getMealDisplayName(type),
      type,
      time: '',
      total_calories: items.reduce((sum: number, item: any) => sum + (item.calories || 0), 0),
      total_protein: items.reduce((sum: number, item: any) => sum + (item.protein || 0), 0),
      total_carbs: items.reduce((sum: number, item: any) => sum + (item.carbs || 0), 0),
      total_fats: items.reduce((sum: number, item: any) => sum + (item.fats || 0), 0),
      items: items.map((item: any) => ({
        id: item.id,
        food_id: item.food_id,
        food_name: item.food_name,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats
      }))
    }));
  }

  /**
   * Gets display name for meal type
   */
  private static getMealDisplayName(type: string): string {
    const mealNames: Record<string, string> = {
      'cafe_da_manha': 'Café da manhã',
      'lanche_manha': 'Lanche da manhã', 
      'almoco': 'Almoço',
      'lanche_tarde': 'Lanche da tarde',
      'jantar': 'Jantar',
      'ceia': 'Ceia',
      'breakfast': 'Café da manhã',
      'morning_snack': 'Lanche da manhã',
      'lunch': 'Almoço', 
      'afternoon_snack': 'Lanche da tarde',
      'dinner': 'Jantar',
      'evening_snack': 'Ceia'
    };
    
    return mealNames[type] || type;
  }
}