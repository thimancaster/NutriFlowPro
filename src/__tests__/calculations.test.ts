
import { describe, it, expect } from 'vitest';
import { 
  calculateTMB, 
  calculateGET, 
  calculateVET, 
  calculateMacros, 
  calculateCompleteNutrition,
  Profile,
  Gender,
  Objective 
} from '@/utils/calculations/core';

describe('Sistema de Cálculos Nutricionais', () => {
  describe('calculateTMB', () => {
    it('deve calcular TMB para perfil eutróficos usando Harris-Benedict', () => {
      // Mulher eutróficas: 655 + (9.6 * peso) + (1.8 * altura) - (4.7 * idade)
      const tmbMulher = calculateTMB('eutrofico', 'F', 60, 165, 25);
      const esperado = 655 + (9.6 * 60) + (1.8 * 165) - (4.7 * 25);
      expect(tmbMulher).toBeCloseTo(esperado, 1);

      // Homem eutróficos: 66 + (13.7 * peso) + (5 * altura) - (6.8 * idade)
      const tmbHomem = calculateTMB('eutrofico', 'M', 70, 175, 30);
      const esperadoHomem = 66 + (13.7 * 70) + (5 * 175) - (6.8 * 30);
      expect(tmbHomem).toBeCloseTo(esperadoHomem, 1);
    });

    it('deve calcular TMB para sobrepeso/obesidade usando Mifflin-St Jeor', () => {
      // Mulher: (10 * peso) + (6.25 * altura) - (5 * idade) - 161
      const tmbMulher = calculateTMB('sobrepeso_obesidade', 'F', 80, 160, 35);
      const esperado = (10 * 80) + (6.25 * 160) - (5 * 35) - 161;
      expect(tmbMulher).toBeCloseTo(esperado, 1);

      // Homem: (10 * peso) + (6.25 * altura) - (5 * idade) + 5
      const tmbHomem = calculateTMB('sobrepeso_obesidade', 'M', 90, 180, 40);
      const esperadoHomem = (10 * 90) + (6.25 * 180) - (5 * 40) + 5;
      expect(tmbHomem).toBeCloseTo(esperadoHomem, 1);
    });

    it('deve calcular TMB para atletas usando fórmula específica', () => {
      // TMB = 22 * peso
      const tmb = calculateTMB('atleta', 'M', 75, 180, 25);
      expect(tmb).toBe(22 * 75);
    });

    it('deve lançar erro para valores inválidos', () => {
      expect(() => calculateTMB('eutrofico', 'M', 0, 175, 25)).toThrow('Peso deve ser maior que zero');
      expect(() => calculateTMB('eutrofico', 'M', 70, 0, 25)).toThrow('Altura deve ser maior que zero');
      expect(() => calculateTMB('eutrofico', 'M', 70, 175, 0)).toThrow('Idade deve ser maior que zero');
    });
  });

  describe('calculateGET', () => {
    it('deve calcular GET corretamente', () => {
      const tmb = 1500;
      const fatorAtividade = 1.55;
      const get = calculateGET(tmb, fatorAtividade);
      expect(get).toBe(tmb * fatorAtividade);
    });

    it('deve lançar erro para valores inválidos', () => {
      expect(() => calculateGET(0, 1.5)).toThrow('TMB deve ser maior que zero');
      expect(() => calculateGET(1500, 0)).toThrow('Fator de atividade deve ser maior que zero');
    });
  });

  describe('calculateVET', () => {
    const get = 2000;

    it('deve calcular VET para hipertrofia (superávit)', () => {
      const vet = calculateVET(get, 'hipertrofia', 300);
      expect(vet).toBe(get + 300);
    });

    it('deve calcular VET para emagrecimento (déficit)', () => {
      const vet = calculateVET(get, 'emagrecimento', 400);
      expect(vet).toBe(get - 400);
    });

    it('deve calcular VET para manutenção (sem ajuste)', () => {
      const vet = calculateVET(get, 'manutencao', 100);
      expect(vet).toBe(get);
    });
  });

  describe('calculateMacros', () => {
    it('deve calcular macronutrientes corretamente', () => {
      const vet = 2000;
      const peso = 70;
      const proteinPerKg = 1.6;
      const lipidPerKg = 0.8;

      const macros = calculateMacros(vet, peso, proteinPerKg, lipidPerKg);

      // Proteína: 1.6 * 70 = 112g = 448 kcal
      expect(macros.protein.grams).toBeCloseTo(112, 1);
      expect(macros.protein.kcal).toBeCloseTo(448, 1);

      // Lipídio: 0.8 * 70 = 56g = 504 kcal
      expect(macros.fats.grams).toBeCloseTo(56, 1);
      expect(macros.fats.kcal).toBeCloseTo(504, 1);

      // Carboidrato: (2000 - 448 - 504) / 4 = 262g = 1048 kcal
      expect(macros.carbs.grams).toBeCloseTo(262, 1);
      expect(macros.carbs.kcal).toBeCloseTo(1048, 1);

      // Percentuais
      expect(macros.protein.percentage).toBeCloseTo(22.4, 1);
      expect(macros.fats.percentage).toBeCloseTo(25.2, 1);
      expect(macros.carbs.percentage).toBeCloseTo(52.4, 1);
    });
  });

  describe('calculateCompleteNutrition', () => {
    it('deve executar cálculo completo para mulher eutróficas', () => {
      const inputs = {
        weight: 60,
        height: 165,
        age: 25,
        gender: 'F' as Gender,
        profile: 'eutrofico' as Profile,
        activityFactor: 1.55,
        objective: 'manutencao' as Objective,
        calorieAdjustment: 0,
        proteinPerKg: 1.6,
        lipidPerKg: 0.8
      };

      const result = calculateCompleteNutrition(inputs);

      // Verificar que todos os valores foram calculados
      expect(result.tmb).toBeGreaterThan(0);
      expect(result.get).toBeGreaterThan(result.tmb);
      expect(result.vet).toBeGreaterThan(0);
      expect(result.totalCalories).toBe(result.vet);
      expect(result.macros.protein.grams).toBeGreaterThan(0);
      expect(result.macros.carbs.grams).toBeGreaterThan(0);
      expect(result.macros.fats.grams).toBeGreaterThan(0);
    });

    it('deve aplicar ajuste calórico para hipertrofia', () => {
      const inputs = {
        weight: 70,
        height: 175,
        age: 25,
        gender: 'M' as Gender,
        profile: 'eutrofico' as Profile,
        activityFactor: 1.55,
        objective: 'hipertrofia' as Objective,
        calorieAdjustment: 300,
        proteinPerKg: 2.0,
        lipidPerKg: 1.0
      };

      const result = calculateCompleteNutrition(inputs);

      expect(result.vet).toBe(result.get + 300);
      expect(result.totalCalories).toBe(result.vet);
    });

    it('deve aplicar déficit calórico para emagrecimento', () => {
      const inputs = {
        weight: 80,
        height: 170,
        age: 35,
        gender: 'F' as Gender,
        profile: 'sobrepeso_obesidade' as Profile,
        activityFactor: 1.375,
        objective: 'emagrecimento' as Objective,
        calorieAdjustment: 400,
        proteinPerKg: 1.8,
        lipidPerKg: 0.6
      };

      const result = calculateCompleteNutrition(inputs);

      expect(result.vet).toBe(result.get - 400);
      expect(result.totalCalories).toBe(result.vet);
    });
  });
});
