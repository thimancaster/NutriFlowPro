/**
 * INTELLIGENT VALIDATION PANEL
 * Painel de validação inteligente com feedback da IA
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { useIntelligentValidation } from '@/hooks/meal-plan/useIntelligentValidation';
import { ConsolidatedMealPlan } from '@/types/mealPlanTypes';
import { Progress } from '@/components/ui/progress';

interface IntelligentValidationPanelProps {
  mealPlan: ConsolidatedMealPlan;
  targets: { calories: number; protein: number; carbs: number; fats: number };
}

const IntelligentValidationPanel: React.FC<IntelligentValidationPanelProps> = ({
  mealPlan,
  targets
}) => {
  const {
    validation,
    isValidating,
    validate,
    autoValidate,
    setAutoValidate,
  } = useIntelligentValidation(mealPlan, targets);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'alta': return 'bg-red-500/10 text-red-500';
      case 'media': return 'bg-yellow-500/10 text-yellow-500';
      case 'baixa': return 'bg-blue-500/10 text-blue-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Validação Inteligente
          </CardTitle>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={autoValidate}
                onCheckedChange={setAutoValidate}
                id="auto-validate"
              />
              <Label htmlFor="auto-validate" className="text-sm cursor-pointer">
                Auto-validar
              </Label>
            </div>
            
            <Button
              onClick={validate}
              disabled={isValidating}
              size="sm"
              variant="outline"
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Validar Agora
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!validation && !isValidating && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Clique em "Validar Agora" para análise inteligente do plano</p>
          </div>
        )}

        {isValidating && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Analisando plano com IA...</p>
          </div>
        )}

        {validation && !isValidating && (
          <>
            {/* Score */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Score de Qualidade</p>
                <p className={`text-3xl font-bold ${getScoreColor(validation.score)}`}>
                  {validation.score}/100
                </p>
              </div>
              <div className="text-right">
                {validation.isValid ? (
                  <Badge className="bg-green-500/10 text-green-500 gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Aprovado
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/10 text-red-500 gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Necessita ajustes
                  </Badge>
                )}
              </div>
            </div>

            <Progress value={validation.score} className="h-2" />

            {/* Warnings */}
            {validation.warnings && validation.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Pontos de Atenção ({validation.warnings.length})
                </h4>
                {validation.warnings.map((warning, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-start gap-2">
                      <Badge className={getSeverityColor(warning.severity)}>
                        {warning.severity}
                      </Badge>
                      <p className="text-sm flex-1">{warning.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {validation.suggestions && validation.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Sugestões de Melhoria ({validation.suggestions.length})
                </h4>
                <ul className="space-y-2">
                  {validation.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strengths */}
            {validation.strengths && validation.strengths.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Pontos Fortes
                </h4>
                <ul className="space-y-2">
                  {validation.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default IntelligentValidationPanel;
