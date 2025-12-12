/**
 * MEAL PLAN HISTORY
 * Visualização de histórico e versionamento de planos alimentares
 * 
 * FASE 2 - SPRINT U1: Refatorado para usar UnifiedNutritionContext
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, RotateCcw, Clock } from 'lucide-react';
import { useMealPlanVersioning } from '@/hooks/meal-plan/useMealPlanVersioning';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useUnifiedNutrition } from '@/contexts/UnifiedNutritionContext';

interface MealPlanHistoryProps {
  onVersionRestore?: () => void;
}

const MealPlanHistory: React.FC<MealPlanHistoryProps> = ({
  onVersionRestore
}) => {
  const { currentPlan } = useUnifiedNutrition();
  
  const {
    versions,
    changes,
    currentVersion,
    selectedVersion,
    loadingVersions,
    loadingChanges,
    isRestoring,
    setSelectedVersion,
    restoreVersion,
  } = useMealPlanVersioning(currentPlan?.id || '');

  if (!currentPlan?.id) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Salve o plano para ver o histórico de versões</p>
      </div>
    );
  }

  const handleRestore = (versionNumber: number) => {
    restoreVersion(versionNumber);
    onVersionRestore?.();
  };

  const getChangeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'item_added': 'Item adicionado',
      'item_removed': 'Item removido',
      'item_updated': 'Item atualizado',
      'meal_added': 'Refeição adicionada',
      'meal_removed': 'Refeição removida',
      'version_restored': 'Versão restaurada',
      'manual_edit': 'Edição manual',
    };
    return labels[type] || type;
  };

  const getChangeTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'item_added': 'bg-green-500/10 text-green-500',
      'item_removed': 'bg-red-500/10 text-red-500',
      'item_updated': 'bg-blue-500/10 text-blue-500',
      'meal_added': 'bg-green-500/10 text-green-500',
      'meal_removed': 'bg-red-500/10 text-red-500',
      'version_restored': 'bg-purple-500/10 text-purple-500',
      'manual_edit': 'bg-blue-500/10 text-blue-500',
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Histórico de Versões */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Versões
            </CardTitle>
            <Badge variant="secondary">v{currentVersion}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loadingVersions ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando histórico...
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma versão anterior</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {versions.map((version) => {
                  const isSelected = selectedVersion === version.version_number;
                  const isCurrent = version.version_number === currentVersion;
                  
                  return (
                    <button
                      key={version.id}
                      onClick={() => setSelectedVersion(version.version_number)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={isCurrent ? 'default' : 'outline'}>
                            v{version.version_number}
                          </Badge>
                          {isCurrent && (
                            <Badge variant="secondary">Atual</Badge>
                          )}
                        </div>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {format(new Date(version.created_at), 'PPp', { locale: ptBR })}
                      </p>
                      
                      {version.change_summary && (
                        <p className="text-sm mb-2">{version.change_summary}</p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Calorias: </span>
                          {Math.round(version.snapshot_data.total_calories)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">PTN: </span>
                          {Math.round(version.snapshot_data.total_protein)}g
                        </div>
                      </div>
                      
                      {!isCurrent && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore(version.version_number);
                          }}
                          disabled={isRestoring}
                        >
                          <RotateCcw className="h-3 w-3 mr-2" />
                          Restaurar esta versão
                        </Button>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Mudanças */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Mudanças
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingChanges ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando mudanças...
            </div>
          ) : changes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma mudança registrada</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {changes.map((change) => (
                  <div
                    key={change.id}
                    className="p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getChangeTypeColor(change.change_type)}>
                        {getChangeTypeLabel(change.change_type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        v{change.version_from} → v{change.version_to}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {format(new Date(change.changed_at), 'PPp', { locale: ptBR })}
                    </p>
                    
                    {change.change_data && (
                      <div className="text-sm space-y-1">
                        {change.change_data.food_name && (
                          <p className="font-medium">{change.change_data.food_name}</p>
                        )}
                        {change.change_data.meal_type && (
                          <p className="text-muted-foreground">{change.change_data.meal_type}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanHistory;
