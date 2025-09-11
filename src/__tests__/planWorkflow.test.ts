/**
 * Tests for Plan Workflow Service
 */
import { describe, it, expect, vi } from 'vitest';
import { normalizeCalculationStatus, normalizeGender, sanitizeCalculationData } from '@/utils/calculationValidation';

describe('Plan Workflow Validation', () => {
  
  describe('normalizeCalculationStatus', () => {
    it('should normalize status values correctly', () => {
      expect(normalizeCalculationStatus('completo')).toBe('concluida');
      expect(normalizeCalculationStatus('completed')).toBe('concluida');
      expect(normalizeCalculationStatus('finalizado')).toBe('concluida');
      expect(normalizeCalculationStatus('cancelada')).toBe('cancelada');
      expect(normalizeCalculationStatus('canceled')).toBe('cancelada');
      expect(normalizeCalculationStatus('pending')).toBe('em_andamento');
      expect(normalizeCalculationStatus('draft')).toBe('em_andamento');
      expect(normalizeCalculationStatus('')).toBe('em_andamento');
      expect(normalizeCalculationStatus(undefined)).toBe('em_andamento');
    });
  });

  describe('normalizeGender', () => {
    it('should normalize gender values correctly', () => {
      expect(normalizeGender('male')).toBe('M');
      expect(normalizeGender('masculino')).toBe('M');
      expect(normalizeGender('M')).toBe('M');
      expect(normalizeGender('female')).toBe('F');
      expect(normalizeGender('feminino')).toBe('F');
      expect(normalizeGender('F')).toBe('F');
      expect(normalizeGender('other')).toBe('M');
      expect(normalizeGender('')).toBe('M');
      expect(normalizeGender(undefined)).toBe('M');
    });
  });

  describe('sanitizeCalculationData', () => {
    it('should sanitize calculation data for database insertion', () => {
      const rawData = {
        patient_id: '123',
        user_id: '456',
        status: 'completed',
        gender: 'male',
        weight: '70',
        height: '175',
        age: '30',
        bmr: '1800.5',
        tdee: '2200.7',
        protein: '110.2',
        carbs: '275.8',
        fats: '73.3'
      };

      const sanitized = sanitizeCalculationData(rawData);

      expect(sanitized.status).toBe('concluida');
      expect(sanitized.gender).toBe('M');
      expect(sanitized.weight).toBe(70);
      expect(sanitized.height).toBe(175);
      expect(sanitized.age).toBe(30);
      expect(sanitized.bmr).toBe(1800.5);
      expect(sanitized.tdee).toBe(2200.7);
      expect(sanitized.protein).toBe(110.2);
      expect(sanitized.carbs).toBe(275.8);
      expect(sanitized.fats).toBe(73.3);
    });
  });

});