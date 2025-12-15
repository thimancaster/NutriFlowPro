/**
 * HOOK: useMealPlanTemplates
 * Gerencia templates de planos alimentares
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  TemplateService, 
  MealTemplate, 
  CreateTemplateParams,
  MealTemplateItem 
} from '@/services/mealPlan/TemplateService';

interface UseMealPlanTemplatesOptions {
  mealType?: string;
  autoFetch?: boolean;
}

export const useMealPlanTemplates = (options: UseMealPlanTemplatesOptions = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<MealTemplate | null>(null);

  // Query: Buscar templates do usuário
  const {
    data: userTemplates = [],
    isLoading: isLoadingTemplates,
    refetch: refetchTemplates,
  } = useQuery({
    queryKey: ['meal-templates', user?.id, options.mealType],
    queryFn: () => 
      user?.id 
        ? TemplateService.getUserTemplates(user.id, { meal_type: options.mealType })
        : Promise.resolve([]),
    enabled: !!user?.id && (options.autoFetch !== false),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Query: Buscar templates públicos
  const {
    data: publicTemplates = [],
    isLoading: isLoadingPublic,
  } = useQuery({
    queryKey: ['meal-templates-public', options.mealType],
    queryFn: () => 
      TemplateService.getPublicTemplates({ meal_type: options.mealType, limit: 20 }),
    enabled: options.autoFetch !== false,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // Mutation: Criar template
  const createTemplateMutation = useMutation({
    mutationFn: (params: CreateTemplateParams) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      return TemplateService.createTemplate(user.id, params);
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['meal-templates'] });
        toast({
          title: 'Template salvo',
          description: `Template "${data.name}" criado com sucesso!`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao salvar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation: Atualizar template
  const updateTemplateMutation = useMutation({
    mutationFn: ({ templateId, params }: { templateId: string; params: Partial<CreateTemplateParams> }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      return TemplateService.updateTemplate(templateId, user.id, params);
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['meal-templates'] });
        toast({
          title: 'Template atualizado',
          description: `Template "${data.name}" atualizado com sucesso!`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation: Deletar template
  const deleteTemplateMutation = useMutation({
    mutationFn: (templateId: string) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      return TemplateService.deleteTemplate(templateId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-templates'] });
      toast({
        title: 'Template excluído',
        description: 'Template removido com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Criar template a partir de uma refeição
  const saveAsTemplate = useCallback(
    async (
      name: string,
      mealType: string,
      items: MealTemplateItem[],
      description?: string,
      tags?: string[]
    ) => {
      return createTemplateMutation.mutateAsync({
        name,
        meal_type: mealType,
        items,
        description,
        tags,
        is_public: false,
      });
    },
    [createTemplateMutation]
  );

  // Aplicar template (incrementa uso)
  const applyTemplate = useCallback(
    async (template: MealTemplate): Promise<MealTemplateItem[]> => {
      // Incrementar contador de uso
      await TemplateService.incrementUsageCount(template.id);
      
      // Invalidar cache para atualizar contagem
      queryClient.invalidateQueries({ queryKey: ['meal-templates'] });
      
      // Retornar os itens do template para serem adicionados
      return template.items as unknown as MealTemplateItem[];
    },
    [queryClient]
  );

  // Buscar sugestões baseadas em targets
  const getSuggestions = useCallback(
    async (targets: { kcal: number; ptn_g: number; cho_g: number; lip_g: number }, mealType?: string) => {
      if (!user?.id) return [];
      return TemplateService.getSuggestedTemplates(user.id, targets, mealType);
    },
    [user?.id]
  );

  return {
    // Data
    userTemplates,
    publicTemplates,
    allTemplates: [...userTemplates, ...publicTemplates.filter(
      pt => !userTemplates.find(ut => ut.id === pt.id)
    )],
    selectedTemplate,
    
    // Loading states
    isLoading: isLoadingTemplates || isLoadingPublic,
    isCreating: createTemplateMutation.isPending,
    isUpdating: updateTemplateMutation.isPending,
    isDeleting: deleteTemplateMutation.isPending,
    
    // Actions
    setSelectedTemplate,
    saveAsTemplate,
    applyTemplate,
    getSuggestions,
    refetchTemplates,
    
    // Mutations
    createTemplate: createTemplateMutation.mutate,
    updateTemplate: updateTemplateMutation.mutate,
    deleteTemplate: deleteTemplateMutation.mutate,
  };
};

export type { MealTemplate, MealTemplateItem, CreateTemplateParams };
