
import { calculateMacrosByProfile, validateMacroDistribution, estimateProfileFromBMI, calculateBMI } from '@/utils/macronutrientCalculations';

describe('Macronutrient Calculation Tests', () => {
  // Test the Jorge Silva case from the spec
  it('calculates macros correctly for obese patient', () => {
    // Jorge Silva, 169kg, Sobrepeso/Obesidade profile, VET=2322 kcal
    const result = calculateMacrosByProfile('sobrepeso_obesidade', 169, 2322);
    
    // Protein should be 2.0 g/kg = 338g = 1352 kcal = ~58.2%
    expect(result.protein.grams).toBe(338); 
    expect(result.protein.kcal).toBe(1352);
    expect(result.protein.percentage).toBe(58);
    
    // Lipids should be 0.5 g/kg = 84.5g = 760.5 kcal = ~32.7%
    expect(result.fat.grams).toBe(85); // Rounded from 84.5
    expect(result.fat.kcal).toBe(765); // Rounded from 760.5
    expect(result.fat.percentage).toBe(33);
    
    // Carbs should be remaining calories = 2322 - (1352 + 760.5) = 209.5 kcal = 52.4g = ~9%
    expect(result.carbs.grams).toBe(51); // Rounded from 52.4
    expect(result.carbs.kcal).toBe(204); // Rounded from 209.5
    expect(result.carbs.percentage).toBe(9);
    
    // Verify total percentages add up to 100%
    expect(result.protein.percentage + result.carbs.percentage + result.fat.percentage).toBe(100);
  });
  
  it('calculates macros correctly for normal weight patient', () => {
    // 70kg patient with normal weight profile, VET=2000 kcal
    const result = calculateMacrosByProfile('eutrofico', 70, 2000);
    
    // Protein should be 1.2 g/kg
    expect(result.protein.grams).toBe(84); // 70kg * 1.2g/kg = 84g
    expect(result.protein.kcal).toBe(336); // 84g * 4 kcal/g = 336 kcal
    
    // Lipids should be 0.8 g/kg
    expect(result.fat.grams).toBe(56); // 70kg * 0.8g/kg = 56g
    expect(result.fat.kcal).toBe(504); // 56g * 9 kcal/g = 504 kcal
    
    // Carbs should be remaining calories
    const expectedCarbsKcal = 2000 - (336 + 504); // 1160 kcal
    const expectedCarbsGrams = Math.round(expectedCarbsKcal / 4); // 290g
    
    expect(result.carbs.grams).toBe(expectedCarbsGrams);
    expect(result.carbs.kcal).toBe(expectedCarbsGrams * 4);
    
    // Verify total percentages add up to 100%
    expect(result.protein.percentage + result.carbs.percentage + result.fat.percentage).toBe(100);
  });
  
  it('calculates macros correctly for athlete', () => {
    // 80kg athlete, VET=3000 kcal 
    const result = calculateMacrosByProfile('atleta', 80, 3000);
    
    // Protein should be 1.8 g/kg
    expect(result.protein.grams).toBe(144); // 80kg * 1.8g/kg = 144g
    expect(result.protein.kcal).toBe(576); // 144g * 4 kcal/g = 576 kcal
    
    // Lipids should be 1.0 g/kg
    expect(result.fat.grams).toBe(80); // 80kg * 1.0g/kg = 80g
    expect(result.fat.kcal).toBe(720); // 80g * 9 kcal/g = 720 kcal
    
    // Verify total kcal adds up to VET
    const totalKcal = result.protein.kcal + result.carbs.kcal + result.fat.kcal;
    expect(Math.abs(totalKcal - 3000)).toBeLessThanOrEqual(5); // Allow for small rounding errors
  });
  
  it('validates macro distribution correctly', () => {
    // Valid distribution that adds up to VET
    expect(validateMacroDistribution(500, 1000, 500, 2000)).toBe(true);
    
    // Invalid distribution with too much difference
    expect(validateMacroDistribution(500, 1000, 700, 2000)).toBe(false);
  });
  
  it('estimates profile from BMI correctly', () => {
    // BMI < 25 should be eutrofico
    expect(estimateProfileFromBMI(23)).toBe('eutrofico');
    
    // BMI >= 25 should be sobrepeso_obesidade
    expect(estimateProfileFromBMI(28)).toBe('sobrepeso_obesidade');
    expect(estimateProfileFromBMI(35)).toBe('sobrepeso_obesidade');
  });
  
  it('calculates BMI correctly', () => {
    // BMI = weight (kg) / (height (m))^2
    expect(calculateBMI(70, 170)).toBe(24.2); // 70 / (1.7^2) = 24.22
    expect(calculateBMI(90, 180)).toBe(27.8); // 90 / (1.8^2) = 27.78
  });
});
