/**
 * SMART TEMPLATES PANEL
 * Painel de templates inteligentes sugeridos por IA
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { IntelligenceService, MealTemplate } from '@/services/mealPlan/IntelligenceService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SmartTemplatesPanelProps {
  targets: { calories: number; protein: number; carbs: number; fats: number };
  onSelectTemplate?: (template: MealTemplate) => void;
}

const SmartTemplatesPanel: React.FC<SmartTemplatesPanelProps> = ({
  targets,
  onSelectTemplate
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<MealTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTemplates = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const suggestions = await IntelligenceService.suggestTemplates(
        user.id,
        targets
      );
      setTemplates(suggestions);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar templates",
        description: error.message || "Não foi possível buscar sugestões",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [user?.id, targets.calories]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Templates Inteligentes
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
            <p className="text-muted-foreground">Analisando seu histórico com IA...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Clique no botão para gerar sugestões inteligentes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{template.name}</h4>
                  <Badge variant="secondary" className="shrink-0">
                    IA
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {template.description}
                </p>
                
                {template.suitability && (
                  <p className="text-sm mb-3 flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="italic">{template.suitability}</span>
                  </p>
                )}

                {template.estimatedCalories && (
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">
                      ~{Math.round(template.estimatedCalories)} kcal
                    </Badge>
                  </div>
                )}

                {template.highlightFeatures && template.highlightFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {template.highlightFeatures.map((feature, fIdx) => (
                      <Badge key={fIdx} variant="secondary" className="text-xs">
                        {feature}
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
