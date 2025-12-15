/**
 * MEAL PLAN TEMPLATE SERVICE
 * Serviço para salvar, carregar e aplicar templates de planos alimentares
 */

import { supabase } from '@/integrations/supabase/client';

export interface MealTemplateItem {
  alimento_id: string;
  alimento_nome: string;
  quantidade: number;
  medida_utilizada: string;
  peso_total_g: number;
  kcal: number;
  ptn_g: number;
  cho_g: number;
  lip_g: number;
}

export interface MealTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  meal_type: string;
  items: MealTemplateItem[];
  total_kcal: number;
  total_ptn_g: number;
  total_cho_g: number;
  total_lip_g: number;
  tags: string[];
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateParams {
  name: string;
  description?: string;
  meal_type: string;
  items: MealTemplateItem[];
  tags?: string[];
  is_public?: boolean;
}

export interface TemplateSearchParams {
  query?: string;
  meal_type?: string;
  tags?: string[];
  include_public?: boolean;
  limit?: number;
}

export class TemplateService {
  /**
   * Cria um novo template de refeição
   */
  static async createTemplate(
    userId: string,
    params: CreateTemplateParams
  ): Promise<MealTemplate | null> {
    try {
      // Calcular totais
      const totals = params.items.reduce(
        (acc, item) => ({
          kcal: acc.kcal + (item.kcal || 0),
          ptn: acc.ptn + (item.ptn_g || 0),
          cho: acc.cho + (item.cho_g || 0),
          lip: acc.lip + (item.lip_g || 0),
        }),
        { kcal: 0, ptn: 0, cho: 0, lip: 0 }
      );

      const { data, error } = await supabase
        .from('meal_templates')
        .insert({
          user_id: userId,
          name: params.name,
          description: params.description || null,
          meal_type: params.meal_type,
          items: params.items as any,
          total_kcal: Math.round(totals.kcal),
          total_ptn_g: Math.round(totals.ptn * 10) / 10,
          total_cho_g: Math.round(totals.cho * 10) / 10,
          total_lip_g: Math.round(totals.lip * 10) / 10,
          tags: params.tags || [],
          is_public: params.is_public ?? false,
          usage_count: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('[TemplateService] Erro ao criar template:', error);
        return null;
      }

      return data as unknown as MealTemplate;
    } catch (error) {
      console.error('[TemplateService] Erro inesperado:', error);
      return null;
    }
  }

  /**
   * Busca templates do usuário
   */
  static async getUserTemplates(
    userId: string,
    params?: TemplateSearchParams
  ): Promise<MealTemplate[]> {
    try {
      let query = supabase
        .from('meal_templates')
        .select('*')
        .eq('user_id', userId)
        .order('usage_count', { ascending: false });

      if (params?.meal_type) {
        query = query.eq('meal_type', params.meal_type);
      }

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[TemplateService] Erro ao buscar templates:', error);
        return [];
      }

      return (data as unknown as MealTemplate[]) || [];
    } catch (error) {
      console.error('[TemplateService] Erro inesperado:', error);
      return [];
    }
  }

