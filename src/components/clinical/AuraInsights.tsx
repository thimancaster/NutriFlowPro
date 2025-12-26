import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader2, RefreshCw, X, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { Patient } from '@/types';

interface EvolutionData {
  date: string;
  weight: number;
  vet?: number;
  bodyFatPct?: number;
  bmi?: number;
}

interface AuraInsightsProps {
  patientData: Patient | null;
  evolutionData: EvolutionData[];
  onClose: () => void;
}

const AuraInsights: React.FC<AuraInsightsProps> = ({ 
  patientData, 
  evolutionData,
  onClose 
}) => {
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { consultationData } = useConsultationData();

  const requestAuraAnalysis = async () => {
    if (!patientData) {
      toast({
        title: 'Erro',
        description: 'Nenhum paciente selecionado',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    setResponse('');

    try {
      // Prepare context data for Aura
      const contextData = {
        patient: {
          name: patientData.name,
          age: patientData.age,
          gender: patientData.gender,
        },
        objective: consultationData?.objective || 'maintenance',
        currentData: {
          weight: consultationData?.weight,
          height: consultationData?.height,
          activityLevel: consultationData?.activity_level,
          bmr: consultationData?.bmr,
          tdee: consultationData?.tdee
        },
        evolution: evolutionData.slice(-5).map(d => ({
          date: d.date,
          weight: d.weight,
          vet: d.vet,
          bodyFatPct: d.bodyFatPct
        }))
      };

      // Call edge function with streaming
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aura-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify({ context: contextData })
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos.');
        }
        if (response.status === 402) {
          throw new Error('Créditos insuficientes. Adicione créditos ao workspace.');
        }
        throw new Error('Erro ao comunicar com a Aura');
      }

      if (!response.body) {
        throw new Error('Resposta vazia da Aura');
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              setResponse(fullResponse);
            }
          } catch {
            // Incomplete JSON, continue
          }
        }
      }

      if (!fullResponse) {
        throw new Error('Nenhuma resposta recebida da Aura');
      }

    } catch (error: any) {
      console.error('Error calling Aura:', error);
      toast({
        title: 'Erro na análise',
        description: error.message || 'Não foi possível obter a análise da Aura',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-full">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold">Aura</h4>
            <p className="text-xs text-muted-foreground">Assistente Nutricional IA</p>
          </div>
        </div>
        <div className="flex gap-2">
          {response && (
            <Button variant="outline" size="sm" onClick={requestAuraAnalysis} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Nova Análise
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!response && !isLoading && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Olá! Sou a Aura 👋</p>
                <p className="text-sm text-muted-foreground">
                  Posso analisar os dados do paciente e oferecer insights personalizados 
                  sobre sua evolução nutricional. Clique abaixo para iniciar a análise.
                </p>
              </div>
            </div>
            <Button className="w-full mt-4 gap-2" onClick={requestAuraAnalysis}>
              <Sparkles className="h-4 w-4" />
              Iniciar Análise
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && !response && (
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Aura está analisando os dados...</p>
          </CardContent>
        </Card>
      )}

      {response && (
        <Card>
          <CardContent className="p-4">
            <ScrollArea className="h-[300px] pr-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {response}
                </div>
              </div>
            </ScrollArea>
            {isLoading && (
              <div className="flex items-center gap-2 mt-2 text-primary">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs">Aura está pensando...</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        A Aura usa IA para fornecer insights. Sempre valide as sugestões com seu conhecimento clínico.
      </p>
    </div>
  );
};

export default AuraInsights;
