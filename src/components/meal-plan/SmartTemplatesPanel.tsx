/**
 * SMART TEMPLATES PANEL
 * Painel de templates salvos pelo usuário
 * Refatorado para usar TemplateService em vez do IntelligenceService obsoleto
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Lightbulb, LayoutTemplate } from 'lucide-react';
import { TemplateService, MealTemplate } from '@/services/mealPlan/TemplateService';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SmartTemplatesPanelProps {
  targets: { calories: number; protein: number; carbs: number; fats: number };
  onSelectTemplate?: (template: MealTemplate) => void;
  mealType?: string;
}

const SmartTemplatesPanel: React.FC<SmartTemplatesPanelProps> = ({
  targets,
  onSelectTemplate,
  mealType
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<MealTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTemplates = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Busca templates do usuário e públicos
      const [userTemplates, publicTemplates] = await Promise.all([
        TemplateService.getUserTemplates(user.id, { meal_type: mealType }),
        TemplateService.getPublicTemplates({ meal_type: mealType })
      ]);
      
      // Combina e remove duplicatas (prioriza os do usuário)
      const userIds = new Set(userTemplates.map(t => t.id));
      const uniquePublic = publicTemplates.filter(t => !userIds.has(t.id));
      
      // Ordena por compatibilidade com targets (aproximação calórica)
      const allTemplates = [...userTemplates, ...uniquePublic].sort((a, b) => {
        const diffA = Math.abs(a.total_kcal - (targets.calories * 0.2)); // ~20% do VET por refeição
        const diffB = Math.abs(b.total_kcal - (targets.calories * 0.2));
        return diffA - diffB;
      });
      
      setTemplates(allTemplates.slice(0, 10)); // Limita a 10 templates
    } catch (error: any) {
      toast({
        title: "Erro ao carregar templates",
        description: error.message || "Não foi possível buscar templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [user?.id, mealType]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5" />
            Seus Templates
          </CardTitle>
          
          <Button
            onClick={loadTemplates}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum template salvo ainda</p>
            <p className="text-xs mt-1">
              Salve refeições como templates para reutilizar depois
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-4 rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{template.name}</h4>
                  <Badge variant={template.is_public ? "secondary" : "outline"} className="shrink-0">
                    {template.is_public ? 'Público' : 'Seu'}
                  </Badge>
                </div>
                
                {template.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="outline">
                    {Math.round(template.total_kcal)} kcal
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    P: {Math.round(template.total_ptn_g)}g
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    C: {Math.round(template.total_cho_g)}g
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    G: {Math.round(template.total_lip_g)}g
                  </Badge>
                </div>

                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => onSelectTemplate?.(template)}
                >
                  Usar este template
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartTemplatesPanel;
