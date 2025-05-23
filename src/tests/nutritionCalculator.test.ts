
import {
  calculateBMR,
  calculateTDEE,
  calculateVET,
  calculateMacrosByProfile,
  calculateBMI,
  calculateRCQ,
  calculateBodyFat,
  calculateLeanMass,
  performNutritionCalculation
} from '@/utils/nutritionCalculator';
import { ActivityLevel, Objective, Profile } from '@/types/nutrition';

describe('Nutrition Calculator', () => {
  // Sample test data
  const maleData = {
    weight: 80,
    height: 180,
    age: 30,
    gender: 'M' as const
  };

  const femaleData = {
    weight: 65,
    height: 165,
    age: 30,
    gender: 'F' as const
  };

  describe('calculateBMR', () => {
    it('should calculate BMR correctly for males', () => {
      const bmr = calculateBMR(maleData);
      // Mifflin-St Jeor formula for men: (10 * 80) + (6.25 * 180) - (5 * 30) + 5 = 1855
      expect(bmr).toBe(1855);
    });

    it('should calculate BMR correctly for females', () => {
      const bmr = calculateBMR(femaleData);
      // Mifflin-St Jeor formula for women: (10 * 65) + (6.25 * 165) - (5 * 30) - 161 = 1381.25 ≈ 1381
      expect(bmr).toBe(1381);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => calculateBMR({ ...maleData, weight: -10 })).toThrow();
      expect(() => calculateBMR({ ...maleData, height: 0 })).toThrow();
      expect(() => calculateBMR({ ...maleData, age: 130 })).toThrow();
    });
  });

  describe('calculateTDEE', () => {
    it('should calculate TDEE correctly for different activity levels', () => {
      // BMR = 1855, activityFactor = 1.2
      expect(calculateTDEE(1855, 'sedentario')).toBe(2226);
      
      // BMR = 1855, activityFactor = 1.55
      expect(calculateTDEE(1855, 'moderado')).toBe(2875);
      
      // BMR = 1855, activityFactor = 1.9
      expect(calculateTDEE(1855, 'muito_intenso')).toBe(3525);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => calculateTDEE(-100, 'moderado')).toThrow();
      expect(() => calculateTDEE(1855, 'invalid' as ActivityLevel)).toThrow();
    });
  });

  describe('calculateVET', () => {
    it('should apply correct adjustment based on objective', () => {
      // TDEE = 2875
      // Maintenance: no adjustment
      expect(calculateVET(2875, 'manutenção')).toEqual({
        vet: 2875,
        adjustment: 0
      });
      
      // Weight loss: 20% deficit
      expect(calculateVET(2875, 'emagrecimento')).toEqual({
        vet: 2300, // 2875 * 0.8 = 2300
        adjustment: -575
      });
      
      // Muscle gain: 15% surplus
      expect(calculateVET(2875, 'hipertrofia')).toEqual({
        vet: 3306, // 2875 * 1.15 = 3306.25 ≈ 3306
        adjustment: 431
      });
    });

    it('should use custom calories when provided', () => {
      expect(calculateVET(2875, 'manutenção', 3000)).toEqual({
        vet: 3000,
        adjustment: 125
      });
    });

    it('should throw error for invalid inputs', () => {
      expect(() => calculateVET(0, 'manutenção')).toThrow();
    });
  });

  describe('calculateMacrosByProfile', () => {
    it('should calculate macros correctly for different profiles', () => {
      // Normal profile, weight = 80kg, vet = 2875
      const normalResult = calculateMacrosByProfile('normal', 80, 2875);
      
      // Protein: 80 * 1.8 = 144g, 144 * 4 = 576 kcal
      expect(normalResult.protein.grams).toBe(144);
      expect(normalResult.protein.kcal).toBe(576);
      
      // Fat: 80 * 0.8 = 64g, 64 * 9 = 576 kcal
      expect(normalResult.fat.grams).toBe(64);
      expect(normalResult.fat.kcal).toBe(576);
      
      // Remaining for carbs: 2875 - 576 - 576 = 1723 kcal
      // Carbs: 1723 / 4 = 430.75 ≈ 431g
      expect(normalResult.carbs.grams).toBe(431);
      expect(normalResult.carbs.kcal).toBe(1724);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => calculateMacrosByProfile('normal', -1, 2000)).toThrow();
      expect(() => calculateMacrosByProfile('normal', 80, 0)).toThrow();
      expect(() => calculateMacrosByProfile('invalid' as Profile, 80, 2000)).toThrow();
    });
  });

  describe('Other calculations', () => {
    it('should calculate BMI correctly', () => {
      // BMI = weight (kg) / height (m)²
      // 80 / (1.8 * 1.8) = 80 / 3.24 = 24.69
      expect(calculateBMI(80, 180)).toBe(24.7);
      
      // Should work with height in meters too
      expect(calculateBMI(80, 1.8)).toBe(24.7);
    });

    it('should calculate RCQ correctly', () => {
      // RCQ = waist / hip
      expect(calculateRCQ(90, 100)).toBe(0.9);
    });

    it('should calculate body fat percentage', () => {
      expect(calculateBodyFat('M', 30, 90, 100, 40)).toBeTruthy();
      expect(calculateBodyFat('F', 30, 80, 100, 35)).toBeTruthy();
    });

    it('should calculate lean mass correctly', () => {
      // Lean mass = weight * (1 - body fat percentage / 100)
      // 80 * (1 - 20/100) = 80 * 0.8 = 64
      expect(calculateLeanMass(80, 20)).toBe(64);
    });
  });

  describe('performNutritionCalculation', () => {
    it('should perform complete nutrition calculation', () => {
      const result = performNutritionCalculation(
        maleData,
        'moderado',
        'manutenção',
        'normal'
      );
      
      expect(result.bmr).toBe(1855);
      expect(result.tdee).toBe(2875);
      expect(result.vet).toBe(2875);
      expect(result.macros.protein.grams).toBe(144);
    });
  });
});
