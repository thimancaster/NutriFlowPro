/**
 * OFFICIAL FORMULA VALIDATION TESTS
 * Ensures all formulas match the official spreadsheet specification exactly
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTMB_HarrisBenedict,
  calculateTMB_Official,
  calculateGET_Official,
  calculateVET_Official,
  calculateMacros_Official,
  calculateComplete_Official,
  validateMealDistribution,
  ACTIVITY_FACTORS,
  CALORIC_VALUES
} from '@/utils/nutrition/official/formulas';

describe('Official TMB Calculations', () => {
  describe('Harris-Benedict Formula', () => {
    it('calculates TMB for men exactly as specified', () => {
      // Men: TMB = 66 + (13.7 × weight) + (5.0 × height) – (6.8 × age)
      // Example: 70kg, 175cm, 30 years
      const expected = 66 + (13.7 * 70) + (5.0 * 175) - (6.8 * 30);
      // = 66 + 959 + 875 - 204 = 1696
      
      const result = calculateTMB_HarrisBenedict(70, 175, 30, 'M');
      expect(result).toBe(1696);
    });

    it('calculates TMB for women exactly as specified', () => {
      // Women: TMB = 655 + (9.6 × weight) + (1.8 × height) – (4.7 × age)
      // Example: 60kg, 165cm, 25 years  
      const expected = 655 + (9.6 * 60) + (1.8 * 165) - (4.7 * 25);
      // = 655 + 576 + 297 - 117.5 = 1410.5
      
      const result = calculateTMB_HarrisBenedict(60, 165, 25, 'F');
      expect(result).toBe(1410.5);
    });
  });

  describe('Formula Selection', () => {
    it('selects Harris-Benedict for eutrophic profile', () => {
      const result = calculateTMB_Official(70, 175, 30, 'M', 'eutrofico');
      expect(result.formula).toBe('Harris-Benedict (Eutrophic)');
      expect(result.value).toBe(1696);
    });

    it('selects obesity equation for overweight profile', () => {
      const result = calculateTMB_Official(90, 175, 30, 'M', 'sobrepeso_obesidade');
      expect(result.formula).toBe('Obesity/Overweight Equation');
      // Mifflin-St Jeor: (10 * 90) + (6.25 * 175) - (5 * 30) + 5 = 1888.75
      expect(result.value).toBe(1889);
    });

    it('selects Tinsley equation for athlete profile', () => {
      const result = calculateTMB_Official(80, 180, 25, 'M', 'atleta');
      expect(result.formula).toBe('Tinsley (Athlete)');
      // Note: Exact Tinsley formula needs verification
    });
  });
});

describe('Activity Factor Application', () => {
  it('applies correct activity factors', () => {
    const tmb = 1700;
    
    expect(calculateGET_Official(tmb, 'sedentario')).toBe(Math.round(tmb * 1.2)); // 2040
    expect(calculateGET_Official(tmb, 'leve')).toBe(Math.round(tmb * 1.375)); // 2338
    expect(calculateGET_Official(tmb, 'moderado')).toBe(Math.round(tmb * 1.55)); // 2635
    expect(calculateGET_Official(tmb, 'intenso')).toBe(Math.round(tmb * 1.725)); // 2933
    expect(calculateGET_Official(tmb, 'muito_intenso')).toBe(Math.round(tmb * 1.9)); // 3230
  });

  it('matches exact activity factors from specification', () => {
    expect(ACTIVITY_FACTORS.sedentario).toBe(1.2);
    expect(ACTIVITY_FACTORS.leve).toBe(1.375);
    expect(ACTIVITY_FACTORS.moderado).toBe(1.55);
    expect(ACTIVITY_FACTORS.intenso).toBe(1.725);
    expect(ACTIVITY_FACTORS.muito_intenso).toBe(1.9);
  });
});

describe('Objective Adjustments (VET)', () => {
  it('applies no adjustment for maintenance', () => {
    const get = 2500;
    expect(calculateVET_Official(get, 'manutenção')).toBe(2500);
  });

  it('applies deficit for weight loss', () => {
    const get = 2500;
    expect(calculateVET_Official(get, 'emagrecimento')).toBe(2000); // -500 kcal
  });

  it('applies surplus for hypertrophy', () => {
    const get = 2500;
    expect(calculateVET_Official(get, 'hipertrofia')).toBe(2900); // +400 kcal
  });
});

describe('Manual Macro Calculations', () => {
  it('calculates macros with user inputs and automatic carbs', () => {
    const vet = 2000;
    const weight = 70;
    const macroInputs = { proteinPerKg: 1.6, fatPerKg: 1.0 };

    const result = calculateMacros_Official(vet, weight, macroInputs);

    // Protein: 70 * 1.6 = 112g = 448 kcal
    expect(result.protein.grams).toBe(112);
    expect(result.protein.kcal).toBe(448);

    // Fat: 70 * 1.0 = 70g = 630 kcal
    expect(result.fat.grams).toBe(70);
    expect(result.fat.kcal).toBe(630);

    // Carbs: (2000 - 448 - 630) / 4 = 230.5g = 922 kcal
    expect(result.carbs.grams).toBe(230.5);
    expect(result.carbs.kcal).toBe(922);

    // Verify total equals VET
    const totalKcal = result.protein.kcal + result.carbs.kcal + result.fat.kcal;
    expect(totalKcal).toBe(vet);
  });

  it('calculates correct percentages', () => {
    const vet = 2000;
    const weight = 80;
    const macroInputs = { proteinPerKg: 2.0, fatPerKg: 1.0 };

    const result = calculateMacros_Official(vet, weight, macroInputs);

    // Protein: 160g * 4 = 640 kcal = 32%
    expect(result.protein.percentage).toBe(32.0);

    // Fat: 80g * 9 = 720 kcal = 36%  
    expect(result.fat.percentage).toBe(36.0);

    // Carbs: 640 kcal = 32%
    expect(result.carbs.percentage).toBe(32.0);

    // Total should be 100%
    const totalPercent = result.protein.percentage + result.carbs.percentage + result.fat.percentage;
    expect(totalPercent).toBeCloseTo(100, 1);
  });

  it('handles edge case where carbs become negative', () => {
    const vet = 1200; // Low calories
    const weight = 100; // Heavy person
    const macroInputs = { proteinPerKg: 2.5, fatPerKg: 1.5 }; // High protein/fat

    const result = calculateMacros_Official(vet, weight, macroInputs);

    // Should not have negative carbs
    expect(result.carbs.grams).toBeGreaterThanOrEqual(0);
    expect(result.carbs.kcal).toBeGreaterThanOrEqual(0);
  });
});

describe('Meal Distribution Validation', () => {
  it('validates correct distribution (100%)', () => {
    const distribution = {
      breakfast: 25,
      lunch: 35,
      dinner: 25,
      snack: 15
    };

    const result = validateMealDistribution(distribution);
    expect(result.isValid).toBe(true);
    expect(result.total).toBe(100);
    expect(result.error).toBeUndefined();
  });

  it('catches incorrect distribution (not 100%)', () => {
    const distribution = {
      breakfast: 25,
      lunch: 35,
      dinner: 25,
      snack: 10 // Total = 95%
    };

    const result = validateMealDistribution(distribution);
    expect(result.isValid).toBe(false);
    expect(result.total).toBe(95);
    expect(result.error).toContain('must equal 100%');
  });

  it('allows tiny floating point errors', () => {
    const distribution = {
      breakfast: 25.00001,
      lunch: 35,
      dinner: 25,
      snack: 14.99999 // Effectively 100%
    };

    const result = validateMealDistribution(distribution);
    expect(result.isValid).toBe(true);
  });
});

describe('Complete Calculation Pipeline', () => {
  it('follows exact specification order: TMB → FA → GET → VET → Macros', () => {
    const inputs = {
      weight: 70,
      height: 175,
      age: 30,
      gender: 'M' as const,
      profile: 'eutrofico' as const,
      activityLevel: 'moderado' as const,
      objective: 'manutenção' as const,
      macroInputs: { proteinPerKg: 1.6, fatPerKg: 1.0 }
    };

    const result = calculateComplete_Official(inputs);

    // Verify calculation order
    expect(result.calculationOrder).toHaveLength(4);
    expect(result.calculationOrder[0]).toContain('TMB calculated');
    expect(result.calculationOrder[1]).toContain('GET = TMB × Activity Factor');
    expect(result.calculationOrder[2]).toContain('VET = GET with objective');
    expect(result.calculationOrder[3]).toContain('Carbs by difference');

    // Verify values
    expect(result.tmb.value).toBe(1696); // Harris-Benedict
    expect(result.get).toBe(Math.round(1696 * 1.55)); // 2629
    expect(result.vet).toBe(result.get); // Maintenance = no adjustment
    
    // Verify macro consistency
    const totalMacroKcal = result.macros.protein.kcal + result.macros.carbs.kcal + result.macros.fat.kcal;
    expect(Math.abs(totalMacroKcal - result.vet)).toBeLessThan(1);
  });

  it('validates input parameters', () => {
    const invalidInputs = {
      weight: 0, // Invalid
      height: 175,
      age: 30,
      gender: 'M' as const,
      profile: 'eutrofico' as const,
      activityLevel: 'moderado' as const,
      objective: 'manutenção' as const,
      macroInputs: { proteinPerKg: 1.6, fatPerKg: 1.0 }
    };

    expect(() => calculateComplete_Official(invalidInputs)).toThrow('Weight, height, and age must be greater than zero');
  });

  it('validates macro inputs', () => {
    const invalidMacroInputs = {
      weight: 70,
      height: 175,
      age: 30,
      gender: 'M' as const,
      profile: 'eutrofico' as const,
      activityLevel: 'moderado' as const,
      objective: 'manutenção' as const,
      macroInputs: { proteinPerKg: 0, fatPerKg: 1.0 } // Invalid protein
    };

    expect(() => calculateComplete_Official(invalidMacroInputs)).toThrow('Protein and fat per kg must be greater than zero');
  });
});

describe('Caloric Values Consistency', () => {
  it('uses correct caloric values per gram', () => {
    expect(CALORIC_VALUES.protein).toBe(4);
    expect(CALORIC_VALUES.carbs).toBe(4);
    expect(CALORIC_VALUES.fat).toBe(9);
  });
});