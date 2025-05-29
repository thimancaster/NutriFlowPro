
import { 
  calculateTMB, 
  calculateGET, 
  calculateVET,
  calculateMacrosByProfile,
  calculateIMC,
  calculateRCQ
} from '../utils/nutritionCalculations';

describe('TMB Calculations for Eutrófico Profile', () => {
  it('calculates correctly for women', () => {
    const tmb = calculateTMB(60, 165, 30, 'F', 'eutrofico');
    expect(tmb).toBeCloseTo(1378.5, 0);
  });

  it('calculates correctly for men', () => {
    const tmb = calculateTMB(70, 175, 30, 'M', 'eutrofico');
    expect(tmb).toBeCloseTo(1697, 0);
  });
});

describe('TMB Calculations for Sobrepeso/Obesidade Profile', () => {
  it('calculates correctly for women', () => {
    const tmb = calculateTMB(80, 165, 30, 'F', 'sobrepeso_obesidade');
    expect(tmb).toBeCloseTo(1281.25, 0);
  });

  it('calculates correctly for men', () => {
    const tmb = calculateTMB(90, 175, 30, 'M', 'sobrepeso_obesidade');
    expect(tmb).toBeCloseTo(1781.25, 0);
  });
});

describe('GET Calculations', () => {
  it('calculates correctly with various activity factors for eutrofico', () => {
    const tmb = 1500;
    expect(calculateGET(tmb, 'leve', 'eutrofico')).toBeCloseTo(2062.5);
    expect(calculateGET(tmb, 'moderado', 'eutrofico')).toBeCloseTo(2325);
    expect(calculateGET(tmb, 'intenso', 'eutrofico')).toBeCloseTo(2587.5);
  });

  it('handles factors for sobrepeso_obesidade correctly', () => {
    const tmb = 1500;
    expect(calculateGET(tmb, 'leve', 'sobrepeso_obesidade')).toBeCloseTo(2062.5);
    expect(calculateGET(tmb, 'moderado', 'sobrepeso_obesidade')).toBeCloseTo(2325);
  });
});

describe('VET Calculations', () => {
  it('calculates VET correctly for weight loss', () => {
    const get = 2000;
    const vet = calculateVET(get, 'emagrecimento');
    expect(vet).toBeCloseTo(1600, 0); // 20% déficit
  });

  it('calculates VET correctly for muscle gain', () => {
    const get = 2000;
    const vet = calculateVET(get, 'hipertrofia');
    expect(vet).toBeCloseTo(2300, 0); // 15% superávit
  });

  it('calculates VET correctly for maintenance', () => {
    const get = 2000;
    const vet = calculateVET(get, 'manutenção');
    expect(vet).toBe(2000);
  });
});

describe('Macros Calculations', () => {
  it('calculates maintenance macros correctly for eutrofico', () => {
    const macros = calculateMacrosByProfile('eutrofico', 70, 2000, 'manutenção');
    expect(macros.protein.grams).toBe(84); // 70 * 1.2
    expect(macros.fat.grams).toBe(56); // 70 * 0.8
    expect(macros.carbs.grams).toBeGreaterThan(0);
  });

  it('calculates weight loss macros correctly for sobrepeso', () => {
    const macros = calculateMacrosByProfile('sobrepeso_obesidade', 80, 1800, 'emagrecimento');
    expect(macros.protein.grams).toBe(160); // 80 * 2.0
    expect(macros.fat.grams).toBe(40); // 80 * 0.5
    expect(macros.carbs.grams).toBeGreaterThan(0);
  });

  it('calculates athlete macros correctly', () => {
    const macros = calculateMacrosByProfile('atleta', 75, 2500, 'manutenção');
    expect(macros.protein.grams).toBe(135); // 75 * 1.8
    expect(macros.fat.grams).toBe(75); // 75 * 1.0
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
