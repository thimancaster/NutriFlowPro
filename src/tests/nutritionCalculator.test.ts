
import { 
  calculateTMB, 
  calculateGET, 
  calculateVET 
} from '../utils/nutritionCalculations';
import { calculateMacros, mapProfileToCalculation } from '../utils/nutrition/macroCalculations';

describe('Nutrition Calculator', () => {
  describe('TMB Calculation', () => {
    it('should calculate TMB correctly for male eutrofico', () => {
      const result = calculateTMB(70, 175, 30, 'M', mapProfileToCalculation('eutrofico'));
      expect(result.tmb).toBeCloseTo(1667.5, 1);
    });

    it('should calculate TMB correctly for female eutrofico', () => {
      const result = calculateTMB(60, 165, 25, 'F', mapProfileToCalculation('eutrofico'));
      expect(result.tmb).toBeCloseTo(1372.5, 1);
    });
  });

  describe('GET Calculation', () => {
    it('should calculate GET correctly for sedentary activity', () => {
      const tmb = 1667.5;
      const get = calculateGET(tmb, 'sedentario', mapProfileToCalculation('eutrofico'));
      expect(get).toBeCloseTo(2001, 0);
    });

    it('should calculate GET correctly for moderate activity', () => {
      const tmb = 1667.5;
      const get = calculateGET(tmb, 'moderado', mapProfileToCalculation('eutrofico'));
      expect(get).toBeCloseTo(2584.6, 1);
    });
  });

  describe('VET Calculation', () => {
    it('should calculate VET correctly for weight loss', () => {
      const get = 2000;
      const result = calculateVET(get, 'moderado', 'emagrecimento', mapProfileToCalculation('eutrofico'));
      expect(result.vet).toBeCloseTo(1600, 0);
    });

    it('should calculate VET correctly for muscle gain', () => {
      const get = 2000;
      const result = calculateVET(get, 'moderado', 'hipertrofia', mapProfileToCalculation('eutrofico'));
      expect(result.vet).toBeCloseTo(2300, 0);
    });

    it('should calculate VET correctly for maintenance', () => {
      const get = 2000;
      const result = calculateVET(get, 'moderado', 'manutenção', mapProfileToCalculation('eutrofico'));
      expect(result.vet).toBe(2000);
    });
  });

  describe('Macro Calculation by Profile', () => {
    it('should calculate macros for eutrofico profile', () => {
      const result = calculateMacros(2000, 70, 'manutenção', 'magro');
      
      expect(result.protein.grams).toBeGreaterThan(0);
      expect(result.fat.grams).toBeGreaterThan(0);
      expect(result.carbs.grams).toBeGreaterThan(0);
    });

    it('should calculate macros for sobrepeso_obesidade profile', () => {
      const result = calculateMacros(1800, 80, 'manutenção', 'obeso');
      
      expect(result.protein.grams).toBeGreaterThan(0);
      expect(result.fat.grams).toBeGreaterThan(0);
      expect(result.carbs.grams).toBeGreaterThan(0);
    });

    it('should calculate macros for atleta profile', () => {
      const result = calculateMacros(2500, 75, 'manutenção', 'atleta');
      
      expect(result.protein.grams).toBeGreaterThan(0);
      expect(result.fat.grams).toBeGreaterThan(0);
      expect(result.carbs.grams).toBeGreaterThan(0);
    });
  });
});
