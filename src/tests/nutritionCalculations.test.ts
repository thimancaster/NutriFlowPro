
import { 
  calculateTMB, 
  calculateGET, 
  calculateVET,
  calculateIMC,
  calculateRCQ
} from '../utils/nutritionCalculations';
import { calculateMacros, mapProfileToCalculation } from '../utils/nutrition/macroCalculations';

describe('TMB Calculations for Eutrofico Profile', () => {
  it('calculates correctly for women', () => {
    const result = calculateTMB(60, 165, 30, 'F', mapProfileToCalculation('eutrofico'));
    expect(result.tmb).toBeCloseTo(1378.5, 0);
  });

  it('calculates correctly for men', () => {
    const result = calculateTMB(70, 175, 30, 'M', mapProfileToCalculation('eutrofico'));
    expect(result.tmb).toBeCloseTo(1697, 0);
  });
});

describe('TMB Calculations for Sobrepeso/Obesidade Profile', () => {
  it('calculates correctly for women', () => {
    const result = calculateTMB(80, 165, 30, 'F', mapProfileToCalculation('sobrepeso_obesidade'));
    expect(result.tmb).toBeCloseTo(1281.25, 0);
  });

  it('calculates correctly for men', () => {
    const result = calculateTMB(90, 175, 30, 'M', mapProfileToCalculation('sobrepeso_obesidade'));
    expect(result.tmb).toBeCloseTo(1781.25, 0);
  });
});

describe('GET Calculations', () => {
  it('calculates correctly with various activity factors for eutrofico', () => {
    const tmb = 1500;
    expect(calculateGET(tmb, 'leve', mapProfileToCalculation('eutrofico'))).toBeCloseTo(2062.5);
    expect(calculateGET(tmb, 'moderado', mapProfileToCalculation('eutrofico'))).toBeCloseTo(2325);
    expect(calculateGET(tmb, 'intenso', mapProfileToCalculation('eutrofico'))).toBeCloseTo(2587.5);
  });

  it('handles factors for sobrepeso_obesidade correctly', () => {
    const tmb = 1500;
    expect(calculateGET(tmb, 'leve', mapProfileToCalculation('sobrepeso_obesidade'))).toBeCloseTo(2062.5);
    expect(calculateGET(tmb, 'moderado', mapProfileToCalculation('sobrepeso_obesidade'))).toBeCloseTo(2325);
  });
});

describe('VET Calculations', () => {
  it('calculates VET correctly for weight loss', () => {
    const get = 2000;
    const result = calculateVET(get, 'moderado', 'emagrecimento', mapProfileToCalculation('eutrofico'));
    expect(result.vet).toBeCloseTo(1600, 0); // 20% déficit
  });

  it('calculates VET correctly for muscle gain', () => {
    const get = 2000;
    const result = calculateVET(get, 'moderado', 'hipertrofia', mapProfileToCalculation('eutrofico'));
    expect(result.vet).toBeCloseTo(2300, 0); // 15% superávit
  });

  it('calculates VET correctly for maintenance', () => {
    const get = 2000;
    const result = calculateVET(get, 'moderado', 'manutenção', mapProfileToCalculation('eutrofico'));
    expect(result.vet).toBe(2000);
  });
});

describe('Macros Calculations', () => {
  it('calculates maintenance macros correctly for eutrofico', () => {
    const macros = calculateMacros(2000, 70, 'manutenção', 'magro');
    expect(macros.protein.grams).toBeGreaterThan(0);
    expect(macros.fat.grams).toBeGreaterThan(0);
    expect(macros.carbs.grams).toBeGreaterThan(0);
  });

  it('calculates weight loss macros correctly for sobrepeso_obesidade', () => {
    const macros = calculateMacros(1800, 80, 'emagrecimento', 'obeso');
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
