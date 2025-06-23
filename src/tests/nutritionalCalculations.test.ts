
import { describe, it, expect } from 'vitest';
import { validateNutritionalConstants, validateMacroDistribution } from '@/utils/validation/nutritionalConstants';
import { calculateMacros } from '@/utils/nutrition/macroCalculations';
import { calculateTMB } from '@/utils/nutrition/tmbCalculations';
import { calculateGET } from '@/utils/nutrition/getCalculations';

describe('Nutritional Calculations', () => {
  describe('Constants Validation', () => {
    it('should validate nutritional constants', () => {
      const result = validateNutritionalConstants();
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate macro distribution', () => {
      const result = validateMacroDistribution(20, 50, 30);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid macro distribution', () => {
      const result = validateMacroDistribution(20, 50, 25); // Total = 95%
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('TMB Calculations', () => {
    it('should calculate TMB correctly for men', () => {
      const result = calculateTMB(80, 180, 30, 'M', 'eutrofico');
      expect(result.tmb).toBeGreaterThan(1500);
      expect(result.tmb).toBeLessThan(2500);
      expect(result.formula).toContain('Harris-Benedict');
    });

    it('should calculate TMB correctly for women', () => {
      const result = calculateTMB(60, 165, 25, 'F', 'eutrofico');
      expect(result.tmb).toBeGreaterThan(1200);
      expect(result.tmb).toBeLessThan(2000);
      expect(result.formula).toContain('Harris-Benedict');
    });
  });

  describe('GET Calculations', () => {
    it('should calculate GET with activity factors', () => {
      const tmb = 1800;
      const get = calculateGET(tmb, 'moderado', 'eutrofico');
      expect(get).toBe(Math.round(tmb * 1.55));
    });

    it('should handle different activity levels', () => {
      const tmb = 1800;
      const sedentary = calculateGET(tmb, 'sedentario', 'eutrofico');
      const intense = calculateGET(tmb, 'intenso', 'eutrofico');
      
      expect(sedentary).toBeLessThan(intense);
      expect(sedentary).toBe(Math.round(tmb * 1.2));
      expect(intense).toBe(Math.round(tmb * 1.725));
    });
  });

  describe('Macro Calculations', () => {
    it('should calculate macros for eutrofico profile', () => {
      const result = calculateMacros(2000, 70, 'manutenção', 'eutrofico');
      
      expect(result.protein.grams).toBeGreaterThan(0);
      expect(result.carbs.grams).toBeGreaterThan(0);
      expect(result.fat.grams).toBeGreaterThan(0);
      
      // Validate total calories match
      const totalCalories = 
        result.protein.grams * 4 + 
        result.carbs.grams * 4 + 
        result.fat.grams * 9;
      expect(Math.abs(totalCalories - 2000)).toBeLessThan(50);
    });

    it('should calculate higher protein for sobrepeso_obesidade', () => {
      const eutrofico = calculateMacros(2000, 70, 'manutenção', 'eutrofico');
      const sobrepeso = calculateMacros(2000, 70, 'manutenção', 'sobrepeso_obesidade');
      
      expect(sobrepeso.protein.grams).toBeGreaterThan(eutrofico.protein.grams);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very low calories', () => {
      const result = calculateMacros(800, 50, 'emagrecimento', 'eutrofico');
      expect(result.carbs.grams).toBeGreaterThanOrEqual(0);
    });

    it('should handle extreme weights', () => {
      expect(() => calculateTMB(300, 180, 30, 'M', 'eutrofico')).not.toThrow();
      expect(() => calculateTMB(40, 180, 30, 'M', 'eutrofico')).not.toThrow();
    });
  });
});
