
/**
 * TESTES PARA O MOTOR NUTRICIONAL CENTRALIZADO
 * 
 * Estes testes garantem que o motor está 100% fiel à planilha central.
 * Todos os valores esperados foram validados manualmente na planilha.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCompleteNutrition,
  calculateTMB,
  calculateGEA,
  calculateGET,
  calculateMacronutrients,
  validateInputs,
  PLANILHA_CONSTANTS
} from '@/utils/nutrition/centralMotor';

describe('Motor Nutricional Central - Fidelidade à Planilha', () => {
  
  describe('Fórmulas TMB - Valores Exatos da Planilha', () => {
    it('Harris-Benedict Homem - Deve calcular exatamente como planilha', () => {
      const result = calculateTMB(70, 175, 30, 'M', 'eutrofico');
      
      // Cálculo manual: 66.5 + (13.75 * 70) + (5.003 * 175) - (6.75 * 30)
      // = 66.5 + 962.5 + 875.525 - 202.5 = 1702.025 ≈ 1702
      expect(result.value).toBeCloseTo(1702, 0);
      expect(result.formula).toBe('harris_benedict');
    });

    it('Harris-Benedict Mulher - Deve calcular exatamente como planilha', () => {
      const result = calculateTMB(60, 165, 25, 'F', 'eutrofico');
      
      // Cálculo manual: 655.1 + (9.563 * 60) + (1.850 * 165) - (4.676 * 25)  
      // = 655.1 + 573.78 + 305.25 - 116.9 = 1417.23 ≈ 1417
      expect(result.value).toBeCloseTo(1417, 0);
      expect(result.formula).toBe('harris_benedict');
    });

    it('Mifflin-St Jeor Homem - Deve calcular exatamente como planilha', () => {
      const result = calculateTMB(90, 180, 40, 'M', 'obeso_sobrepeso');
      
      // Cálculo manual: (10 * 90) + (6.25 * 180) - (5 * 40) + 5
      // = 900 + 1125 - 200 + 5 = 1830
      expect(result.value).toBe(1830);
      expect(result.formula).toBe('mifflin_st_jeor');
    });

    it('Mifflin-St Jeor Mulher - Deve calcular exatamente como planilha', () => {
      const result = calculateTMB(80, 160, 35, 'F', 'obeso_sobrepeso');
      
      // Cálculo manual: (10 * 80) + (6.25 * 160) - (5 * 35) - 161
      // = 800 + 1000 - 175 - 161 = 1464
      expect(result.value).toBe(1464);
      expect(result.formula).toBe('mifflin_st_jeor');
    });
  });

  describe('Fatores de Atividade - Valores Exatos da Planilha', () => {
    it('Deve usar fatores exatos da planilha', () => {
      expect(PLANILHA_CONSTANTS.ACTIVITY_FACTORS.sedentario).toBe(1.2);
      expect(PLANILHA_CONSTANTS.ACTIVITY_FACTORS.leve).toBe(1.375);
      expect(PLANILHA_CONSTANTS.ACTIVITY_FACTORS.moderado).toBe(1.55);
      expect(PLANILHA_CONSTANTS.ACTIVITY_FACTORS.muito_ativo).toBe(1.725);
      expect(PLANILHA_CONSTANTS.ACTIVITY_FACTORS.extremamente_ativo).toBe(1.9);
    });

    it('GEA deve calcular corretamente com fatores da planilha', () => {
      const tmb = 1700;
      expect(calculateGEA(tmb, 'sedentario')).toBe(2040); // 1700 * 1.2
      expect(calculateGEA(tmb, 'moderado')).toBe(2635);   // 1700 * 1.55
    });
  });

  describe('Ajustes por Objetivo - Valores Exatos da Planilha', () => {
    it('Deve aplicar ajustes exatos da planilha', () => {
      const gea = 2000;
      
      expect(calculateGET(gea, 'manutencao')).toBe(2000);    // +0
      expect(calculateGET(gea, 'emagrecimento')).toBe(1500); // -500
      expect(calculateGET(gea, 'hipertrofia')).toBe(2400);   // +400
    });

    it('Deve aplicar mínimo de 1200 kcal para emagrecimento', () => {
      const gea = 1500; // GET seria 1000 (muito baixo)
      expect(calculateGET(gea, 'emagrecimento')).toBe(1200); // Mínimo aplicado
    });
  });

  describe('Macronutrientes - Cálculo Exato da Planilha', () => {
    it('Deve usar ratios de proteína exatos da planilha', () => {
      expect(PLANILHA_CONSTANTS.PROTEIN_RATIOS.eutrofico).toBe(1.8);
      expect(PLANILHA_CONSTANTS.PROTEIN_RATIOS.obeso_sobrepeso).toBe(2.0);
      expect(PLANILHA_CONSTANTS.PROTEIN_RATIOS.atleta).toBe(2.2);
    });

    it('Deve calcular macros por diferença conforme planilha - Eutrófico', () => {
      const get = 2400;
      const weight = 70;
      const macros = calculateMacronutrients(get, weight, 'eutrofico');

      // Proteína: 1.8 * 70 = 126g = 504 kcal
      expect(macros.protein.grams).toBe(126);
      expect(macros.protein.kcal).toBe(504);

      // Gordura: 25% * 2400 = 600 kcal = 66.7g
      expect(macros.fat.kcal).toBe(600);
      expect(macros.fat.grams).toBeCloseTo(66.7, 1);

      // Carboidrato: (2400 - 504 - 600) / 4 = 324g = 1296 kcal
      expect(macros.carbs.kcal).toBe(1296);
      expect(macros.carbs.grams).toBe(324);
    });

    it('Deve calcular percentuais corretos', () => {
      const get = 2000;
      const weight = 75;
      const macros = calculateMacronutrients(get, weight, 'atleta');

      // Proteína: 2.2 * 75 = 165g = 660 kcal = 33% do GET
      expect(macros.protein.percentage).toBeCloseTo(33, 0);
      
      // Gordura: 25% do GET
      expect(macros.fat.percentage).toBe(25);
      
      // Carboidrato: resto (42%)
      expect(macros.carbs.percentage).toBeCloseTo(42, 0);
    });
  });

  describe('Cálculo Completo - Casos Reais da Planilha', () => {
    it('Caso 1: Homem Eutrófico Hipertrofia - Validação completa', () => {
      const result = calculateCompleteNutrition({
        weight: 70,
        height: 175,
        age: 30,
        gender: 'M',
        profile: 'eutrofico',
        activityLevel: 'moderado',
        objective: 'hipertrofia'
      });

      // TMB Harris-Benedict
      expect(result.tmb.formula).toBe('harris_benedict');
      expect(result.tmb.value).toBeCloseTo(1702, 0);
      
      // GEA = TMB * 1.55
      expect(result.gea).toBeCloseTo(2638, 0);
      
      // GET = GEA + 400 (hipertrofia)
      expect(result.get).toBeCloseTo(3038, 0);
      
      // Proteína: 1.8 * 70 = 126g
      expect(result.macros.protein.grams).toBe(126);
      
      // Gordura: 25% do GET
      expect(result.macros.fat.percentage).toBe(25);
    });

    it('Caso 2: Mulher Obesa Emagrecimento - Validação completa', () => {
      const result = calculateCompleteNutrition({
        weight: 80,
        height: 160, 
        age: 35,
        gender: 'F',
        profile: 'obeso_sobrepeso',
        activityLevel: 'leve',
        objective: 'emagrecimento'
      });

      // TMB Mifflin-St Jeor
      expect(result.tmb.formula).toBe('mifflin_st_jeor');
      expect(result.tmb.value).toBe(1464);
      
      // GEA = TMB * 1.375
      expect(result.gea).toBeCloseTo(2013, 0);
      
      // GET = GEA - 500 (emagrecimento)
      expect(result.get).toBeCloseTo(1513, 0);
      
      // Proteína: 2.0 * 80 = 160g (perfil obeso)
      expect(result.macros.protein.grams).toBe(160);
    });
  });

  describe('Validação de Parâmetros', () => {
    it('Deve validar parâmetros obrigatórios', () => {
      const invalidInputs = {
        weight: 0,
        height: -1,
        age: 150,
        gender: 'M' as const,
        profile: 'invalid' as any,
        activityLevel: 'moderado' as const,
        objective: 'manutencao' as const
      };

      const validation = validateInputs(invalidInputs);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('Deve aceitar parâmetros válidos', () => {
      const validInputs = {
        weight: 70,
        height: 175,
        age: 30,
        gender: 'M' as const,
        profile: 'eutrofico' as const,
        activityLevel: 'moderado' as const,
        objective: 'manutencao' as const
      };

      const validation = validateInputs(validInputs);
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });
  });
});
