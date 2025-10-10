import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Utensils, Search, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useMealPlanCalculations, Refeicao, ItemRefeicao, AlimentoV2 } from '@/hooks/useMealPlanCalculations';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

// Distribuição padrão de calorias por refeição (%)
const DISTRIBUICAO_PADRAO = [0.25, 0.10, 0.30, 0.10, 0.20, 0.05]; // Café, Lanche AM, Almoço, Lanche PM, Jantar, Ceia

const REFEICOES_TEMPLATE = [
  { nome: 'Café da Manhã', numero: 1, horario_sugerido: '07:00' },
  { nome: 'Lanche da Manhã', numero: 2, horario_sugerido: '10:00' },
  { nome: 'Almoço', numero: 3, horario_sugerido: '12:30' },
  { nome: 'Lanche da Tarde', numero: 4, horario_sugerido: '15:30' },
  { nome: 'Jantar', numero: 5, horario_sugerido: '19:00' },
  { nome: 'Ceia', numero: 6, horario_sugerido: '21:30' }
];

const MealPlanStep: React.FC = () => {
  const { consultationData, updateConsultationData } = useConsultationData();
  const { activePatient } = usePatient();
  const { toast } = useToast();
  const {
    alimentos,
    loading: searchingAlimentos,
    searchAlimentos,
    calculateItemRefeicao,
    calculateRefeicaoTotals,
    calculateDailyTotals
  } = useMealPlanCalculations();

  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRefeicaoIndex, setActiveRefeicaoIndex] = useState<number | null>(null);
  const [selectedAlimento, setSelectedAlimento] = useState<AlimentoV2 | null>(null);
  const [quantidade, setQuantidade] = useState<string>('1');

  // Inicializar refeições com alvos baseados no VET
  useEffect(() => {
    if (consultationData?.results?.vet && refeicoes.length === 0) {
      const vet = consultationData.results.vet;
      const macros = consultationData.results.macros;

      const initialRefeicoes: Refeicao[] = REFEICOES_TEMPLATE.map((template, idx) => ({
        ...template,
        itens: [],
        alvo_kcal: Math.round(vet * DISTRIBUICAO_PADRAO[idx]),
        alvo_ptn_g: Math.round(macros.protein * DISTRIBUICAO_PADRAO[idx]),
        alvo_cho_g: Math.round(macros.carbs * DISTRIBUICAO_PADRAO[idx]),
        alvo_lip_g: Math.round(macros.fat * DISTRIBUICAO_PADRAO[idx])
      }));

      setRefeicoes(initialRefeicoes);
    }
  }, [consultationData?.results, refeicoes.length]);

  // Buscar alimentos quando o usuário digita
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchAlimentos(searchQuery);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, searchAlimentos]);

  const handleAddAlimento = () => {
    if (!selectedAlimento || activeRefeicaoIndex === null) {
      toast({
        title: 'Erro',
        description: 'Selecione um alimento e uma refeição',
        variant: 'destructive'
      });
      return;
    }

    const qtd = parseFloat(quantidade);
    if (isNaN(qtd) || qtd <= 0) {
      toast({
        title: 'Quantidade Inválida',
        description: 'Digite uma quantidade válida',
        variant: 'destructive'
      });
      return;
    }

    const item = calculateItemRefeicao(selectedAlimento, qtd);
    
    setRefeicoes(prev => {
      const newRefeicoes = [...prev];
      newRefeicoes[activeRefeicaoIndex].itens.push(item);
      return newRefeicoes;
    });

    // Reset
    setSelectedAlimento(null);
    setSearchQuery('');
    setQuantidade('1');

    toast({
      title: 'Alimento Adicionado',
      description: `${item.quantidade}x ${selectedAlimento.medida_padrao_referencia} de ${selectedAlimento.nome}`
    });
  };

  const handleRemoveItem = (refeicaoIndex: number, itemIndex: number) => {
    setRefeicoes(prev => {
      const newRefeicoes = [...prev];
      newRefeicoes[refeicaoIndex].itens.splice(itemIndex, 1);
      return newRefeicoes;
    });
  };

  const handleSaveMealPlan = () => {
    updateConsultationData({
      mealPlan: {
        refeicoes,
        dailyTotals: calculateDailyTotals(refeicoes)
      }
    });

    toast({
      title: 'Plano Salvo',
      description: 'Plano alimentar salvo com sucesso!'
    });
  };

  if (!consultationData?.results?.vet) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Complete o cálculo nutricional primeiro</p>
        </CardContent>
      </Card>
    );
  }

  const dailyTotals = calculateDailyTotals(refeicoes);
  const vetTarget = consultationData.results.vet;
  const progressPercent = (dailyTotals.kcal / vetTarget) * 100;

  return (
    <div className="space-y-6">
      {/* Header com Resumo Diário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            Plano Alimentar - {activePatient?.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Calorias</p>
              <p className="text-2xl font-bold">{Math.round(dailyTotals.kcal)}</p>
              <p className="text-xs text-muted-foreground">/ {vetTarget} kcal</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Proteína</p>
              <p className="text-2xl font-bold">{Math.round(dailyTotals.ptn_g)}g</p>
              <p className="text-xs text-muted-foreground">/ {consultationData.results.macros.protein}g</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Carboidratos</p>
              <p className="text-2xl font-bold">{Math.round(dailyTotals.cho_g)}g</p>
              <p className="text-xs text-muted-foreground">/ {consultationData.results.macros.carbs}g</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gorduras</p>
              <p className="text-2xl font-bold">{Math.round(dailyTotals.lip_g)}g</p>
              <p className="text-xs text-muted-foreground">/ {consultationData.results.macros.fat}g</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{progressPercent.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(progressPercent, 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Busca de Alimentos */}
      {activeRefeicaoIndex !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Adicionar Alimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar alimento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="Qtd"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="w-20"
              />
              <Button 
                onClick={handleAddAlimento}
                disabled={!selectedAlimento}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {searchingAlimentos && (
              <p className="text-sm text-muted-foreground">Buscando...</p>
            )}

            {alimentos.length > 0 && (
              <ScrollArea className="h-48 border rounded-lg">
                <div className="p-2 space-y-1">
                  {alimentos.map((alimento) => (
                    <div
                      key={alimento.id}
                      onClick={() => setSelectedAlimento(alimento)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedAlimento?.id === alimento.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{alimento.nome}</p>
                          <p className="text-xs opacity-80">
                            {alimento.medida_padrao_referencia} ({alimento.peso_referencia_g}g)
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-bold">{alimento.kcal_por_referencia} kcal</p>
                          <p className="text-xs opacity-80">
                            P:{alimento.ptn_g_por_referencia}g C:{alimento.cho_g_por_referencia}g L:{alimento.lip_g_por_referencia}g
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      {/* Refeições */}
      {refeicoes.map((refeicao, refeicaoIdx) => {
        const totals = calculateRefeicaoTotals(refeicao.itens);
        const kcalProgress = (totals.kcal / refeicao.alvo_kcal) * 100;
        const isActive = activeRefeicaoIndex === refeicaoIdx;

        return (
          <Card key={refeicaoIdx} className={isActive ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{refeicao.nome}</CardTitle>
                  {refeicao.horario_sugerido && (
                    <Badge variant="outline">{refeicao.horario_sugerido}</Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => setActiveRefeicaoIndex(isActive ? null : refeicaoIdx)}
                >
                  {isActive ? 'Selecionada' : 'Selecionar'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Alvos vs Atual */}
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Kcal</p>
                    <p className="font-bold">{Math.round(totals.kcal)} / {refeicao.alvo_kcal}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">PTN</p>
                    <p className="font-bold">{Math.round(totals.ptn_g)}g / {refeicao.alvo_ptn_g}g</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">CHO</p>
                    <p className="font-bold">{Math.round(totals.cho_g)}g / {refeicao.alvo_cho_g}g</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">LIP</p>
                    <p className="font-bold">{Math.round(totals.lip_g)}g / {refeicao.alvo_lip_g}g</p>
                  </div>
                </div>
                <Progress value={Math.min(kcalProgress, 100)} className="h-1 mt-2" />
              </div>

              {/* Lista de Itens */}
              {refeicao.itens.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhum alimento adicionado. Selecione esta refeição e busque alimentos acima.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {refeicao.itens.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.alimento_nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantidade}x {item.medida_utilizada} ({item.peso_total_g}g)
                        </p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="font-bold">{Math.round(item.kcal_calculado)} kcal</p>
                        <p className="text-xs text-muted-foreground">
                          P:{Math.round(item.ptn_g_calculado)}g 
                          C:{Math.round(item.cho_g_calculado)}g 
                          L:{Math.round(item.lip_g_calculado)}g
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveItem(refeicaoIdx, itemIdx)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Botão Salvar */}
      <div className="flex justify-end gap-4">
        <Button onClick={handleSaveMealPlan} size="lg" className="w-full md:w-auto">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Salvar Plano Alimentar
        </Button>
      </div>
    </div>
  );
};

export default MealPlanStep;
