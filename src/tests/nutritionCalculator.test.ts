
import { 
  calculateTMB, 
  calculateGET, 
  calculateVET 
} from '../utils/nutritionCalculations';
import { calculateMacrosByProfile } from '../utils/macronutrientCalculations';

describe('Nutrition Calculator', () => {
  describe('TMB Calculation', () => {
    it('should calculate TMB correctly for male', () => {
      const tmb = calculateTMB(70, 175, 30, 'M');
      expect(tmb).toBeCloseTo(1667.5, 1);
    });

    it('should calculate TMB correctly for female', () => {
      const tmb = calculateTMB(60, 165, 25, 'F');
      expect(tmb).toBeCloseTo(1372.5, 1);
    });
  });

  describe('GET Calculation', () => {
    it('should calculate GET correctly for sedentary activity', () => {
      const tmb = 1667.5;
      const get = calculateGET(tmb, 'sedentario');
      expect(get).toBeCloseTo(2001, 0);
    });

    it('should calculate GET correctly for moderate activity', () => {
      const tmb = 1667.5;
      const get = calculateGET(tmb, 'moderado');
      expect(get).toBeCloseTo(2584.6, 1);
    });
  });

  describe('VET Calculation', () => {
    it('should calculate VET correctly for weight loss', () => {
      const get = 2000;
      const vet = calculateVET(get, 'emagrecimento');
      expect(vet).toBeCloseTo(1600, 0);
    });

    it('should calculate VET correctly for muscle gain', () => {
      const get = 2000;
      const vet = calculateVET(get, 'hipertrofia');
      expect(vet).toBeCloseTo(2300, 0);
    });

    it('should calculate VET correctly for maintenance', () => {
      const get = 2000;
      const vet = calculateVET(get, 'manutenção');
      expect(vet).toBe(2000);
    });
  });

  describe('Macro Calculation by Profile', () => {
    it('should calculate macros for eutrofico profile', () => {
      const result = calculateMacrosByProfile('eutrofico', 70, 2000);
      
      expect(result.protein.grams).toBe(98); // 70 * 1.4
      expect(result.fat.grams).toBe(70); // 70 * 1.0
      expect(result.carbs.grams).toBeGreaterThan(0);
    });

    it('should calculate macros for sobrepeso_obesidade profile', () => {
      const result = calculateMacrosByProfile('sobrepeso_obesidade', 80, 1800);
      
      expect(result.protein.grams).toBe(144); // 80 * 1.8
      expect(result.fat.grams).toBe(64); // 80 * 0.8
      expect(result.carbs.grams).toBeGreaterThan(0);
    });

    it('should calculate macros for atleta profile', () => {
      const result = calculateMacrosByProfile('atleta', 75, 2500);
      
      expect(result.protein.grams).toBe(150); // 75 * 2.0
      expect(result.fat.grams).toBe(90); // 75 * 1.2
      expect(result.carbs.grams).toBeGreaterThan(0);
    });
  });
});
