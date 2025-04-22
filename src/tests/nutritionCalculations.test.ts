
/**
 * Unit tests for nutrition calculation functions
 * 
 * Note: To run these tests, you would need to set up Vitest or Jest in your project
 */

import { 
  tmbMagrasMulheres, 
  tmbMagrosHomens, 
  tmbObesasMulheres, 
  tmbObesosHomens,
  calcGET,
  calculateMacros,
  validateInputs
} from '../utils/nutritionCalculations';

// Test TMB calculations for lean women
describe('tmbMagrasMulheres', () => {
  it('calculates correctly for normal values', () => {
    expect(tmbMagrasMulheres(60, 165, 30)).toBeCloseTo(1378.5);
  });

  it('handles edge cases', () => {
    expect(tmbMagrasMulheres(0, 165, 30)).toBeCloseTo(655 + (1.8 * 165) - (4.7 * 30));
    expect(tmbMagrasMulheres(60, 0, 30)).toBeCloseTo(655 + (9.6 * 60) - (4.7 * 30));
    expect(tmbMagrasMulheres(60, 165, 0)).toBeCloseTo(655 + (9.6 * 60) + (1.8 * 165));
  });
});

// Test TMB calculations for lean men
describe('tmbMagrosHomens', () => {
  it('calculates correctly for normal values', () => {
    expect(tmbMagrosHomens(70, 175, 30)).toBeCloseTo(1697);
  });

  it('handles edge cases', () => {
    expect(tmbMagrosHomens(0, 175, 30)).toBeCloseTo(66 + (5 * 175) - (6.8 * 30));
    expect(tmbMagrosHomens(70, 0, 30)).toBeCloseTo(66 + (13.7 * 70) - (6.8 * 30));
    expect(tmbMagrosHomens(70, 175, 0)).toBeCloseTo(66 + (13.7 * 70) + (5 * 175));
  });
});

// Test TMB calculations for obese women
describe('tmbObesasMulheres', () => {
  it('calculates correctly for normal values', () => {
    expect(tmbObesasMulheres(80, 165, 30)).toBeCloseTo(1281.25);
  });

  it('handles edge cases', () => {
    expect(tmbObesasMulheres(0, 165, 30)).toBeCloseTo((6.25 * 165) - (5 * 30) - 161);
    expect(tmbObesasMulheres(80, 0, 30)).toBeCloseTo((10 * 80) - (5 * 30) - 161);
    expect(tmbObesasMulheres(80, 165, 0)).toBeCloseTo((10 * 80) + (6.25 * 165) - 161);
  });
});

// Test TMB calculations for obese men
describe('tmbObesosHomens', () => {
  it('calculates correctly for normal values', () => {
    expect(tmbObesosHomens(90, 175, 30)).toBeCloseTo(1781.25);
  });

  it('handles edge cases', () => {
    expect(tmbObesosHomens(0, 175, 30)).toBeCloseTo((6.25 * 175) - (5 * 30) + 5);
    expect(tmbObesosHomens(90, 0, 30)).toBeCloseTo((10 * 90) - (5 * 30) + 5);
    expect(tmbObesosHomens(90, 175, 0)).toBeCloseTo((10 * 90) + (6.25 * 175) + 5);
  });
});

// Test GET calculations
describe('calcGET', () => {
  it('calculates correctly with various activity factors', () => {
    expect(calcGET(1500, 1.2)).toBeCloseTo(1800);
    expect(calcGET(1500, 1.55)).toBeCloseTo(2325);
    expect(calcGET(1500, 1.9)).toBeCloseTo(2850);
  });

  it('handles edge cases', () => {
    expect(calcGET(0, 1.2)).toBeCloseTo(0);
    expect(calcGET(1500, 0)).toBeCloseTo(0);
  });
});

// Test macros calculations
describe('calculateMacros', () => {
  it('calculates maintenance macros correctly', () => {
    const macros = calculateMacros(2000, 'manutenção');
    expect(macros.protein).toBe(150); // (2000 * 0.3) / 4 = 150
    expect(macros.carbs).toBe(200);   // (2000 * 0.4) / 4 = 200
    expect(macros.fat).toBe(67);      // (2000 * 0.3) / 9 ≈ 67
  });

  it('calculates weight loss macros correctly', () => {
    const macros = calculateMacros(2000, 'emagrecimento');
    expect(macros.protein).toBe(175); // (2000 * 0.35) / 4 = 175
    expect(macros.carbs).toBe(150);   // (2000 * 0.3) / 4 = 150
    expect(macros.fat).toBe(78);      // (2000 * 0.35) / 9 ≈ 78
  });

  it('calculates muscle gain macros correctly', () => {
    const macros = calculateMacros(2000, 'hipertrofia');
    expect(macros.protein).toBe(150); // (2000 * 0.3) / 4 = 150
    expect(macros.carbs).toBe(250);   // (2000 * 0.5) / 4 = 250
    expect(macros.fat).toBe(44);      // (2000 * 0.2) / 9 ≈ 44
  });
});

// Test input validation
describe('validateInputs', () => {
  it('returns true for valid inputs', () => {
    expect(validateInputs(70, 175, 30)).toBe(true);
  });

  it('returns false for invalid inputs', () => {
    expect(validateInputs(0, 175, 30)).toBe(false);
    expect(validateInputs(70, 0, 30)).toBe(false);
    expect(validateInputs(70, 175, 0)).toBe(false);
    expect(validateInputs(-5, 175, 30)).toBe(false);
  });
});
