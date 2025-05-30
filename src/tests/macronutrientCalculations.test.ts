
import { calculateMacrosByProfile } from '../utils/macronutrientCalculations';
import { Profile } from '../types/consultation';

describe('Macronutrient Calculations', () => {
  const testCases: { profile: Profile; weight: number; vet: number }[] = [
    { profile: 'eutrofico', weight: 70, vet: 2000 },
    { profile: 'sobrepeso_obesidade', weight: 80, vet: 1800 },
    { profile: 'atleta', weight: 75, vet: 2500 },
  ];

  testCases.forEach(({ profile, weight, vet }) => {
    it(`should calculate macros correctly for ${profile} profile`, () => {
      const result = calculateMacrosByProfile(profile, weight, vet, 'manutenção');
      
      expect(result).toHaveProperty('protein');
      expect(result).toHaveProperty('carbs');
      expect(result).toHaveProperty('fat');
      expect(result).toHaveProperty('proteinPerKg');
      
      expect(result.protein.grams).toBeGreaterThan(0);
      expect(result.carbs.grams).toBeGreaterThanOrEqual(0);
      expect(result.fat.grams).toBeGreaterThan(0);
      
      // Test that percentages add up to approximately 100%
      const totalPercentage = result.protein.percentage + result.carbs.percentage + result.fat.percentage;
      expect(totalPercentage).toBeCloseTo(100, 0);
    });
  });

  it('should throw error for invalid inputs', () => {
    expect(() => calculateMacrosByProfile('eutrofico', 0, 2000, 'manutenção')).toThrow();
    expect(() => calculateMacrosByProfile('eutrofico', 70, 0, 'manutenção')).toThrow();
    expect(() => calculateMacrosByProfile('eutrofico', -10, 2000, 'manutenção')).toThrow();
  });
});
