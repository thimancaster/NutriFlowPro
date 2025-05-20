
import { describe, it, expect } from 'vitest';
import { calculateMacrosByProfile, mapLegacyProfile } from '@/utils/macronutrientCalculations';

// Simple tests for macronutrient calculations
describe('Macronutrient Calculations', () => {
  it('calculates macros correctly for normal profile', () => {
    const result = calculateMacrosByProfile('normal', 70, 2000);
    
    expect(result.protein.grams).toBeGreaterThan(0);
    expect(result.carbs.grams).toBeGreaterThan(0);
    expect(result.fat.grams).toBeGreaterThan(0);
    expect(result.proteinPerKg).toBe(1.8);
  });

  it('maps legacy profile values correctly', () => {
    expect(mapLegacyProfile('magro')).toBe('magro');
    expect(mapLegacyProfile('normal')).toBe('normal');
    expect(mapLegacyProfile('OBESO')).toBe('obeso');
  });
});
