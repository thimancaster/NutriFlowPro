/**
 * NUTRITIONAL VALIDATION INDICATOR
 * Componente de validação visual em tempo real para o plano alimentar.
 * Mostra avisos quando o plano está acima ou abaixo das metas.
 */

import React, { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp,
  Flame,
  Beef,
  Wheat,
  Droplets
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MacroTargets {
  kcal: number;
  ptn_g: number;
  cho_g: number;
  lip_g: number;
}

interface MacroActuals {
  kcal: number;
  ptn_g: number;
  cho_g: number;
  lip_g: number;
}

interface ValidationResult {
  isValid: boolean;
  score: number;
  warnings: string[];
  suggestions: string[];
}

interface NutritionalValidationIndicatorProps {
  targets: MacroTargets;
  actuals: MacroActuals;
  className?: string;
  compact?: boolean;
}

const TOLERANCE = 0.10; // 10% tolerance

export const NutritionalValidationIndicator: React.FC<NutritionalValidationIndicatorProps> = ({
  targets,
  actuals,
  className,
  compact = false,
}) => {
  const validation = useMemo((): ValidationResult => {
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let totalScore = 0;
    let checks = 0;

    // Helper to check macro
    const checkMacro = (
      name: string,
      actual: number,
      target: number,
      unit: string
    ) => {
      if (target <= 0) return;
      
      checks++;
      const diff = actual - target;
      const percentDiff = (diff / target) * 100;
      
      if (Math.abs(percentDiff) <= TOLERANCE * 100) {
        totalScore++;
      } else if (percentDiff > TOLERANCE * 100) {
        warnings.push(`${name}: ${Math.round(percentDiff)}% acima da meta (+${Math.round(diff)}${unit})`);
        suggestions.push(`Reduza porções de alimentos ricos em ${name.toLowerCase()}`);
      } else {
        warnings.push(`${name}: ${Math.round(Math.abs(percentDiff))}% abaixo da meta (${Math.round(diff)}${unit})`);
        suggestions.push(`Adicione alimentos ricos em ${name.toLowerCase()}`);
      }
    };

    checkMacro('Calorias', actuals.kcal, targets.kcal, ' kcal');
    checkMacro('Proteína', actuals.ptn_g, targets.ptn_g, 'g');
    checkMacro('Carboidratos', actuals.cho_g, targets.cho_g, 'g');
    checkMacro('Gorduras', actuals.lip_g, targets.lip_g, 'g');

    const score = checks > 0 ? Math.round((totalScore / checks) * 100) : 0;

    return {
      isValid: warnings.length === 0,
      score,
      warnings,
      suggestions: [...new Set(suggestions)].slice(0, 3),
    };
  }, [targets, actuals]);

  const getProgressColor = (actual: number, target: number): string => {
    if (target <= 0) return 'bg-muted';
    const ratio = actual / target;
    if (ratio < 0.9) return 'bg-amber-500';
    if (ratio > 1.1) return 'bg-destructive';
    return 'bg-emerald-500';
  };

  const getStatusIcon = (actual: number, target: number) => {
    if (target <= 0) return null;
    const ratio = actual / target;
    if (ratio < 0.9) return <TrendingDown className="h-3 w-3 text-amber-500" />;
    if (ratio > 1.1) return <TrendingUp className="h-3 w-3 text-destructive" />;
    return <CheckCircle2 className="h-3 w-3 text-emerald-500" />;
  };

  const getPercentage = (actual: number, target: number): number => {
    if (target <= 0) return 0;
    return Math.min(Math.round((actual / target) * 100), 150);
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {validation.isValid ? (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Balanceado
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {validation.warnings.length} ajuste{validation.warnings.length !== 1 ? 's' : ''}
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">
          Score: {validation.score}%
        </span>
      </div>
    );
  }

  return (
    <Card className={cn("border-border/50", className)}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Validação Nutricional</h4>
          <Badge 
            variant="outline" 
            className={cn(
              validation.isValid 
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                : validation.score >= 50
                  ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                  : "bg-destructive/10 text-destructive border-destructive/30"
            )}
          >
            {validation.isValid ? (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            ) : (
              <AlertTriangle className="h-3 w-3 mr-1" />
            )}
            {validation.score}% adequado
          </Badge>
        </div>

        {/* Macro Progress Bars */}
        <div className="space-y-3">
          {/* Calories */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-muted-foreground">Calorias</span>
                {getStatusIcon(actuals.kcal, targets.kcal)}
              </div>
              <span className="font-medium">
                {Math.round(actuals.kcal)} / {targets.kcal} kcal
              </span>
            </div>
            <Progress 
              value={getPercentage(actuals.kcal, targets.kcal)} 
              className="h-2"
              indicatorClassName={getProgressColor(actuals.kcal, targets.kcal)}
            />
          </div>

          {/* Protein */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Beef className="h-3.5 w-3.5 text-red-500" />
                <span className="text-muted-foreground">Proteína</span>
                {getStatusIcon(actuals.ptn_g, targets.ptn_g)}
              </div>
              <span className="font-medium">
                {Math.round(actuals.ptn_g)} / {targets.ptn_g}g
              </span>
            </div>
            <Progress 
              value={getPercentage(actuals.ptn_g, targets.ptn_g)} 
              className="h-2"
              indicatorClassName={getProgressColor(actuals.ptn_g, targets.ptn_g)}
            />
          </div>

          {/* Carbs */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Wheat className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-muted-foreground">Carboidratos</span>
                {getStatusIcon(actuals.cho_g, targets.cho_g)}
              </div>
              <span className="font-medium">
                {Math.round(actuals.cho_g)} / {targets.cho_g}g
              </span>
            </div>
            <Progress 
              value={getPercentage(actuals.cho_g, targets.cho_g)} 
              className="h-2"
              indicatorClassName={getProgressColor(actuals.cho_g, targets.cho_g)}
            />
          </div>

          {/* Fats */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Droplets className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-muted-foreground">Gorduras</span>
                {getStatusIcon(actuals.lip_g, targets.lip_g)}
              </div>
              <span className="font-medium">
                {Math.round(actuals.lip_g)} / {targets.lip_g}g
              </span>
            </div>
            <Progress 
              value={getPercentage(actuals.lip_g, targets.lip_g)} 
              className="h-2"
              indicatorClassName={getProgressColor(actuals.lip_g, targets.lip_g)}
            />
          </div>
        </div>

        {/* Warnings */}
        {validation.warnings.length > 0 && (
          <Alert className="bg-amber-500/5 border-amber-500/30">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-sm text-amber-600">Ajustes Necessários</AlertTitle>
            <AlertDescription className="text-xs space-y-1 mt-2">
              {validation.warnings.map((warning, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-500">•</span>
                  <span>{warning}</span>
                </div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {/* Suggestions */}
        {validation.suggestions.length > 0 && !validation.isValid && (
          <div className="text-xs text-muted-foreground space-y-1">
            <span className="font-medium">Sugestões:</span>
            {validation.suggestions.map((suggestion, idx) => (
              <div key={idx} className="flex items-start gap-1.5 pl-2">
                <span className="text-primary">→</span>
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        )}

        {/* Success State */}
        {validation.isValid && (
          <Alert className="bg-emerald-500/5 border-emerald-500/30">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <AlertTitle className="text-sm text-emerald-600">Plano Balanceado</AlertTitle>
            <AlertDescription className="text-xs text-emerald-600/80">
              O plano alimentar está dentro das metas nutricionais estabelecidas.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default NutritionalValidationIndicator;
