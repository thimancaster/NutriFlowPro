/**
 * PATIENT EVOLUTION SERVICE
 * Serviço dedicado para gerenciamento de métricas de evolução do paciente
 * FASE 3 - Sistema de Métricas Históricas
 */

import { supabase } from '@/integrations/supabase/client';

export interface EvolutionMetrics {
  id?: string;
  patient_id: string;
  user_id: string;
  calculation_id?: string | null;
  consultation_id?: string | null;
  
  // Métricas de Composição Corporal
  weight: number;
  height?: number | null;
  bmi?: number | null;
  body_fat_percentage?: number | null;
  lean_mass_percentage?: number | null;
  muscle_mass_kg?: number | null;
  water_percentage?: number | null;
  
  // Circunferências
  waist_circumference?: number | null;
  hip_circumference?: number | null;
  arm_circumference?: number | null;
  thigh_circumference?: number | null;
  
  // Métricas Nutricionais
  vet?: number | null;
  tmb?: number | null;
  get_value?: number | null;
  protein_target_g?: number | null;
  carbs_target_g?: number | null;
  fat_target_g?: number | null;
  
  // Metadados
  measurement_date: string;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEvolutionMetrics extends Omit<EvolutionMetrics, 'id' | 'created_at' | 'updated_at'> {}

export const patientEvolutionService = {
  /**
   * Salva novas métricas de evolução
   */
  async saveMetrics(data: CreateEvolutionMetrics): Promise<EvolutionMetrics> {
    console.log('💾 Evolution Service: Salvando métricas...', data);

    const { data: metrics, error } = await supabase
      .from('patient_evolution_metrics')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('❌ Evolution Service: Erro ao salvar métricas', error);
      throw error;
    }

    console.log('✅ Evolution Service: Métricas salvas com sucesso');
    return metrics;
  },

  /**
   * Busca métricas de evolução de um paciente
   */
  async getPatientEvolution(
    patientId: string, 
    options?: {
      period?: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'all';
      limit?: number;
    }
  ): Promise<EvolutionMetrics[]> {
    console.log('📊 Evolution Service: Buscando evolução do paciente...', patientId);

    let query = supabase
      .from('patient_evolution_metrics')
      .select('*')
      .eq('patient_id', patientId)
      .order('measurement_date', { ascending: false });

    // Aplicar filtro de período
    if (options?.period && options.period !== 'all') {
      const daysMap = {
        last_7_days: 7,
        last_30_days: 30,
        last_90_days: 90
      };
      const days = daysMap[options.period];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      query = query.gte('measurement_date', cutoffDate.toISOString().split('T')[0]);
    }

    // Aplicar limite
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Evolution Service: Erro ao buscar evolução', error);
      throw error;
    }

    console.log(`✅ Evolution Service: ${data?.length || 0} registros encontrados`);
    return data || [];
  },

  /**
   * Busca as métricas mais recentes de um paciente
   */
  async getLatestMetrics(patientId: string): Promise<EvolutionMetrics | null> {
    console.log('🎯 Evolution Service: Buscando métricas mais recentes...', patientId);

    const { data, error } = await supabase
      .from('patient_evolution_metrics')
      .select('*')
      .eq('patient_id', patientId)
      .order('measurement_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('❌ Evolution Service: Erro ao buscar métricas', error);
      throw error;
    }

    return data;
  },

  /**
   * Vincula métricas a um cálculo específico
   */
  async linkToCalculation(metricsId: string, calculationId: string): Promise<void> {
    console.log('🔗 Evolution Service: Vinculando métricas ao cálculo...', { metricsId, calculationId });

    const { error } = await supabase
      .from('patient_evolution_metrics')
      .update({ calculation_id: calculationId })
      .eq('id', metricsId);

    if (error) {
      console.error('❌ Evolution Service: Erro ao vincular métricas', error);
      throw error;
    }

    console.log('✅ Evolution Service: Métricas vinculadas com sucesso');
  },

  /**
   * Vincula métricas a uma consulta específica
   */
  async linkToConsultation(metricsId: string, consultationId: string): Promise<void> {
    console.log('🔗 Evolution Service: Vinculando métricas à consulta...', { metricsId, consultationId });

    const { error } = await supabase
      .from('patient_evolution_metrics')
      .update({ consultation_id: consultationId })
      .eq('id', metricsId);

    if (error) {
      console.error('❌ Evolution Service: Erro ao vincular métricas', error);
      throw error;
    }

    console.log('✅ Evolution Service: Métricas vinculadas à consulta');
  },

  /**
   * Atualiza métricas existentes
   */
  async updateMetrics(id: string, updates: Partial<EvolutionMetrics>): Promise<EvolutionMetrics> {
    console.log('✏️ Evolution Service: Atualizando métricas...', { id, updates });

    const { data, error } = await supabase
      .from('patient_evolution_metrics')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Evolution Service: Erro ao atualizar métricas', error);
      throw error;
    }

    console.log('✅ Evolution Service: Métricas atualizadas com sucesso');
    return data;
  },

  /**
   * Deleta métricas específicas
   */
  async deleteMetrics(id: string): Promise<void> {
    console.log('🗑️ Evolution Service: Deletando métricas...', id);

    const { error } = await supabase
      .from('patient_evolution_metrics')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Evolution Service: Erro ao deletar métricas', error);
      throw error;
    }

    console.log('✅ Evolution Service: Métricas deletadas com sucesso');
  }
};
