import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Save, Lightbulb } from 'lucide-react';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const RecommendationsStep: React.FC = () => {
  const { selectedPatient, consultationData, updateConsultationData, autoSave } = useConsultationData();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load existing recommendations
  useEffect(() => {
    if (consultationData?.recommendations) {
      setRecommendations(consultationData.recommendations);
    }
  }, [consultationData?.recommendations]);

  // Generate automatic recommendations based on consultation data
  const generateAutoRecommendations = () => {
    if (!consultationData?.results || !selectedPatient) return '';

    const suggestions = [];
    
    // VET-based recommendations
    if (consultationData.results.vet) {
      suggestions.push(`• Seguir plano alimentar de ${consultationData.results.vet} kcal/dia`);
    }

    // Macro-based recommendations
    if (consultationData.results.macros) {
      suggestions.push(`• Distribuição de macronutrientes:`);
      suggestions.push(`  - Proteínas: ${consultationData.results.macros.protein}g/dia`);
      suggestions.push(`  - Carboidratos: ${consultationData.results.macros.carbs}g/dia`);
      suggestions.push(`  - Gorduras: ${consultationData.results.macros.fat}g/dia`);
    }

    // Activity level recommendations
    if (consultationData.activity_level) {
      const activityRecommendations = {
        'sedentario': 'Iniciar atividade física gradual, caminhadas de 30min 3x/semana',
        'leve': 'Manter atividade física atual e considerar incremento gradual',
        'moderado': 'Excelente nível de atividade, manter regularidade',
        'intenso': 'Atenção especial à recuperação e hidratação',
        'muito_intenso': 'Monitorar sinais de overtraining, ajustar nutrição para performance'
      };
      
      if (activityRecommendations[consultationData.activity_level]) {
        suggestions.push(`• Atividade física: ${activityRecommendations[consultationData.activity_level]}`);
      }
    }

    // Objective-based recommendations
    if (consultationData.objective) {
      const objectiveRecommendations = {
        'emagrecimento': 'Manter déficit calórico, priorizar proteínas, hidratação adequada',
        'manutenção': 'Manter peso atual, foco na qualidade nutricional',
        'hipertrofia': 'Superávit calórico controlado, timing nutricional pré/pós treino'
      };
      
      if (objectiveRecommendations[consultationData.objective]) {
        suggestions.push(`• Objetivo ${consultationData.objective}: ${objectiveRecommendations[consultationData.objective]}`);
      }
    }

    // General recommendations
    suggestions.push(`• Hidratação: mínimo 35ml/kg de peso corporal/dia`);
    suggestions.push(`• Refeições: distribuir em 4-6 refeições ao longo do dia`);
    suggestions.push(`• Acompanhamento: retorno em 15-30 dias para reavaliação`);
    suggestions.push(`• Registrar peso semanalmente no mesmo horário`);

    return suggestions.join('\n');
  };

  const handleAutoGenerate = () => {
    const autoRecommendations = generateAutoRecommendations();
    if (autoRecommendations) {
      setRecommendations(autoRecommendations);
      toast({
        title: 'Recomendações Geradas',
        description: 'Recomendações automáticas baseadas na consulta foram geradas.'
      });
    }
  };

  const handleSaveRecommendations = async () => {
    setIsSaving(true);
    
    try {
      // Update consultation data with recommendations
      updateConsultationData({
        recommendations: recommendations.trim()
      });

      // Auto-save the updated consultation
      await autoSave();

      toast({
        title: 'Recomendações Salvas',
        description: 'As recomendações foram salvas com sucesso!'
      });
    } catch (error) {
      console.error('Error saving recommendations:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar recomendações. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save on change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (recommendations !== (consultationData?.recommendations || '')) {
        updateConsultationData({
          recommendations: recommendations.trim()
        });
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [recommendations, consultationData?.recommendations, updateConsultationData]);

  if (!selectedPatient) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Selecione um paciente para continuar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-nutri-orange" />
            Recomendações Nutricionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Summary */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Paciente: {selectedPatient.name}</h3>
            {consultationData?.results && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">VET: {consultationData.results.vet} kcal</Badge>
                <Badge variant="outline">
                  Objetivo: {consultationData.objective || 'Não definido'}
                </Badge>
                <Badge variant="outline">
                  Atividade: {consultationData.activity_level || 'Não definido'}
                </Badge>
              </div>
            )}
          </div>

          {/* Auto-generate Button */}
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={handleAutoGenerate}
              className="border-nutri-orange text-nutri-orange hover:bg-nutri-orange hover:text-white"
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              Gerar Recomendações Automáticas
            </Button>
          </div>

          {/* Recommendations Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Recomendações Personalizadas</label>
            <Textarea
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Digite aqui as recomendações personalizadas para o paciente..."
              className="min-h-[300px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              As recomendações são salvas automaticamente enquanto você digita.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleSaveRecommendations}
              disabled={isSaving || !recommendations.trim()}
              className="bg-nutri-orange hover:bg-nutri-orange-dark"
            >
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Recomendações
                </>
              )}
            </Button>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Diretrizes para Recomendações
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Seja específico nas orientações nutricionais</li>
              <li>• Inclua objetivos mensuráveis e prazos</li>
              <li>• Considere preferências e restrições do paciente</li>
              <li>• Oriente sobre hidratação e timing das refeições</li>
              <li>• Estabeleça frequência de acompanhamento</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationsStep;