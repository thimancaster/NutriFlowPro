import { describe, it, expect } from 'vitest';
import { 
  calculateBMR, 
  calculateTDEE, 
  applyObjectiveAdjustment,
  calculateMacros,
  calculateNutrition
} from '@/utils/nutritionCalculator';

describe('Nutrition Calculator Functions', () => {
  // BMR Tests
  describe('calculateBMR', () => {
    it('calculates correctly for male', () => {
      const result = calculateBMR(80, 180, 30, 'M');
      // Mifflin-St Jeor equation: 10*80 + 6.25*180 - 5*30 + 5 = 1855
      expect(result).toBeCloseTo(1855);
    });
    
    it('calculates correctly for female', () => {
      const result = calculateBMR(65, 165, 30, 'F');
      // Mifflin-St Jeor equation: 10*65 + 6.25*165 - 5*30 - 161 = 1381.25
      expect(result).toBeCloseTo(1381.25);
    });
    
    it('throws error for invalid inputs', () => {
      expect(() => calculateBMR(-10, 180, 30, 'M')).toThrow();
      expect(() => calculateBMR(80, -10, 30, 'M')).toThrow();
      expect(() => calculateBMR(80, 180, -10, 'M')).toThrow();
    });
  });
  
  // TDEE Tests
  describe('calculateTDEE', () => {
    it('applies correct activity factor for sedentary', () => {
      expect(calculateTDEE(2000, 'sedentario')).toBeCloseTo(2400); // 2000 * 1.2
    });
    
    it('applies correct activity factor for moderate', () => {
      expect(calculateTDEE(2000, 'moderado')).toBeCloseTo(3100); // 2000 * 1.55
    });
    
    it('applies correct activity factor for very active', () => {
      expect(calculateTDEE(2000, 'muito_intenso')).toBeCloseTo(3800); // 2000 * 1.9
    });
  });
  
  // Objective Adjustment Tests
  describe('applyObjectiveAdjustment', () => {
    it('applies no adjustment for maintenance', () => {
      expect(applyObjectiveAdjustment(2500, 'manutenção')).toBeCloseTo(2500);
    });
    
    it('applies deficit for weight loss', () => {
      expect(applyObjectiveAdjustment(2500, 'emagrecimento')).toBeCloseTo(2000); // 2500 * 0.8
    });
    
    it('applies surplus for muscle gain', () => {
      expect(applyObjectiveAdjustment(2500, 'hipertrofia')).toBeCloseTo(2875); // 2500 * 1.15
    });
    
    it('uses custom calories when provided', () => {
      expect(applyObjectiveAdjustment(2500, 'personalizado', 3000)).toBeCloseTo(3000);
    });
  });
  
  // Macros Calculation Tests
  describe('calculateMacros', () => {
    it('calculates macros correctly for normal profile', () => {
      const result = calculateMacros(70, 2500, 'normal');
      
      // Protein: 70 * 1.8 = 126g
      expect(result.protein).toBeCloseTo(126);
      
      // Fat: 70 * 0.8 = 56g
      expect(result.fat).toBeCloseTo(56);
      
      // Carbs: Remaining calories / 4
      // (2500 - (126*4) - (56*9)) / 4 = ~310g
      const proteinCals = 126 * 4;
      const fatCals = 56 * 9;
      const expectedCarbs = (2500 - proteinCals - fatCals) / 4;
      expect(result.carbs).toBeCloseTo(expectedCarbs);
    });
    
    it('calculates macros correctly for athletic profile', () => {
      const result = calculateMacros(70, 3000, 'atleta');
      
      // For athlete, protein ratio is higher (2.2g/kg)
      expect(result.protein).toBeGreaterThan(140); // 70 * 2.0 = 140g minimum
      
      // Total calories from macros should equal input calories
      const totalCalories = (result.protein * 4) + (result.carbs * 4) + (result.fat * 9);
      expect(totalCalories).toBeCloseTo(3000);
    });
  });
  
  // Full Calculation Pipeline Tests
  describe('calculateNutrition (integration)', () => {
    it('calculates full nutrition pipeline correctly', () => {
      const result = calculateNutrition(
        80, // weight in kg
        180, // height in cm
        30, // age
        'M', // sex
        'moderado', // activity level
        'manutenção', // objective
        'normal', // profile
      );
      
      // BMR for male: 10*80 + 6.25*180 - 5*30 + 5 = 1855
      expect(result.bmr).toBeCloseTo(1855);
      
      // TDEE: 1855 * 1.55 = 2875.25
      expect(result.tdee).toBeCloseTo(2875.25);
      
      // Adjusted TDEE for maintenance: same as TDEE
      expect(result.adjustedTDEE).toBeCloseTo(2875.25);
      
      // Protein for normal profile: 80 * 1.8 = 144g
      expect(result.macros.protein).toBeCloseTo(144);
    });
    
    it('calculates with custom VET correctly', () => {
      const result = calculateNutrition(
        70, // weight in kg
        170, // height in cm
        25, // age
        'F', // sex
        'leve', // activity level
        'personalizado', // objective
        'sobrepeso', // profile
        2200, // custom VET
      );
      
      // Should use custom VET instead of calculated one
      expect(result.adjustedTDEE).toBeCloseTo(2200);
      
      // Macros should be calculated based on custom VET
      const totalCalories = (result.macros.protein * 4) + (result.macros.carbs * 4) + (result.macros.fat * 9);
      expect(totalCalories).toBeCloseTo(2200);
    });
  });
});
