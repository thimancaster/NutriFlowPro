
import { 
  calculateTMB, 
  calculateGET, 
  calculateVET,
  calculateIMC,
  calculateRCQ
} from '../utils/nutritionCalculations';
import { calculateMacros } from '../utils/nutrition/macroCalculations';

describe('TMB Calculations for Eutrofico Profile', () => {
  it('calculates correctly for women', () => {
    const result = calculateTMB(60, 165, 30, 'F');
    expect(result).toBeCloseTo(1378.5, 0);
  });

  it('calculates correctly for men', () => {
    const result = calculateTMB(70, 175, 30, 'M');
    expect(result).toBeCloseTo(1697, 0);
  });
});

describe('TMB Calculations for Obeso Profile', () => {
  it('calculates correctly for women', () => {
    const result = calculateTMB(80, 165, 30, 'F');
    expect(result).toBeCloseTo(1281.25, 0);
  });

  it('calculates correctly for men', () => {
    const result = calculateTMB(90, 175, 30, 'M');
    expect(result).toBeCloseTo(1781.25, 0);
  });
});

describe('GET Calculations', () => {
  it('calculates correctly with various activity factors', () => {
    const tmb = 1500;
    expect(calculateGET(tmb, 'leve')).toBeCloseTo(2062.5);
    expect(calculateGET(tmb, 'moderado')).toBeCloseTo(2325);
    expect(calculateGET(tmb, 'intenso')).toBeCloseTo(2587.5);
  });

  it('handles factors correctly', () => {
    const tmb = 1500;
    expect(calculateGET(tmb, 'leve')).toBeCloseTo(2062.5);
    expect(calculateGET(tmb, 'moderado')).toBeCloseTo(2325);
  });
});

describe('VET Calculations', () => {
  it('calculates VET correctly for weight loss', () => {
    const get = 2000;
    const result = calculateVET(get, 'emagrecimento');
    expect(result).toBeCloseTo(1500, 0);
  });

  it('calculates VET correctly for muscle gain', () => {
    const get = 2000;
    const result = calculateVET(get, 'hipertrofia');
    expect(result).toBeCloseTo(2400, 0);
  });

  it('calculates VET correctly for maintenance', () => {
    const get = 2000;
    const result = calculateVET(get, 'manutenção');
    expect(result).toBe(2000);
  });
});

describe('Macros Calculations', () => {
  it('calculates maintenance macros correctly for eutrofico profile', () => {
    const macros = calculateMacros(2000, 70, 'manutenção', 'eutrofico');
    expect(macros.protein.grams).toBeGreaterThan(0);
    expect(macros.fat.grams).toBeGreaterThan(0);
    expect(macros.carbs.grams).toBeGreaterThan(0);
  });

  it('calculates weight loss macros correctly for obeso profile', () => {
    const macros = calculateMacros(1800, 80, 'emagrecimento', 'sobrepeso_obesidade');
    expect(macros.protein.grams).toBeGreaterThan(0);
    expect(macros.fat.grams).toBeGreaterThan(0);
    expect(macros.carbs.grams).toBeGreaterThan(0);
  });

  it('calculates athlete macros correctly', () => {
    const macros = calculateMacros(2500, 75, 'manutenção', 'atleta');
    expect(macros.protein.grams).toBeGreaterThan(0);
    expect(macros.fat.grams).toBeGreaterThan(0);
    expect(macros.carbs.grams).toBeGreaterThan(0);
  });
});

describe('Anthropometry Calculations', () => {
  it('calculates IMC correctly', () => {
    expect(calculateIMC(70, 175)).toBeCloseTo(22.9);
  });

  it('calculates RCQ correctly', () => {
    expect(calculateRCQ(80, 100)).toBe(0.8);
  });
});
