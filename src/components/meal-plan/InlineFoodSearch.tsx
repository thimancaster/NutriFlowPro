/**
 * INLINE FOOD SEARCH
 * Busca de alimentos inline com sugestões inteligentes
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { searchFoodsEnhanced, getFoodsByMealType, AlimentoV2 } from '@/services/enhancedFoodSearchService';
import { MealType } from '@/types/mealPlanTypes';
import { Badge } from '@/components/ui/badge';

interface InlineFoodSearchProps {
  mealType: MealType;
  onSelectFood: (food: AlimentoV2, quantity: number) => void;
  onClose?: () => void;
}

const InlineFoodSearch: React.FC<InlineFoodSearchProps> = ({
  mealType,
  onSelectFood,
  onClose
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AlimentoV2[]>([]);
  const [suggestions, setSuggestions] = useState<AlimentoV2[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<AlimentoV2 | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Busca inicial de sugestões
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const foods = await getFoodsByMealType(mealType, 20);
        setSuggestions(foods);
      } catch (error) {
        console.error('Erro ao carregar sugestões:', error);
      }
    };
    loadSuggestions();
  }, [mealType]);

  // Busca com debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await searchFoodsEnhanced({ query, limit: 30 });
        setResults(result.foods);
      } catch (error) {
        console.error('Erro na busca:', error);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleAddFood = () => {
    if (selectedFood && quantity > 0) {
      onSelectFood(selectedFood, quantity);
      setSelectedFood(null);
      setQuantity(1);
      setQuery('');
      onClose?.();
    }
  };

  const displayList = query.trim() ? results : suggestions;

  return (
    <Card className="p-4 space-y-4">
      {!selectedFood ? (
        <>
          {/* Campo de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar alimento..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Resultados */}
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : displayList.length > 0 ? (
                displayList.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="font-medium">{food.nome}</div>
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(food.kcal_por_referencia)} kcal
                      </Badge>
                      <span>{food.ptn_g_por_referencia.toFixed(1)}g PTN</span>
                      <span className="text-muted-foreground">• {food.categoria}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {query.trim() ? 'Nenhum alimento encontrado' : 'Digite para buscar'}
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      ) : (
        <>
          {/* Confirmar quantidade */}
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">{selectedFood.nome}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedFood.medida_padrao_referencia} ({selectedFood.peso_referencia_g}g)
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Quantidade (porções)
                  </label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min={0.5}
                    step={0.5}
                    autoFocus
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>{Math.round(selectedFood.kcal_por_referencia * quantity)} kcal</div>
                  <div>{(selectedFood.ptn_g_por_referencia * quantity).toFixed(1)}g PTN</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddFood} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
              <Button variant="outline" onClick={() => setSelectedFood(null)}>
                Voltar
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default InlineFoodSearch;
