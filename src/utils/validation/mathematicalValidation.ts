
/**
 * Mathematical formula validation
 * Phase 2: Ensuring calculation accuracy
 */

import { StrictCalculationInputs } from '@/types/strict';

export class MathematicalValidator {
  /**
   * Validate Harris-Benedict formula implementation
   */
  static validateHarrisBenedict(inputs: StrictCalculationInputs): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const { weight, height, age, sex } = inputs;
    
    // Range validations based on scientific literature
    if (weight < 20 || weight > 300) {
      errors.push('Peso deve estar entre 20kg e 300kg');
    }
    
    if (height < 100 || height > 250) {
      errors.push('Altura deve estar entre 100cm e 250cm');
    }
    
    if (age < 10 || age > 100) {
      errors.push('Idade deve estar entre 10 e 100 anos');
    }
    
    // Calculate TMB and validate against expected ranges
    const tmb = this.calculateTMB(weight, height, age, sex);
    const expectedMin = weight * 15; // Minimum reasonable TMB
    const expectedMax = weight * 35; // Maximum reasonable TMB
    
    if (tmb < expectedMin || tmb > expectedMax) {
      errors.push(`TMB calculado (${tmb.toFixed(0)}) está fora da faixa esperada para o peso`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate TMB using Harris-Benedict Revised
   */
  private static calculateTMB(weight: number, height: number, age: number, sex: 'M' | 'F'): number {
    if (sex === 'M') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  }

  /**
   * Validate macro distribution
   */
  static validateMacroDistribution(protein: number, carbs: number, fat: number, totalCalories: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const proteinCal = protein * 4;
    const carbsCal = carbs * 4;
    const fatCal = fat * 9;
    const calculatedTotal = proteinCal + carbsCal + fatCal;
    
    const tolerance = totalCalories * 0.05; // 5% tolerance
    
    if (Math.abs(calculatedTotal - totalCalories) > tolerance) {
      errors.push(`Soma dos macronutrientes (${calculatedTotal.toFixed(0)} kcal) não confere com total (${totalCalories.toFixed(0)} kcal)`);
    }
    
    // Validate macro percentages
    const proteinPct = (proteinCal / totalCalories) * 100;
    const carbsPct = (carbsCal / totalCalories) * 100;
    const fatPct = (fatCal / totalCalories) * 100;
    
    if (proteinPct < 10 || proteinPct > 35) {
      errors.push(`Proteína (${proteinPct.toFixed(1)}%) deve estar entre 10-35%`);
    }
    
    if (carbsPct < 20 || carbsPct > 65) {
      errors.push(`Carboidratos (${carbsPct.toFixed(1)}%) deve estar entre 20-65%`);
    }
    
    if (fatPct < 15 || fatPct > 35) {
      errors.push(`Gordura (${fatPct.toFixed(1)}%) deve estar entre 15-35%`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate activity factors
   */
  static validateActivityFactor(level: string, factor: number): boolean {
    const validFactors: Record<string, number> = {
      'sedentario': 1.2,
      'leve': 1.375,
      'moderado': 1.55,
      'intenso': 1.725,
      'muito_intenso': 1.9
    };
    
    return validFactors[level] === factor;
  }
}
