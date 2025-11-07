/**
 * PATIENT PREFERENCES PANEL
 * Painel de preferências do paciente analisadas por IA
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { IntelligenceService, PatientPreferences } from '@/services/mealPlan/IntelligenceService';
import { useToast } from '@/hooks/use-toast';

interface PatientPreferencesPanelProps {
  patientId: string;
  onPreferencesLoaded?: (preferences: PatientPreferences) => void;
}

const PatientPreferencesPanel: React.FC<PatientPreferencesPanelProps> = ({
  patientId,
  onPreferencesLoaded
}) => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<PatientPreferences | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const prefs = await IntelligenceService.analyzePatientPreferences(patientId);
      setPreferences(prefs);
      onPreferencesLoaded?.(prefs);
    } catch (error: any) {
      toast({
        title: "Erro ao analisar preferências",
        description: error.message || "Não foi possível analisar o histórico",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      loadPreferences();
    }
  }, [patientId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Preferências do Paciente
          </CardTitle>
          
          <Button
            onClick={loadPreferences}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Analisando histórico com IA...</p>
          </div>
        ) : !preferences ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma análise disponível</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Alimentos Preferidos */}
            {preferences.foodCategories && preferences.foodCategories.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                  Categorias Mais Consumidas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.foodCategories.map((cat, idx) => (
                    <Badge key={idx} variant="secondary">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Alimentos Evitados */}
            {preferences.avoidedFoods && preferences.avoidedFoods.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4 text-red-500" />
                  Alimentos Raramente Usados
                </h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.avoidedFoods.map((food, idx) => (
                    <Badge key={idx} variant="outline" className="opacity-70">
                      {food}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Macros Médios */}
            {preferences.averageMacros && (
              <div>
                <h4 className="font-medium text-sm mb-2">Padrão Nutricional Médio</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-accent/50">
                    <p className="text-xs text-muted-foreground">Calorias</p>
                    <p className="text-lg font-bold">
                      {Math.round(preferences.averageMacros.calories)} kcal
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-accent/50">
                    <p className="text-xs text-muted-foreground">Proteína</p>
                    <p className="text-lg font-bold">
                      {Math.round(preferences.averageMacros.protein)}g
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Insights */}
            {preferences.insights && preferences.insights.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  Insights da IA
                </h4>
                <ul className="space-y-2">
                  {preferences.insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm p-2 rounded bg-accent/30">
                      <span className="text-primary mt-1">💡</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientPreferencesPanel;