  /**
   * Busca templates públicos
   */
  static async getPublicTemplates(
    params?: TemplateSearchParams
  ): Promise<MealTemplate[]> {
    try {
      let query = supabase
        .from('meal_templates')
        .select('*')
        .eq('is_public', true)
        .order('usage_count', { ascending: false });

      if (params?.meal_type) {
        query = query.eq('meal_type', params.meal_type);
      }

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[TemplateService] Erro ao buscar templates públicos:', error);
        return [];
      }

      return (data as unknown as MealTemplate[]) || [];
    } catch (error) {
      console.error('[TemplateService] Erro inesperado:', error);
      return [];
    }
  }

  /**
   * Busca template por ID
   */
  static async getTemplateById(templateId: string): Promise<MealTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('meal_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) {
        console.error('[TemplateService] Erro ao buscar template:', error);
        return null;
      }

      return data as unknown as MealTemplate;
    } catch (error) {
      console.error('[TemplateService] Erro inesperado:', error);
      return null;
    }
  }

  /**
   * Incrementa contador de uso do template
   */
  static async incrementUsageCount(templateId: string): Promise<void> {
    try {
      const { data: current } = await supabase
        .from('meal_templates')
        .select('usage_count')
        .eq('id', templateId)
        .single();

      if (current) {
        await supabase
          .from('meal_templates')
          .update({ 
            usage_count: (current.usage_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', templateId);
      }
    } catch (error) {
      console.error('[TemplateService] Erro ao incrementar uso:', error);
    }
  }

  /**
   * Atualiza um template existente
   */
  static async updateTemplate(
    templateId: string,
    userId: string,
    params: Partial<CreateTemplateParams>
  ): Promise<MealTemplate | null> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (params.name) updateData.name = params.name;
      if (params.description !== undefined) updateData.description = params.description;
      if (params.meal_type) updateData.meal_type = params.meal_type;
      if (params.tags) updateData.tags = params.tags;
      if (params.is_public !== undefined) updateData.is_public = params.is_public;

      if (params.items) {
        updateData.items = params.items;
        const totals = params.items.reduce(
          (acc, item) => ({
            kcal: acc.kcal + (item.kcal || 0),
            ptn: acc.ptn + (item.ptn_g || 0),
            cho: acc.cho + (item.cho_g || 0),
            lip: acc.lip + (item.lip_g || 0),
          }),
          { kcal: 0, ptn: 0, cho: 0, lip: 0 }
        );
        updateData.total_kcal = Math.round(totals.kcal);
        updateData.total_ptn_g = Math.round(totals.ptn * 10) / 10;
        updateData.total_cho_g = Math.round(totals.cho * 10) / 10;
        updateData.total_lip_g = Math.round(totals.lip * 10) / 10;
      }

      const { data, error } = await supabase
        .from('meal_templates')
        .update(updateData)
        .eq('id', templateId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('[TemplateService] Erro ao atualizar template:', error);
        return null;
      }

      return data as unknown as MealTemplate;
    } catch (error) {
      console.error('[TemplateService] Erro inesperado:', error);
      return null;
    }
  }

  /**
   * Deleta um template
   */
  static async deleteTemplate(templateId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('meal_templates')
        .delete()
        .eq('id', templateId)
        .eq('user_id', userId);

      if (error) {
        console.error('[TemplateService] Erro ao deletar template:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[TemplateService] Erro inesperado:', error);
      return false;
    }
  }

  /**
   * Busca templates sugeridos baseados nos targets nutricionais
   */
  static async getSuggestedTemplates(
    userId: string,
    targets: { kcal: number; ptn_g: number; cho_g: number; lip_g: number },
    mealType?: string
  ): Promise<MealTemplate[]> {
    try {
      // Buscar templates do usuário e públicos
      const [userTemplates, publicTemplates] = await Promise.all([
        this.getUserTemplates(userId, { meal_type: mealType, limit: 10 }),
        this.getPublicTemplates({ meal_type: mealType, limit: 10 }),
      ]);

      // Combinar e ordenar por proximidade aos targets
      const allTemplates = [...userTemplates, ...publicTemplates];
      
      // Remover duplicatas (mesmo ID)
      const uniqueTemplates = allTemplates.filter(
        (template, index, self) =>
          index === self.findIndex((t) => t.id === template.id)
      );

      // Calcular score de compatibilidade
      const scoredTemplates = uniqueTemplates.map((template) => {
        const kcalDiff = Math.abs(template.total_kcal - targets.kcal) / targets.kcal;
        const ptnDiff = Math.abs(template.total_ptn_g - targets.ptn_g) / targets.ptn_g;
        const choDiff = Math.abs(template.total_cho_g - targets.cho_g) / targets.cho_g;
        const lipDiff = Math.abs(template.total_lip_g - targets.lip_g) / targets.lip_g;
        
        // Score: quanto menor, melhor (mais próximo dos targets)
        const score = (kcalDiff + ptnDiff + choDiff + lipDiff) / 4;
        
        return { ...template, compatibilityScore: score };
      });

      // Ordenar por score (mais compatíveis primeiro)
      return scoredTemplates
        .sort((a, b) => a.compatibilityScore - b.compatibilityScore)
        .slice(0, 5);
    } catch (error) {
      console.error('[TemplateService] Erro ao buscar sugestões:', error);
      return [];
    }
  }
}
