/**
 * FOOD DATABASE MANAGER
 * Gerenciador integrado de alimentos para o MealPlanBuilder
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  Database,
  Filter
} from 'lucide-react';
import {
  searchFoodsEnhanced,
  getFoodCategories,
  createFood,
  updateFood,
  deleteFood,
  AlimentoV2
} from '@/services/enhancedFoodSearchService';
import { cn } from '@/lib/utils';

interface FoodDatabaseManagerProps {
  onSelectFood?: (food: AlimentoV2, quantity: number) => void;
  showSelectButton?: boolean;
}

const defaultFood: Partial<AlimentoV2> = {
  nome: '',
  categoria: 'Outros',
  medida_padrao_referencia: 'unidade',
  peso_referencia_g: 100,
  kcal_por_referencia: 0,
  ptn_g_por_referencia: 0,
  cho_g_por_referencia: 0,
  lip_g_por_referencia: 0,
  fibra_g_por_referencia: 0,
  tipo_refeicao_sugerida: ['any'],
};

export const FoodDatabaseManager: React.FC<FoodDatabaseManagerProps> = ({
  onSelectFood,
  showSelectButton = false
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [foods, setFoods] = useState<AlimentoV2[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [editingFood, setEditingFood] = useState<Partial<AlimentoV2> | null>(null);
  const [isNewFood, setIsNewFood] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      const cats = await getFoodCategories();
      setCategories(cats);
    };
    loadCategories();
  }, []);

  // Search foods with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await searchFoodsEnhanced({
          query: searchQuery,
          category: selectedCategory || undefined,
          limit: 100
        });
        setFoods(result.foods);
      } catch (error) {
        console.error('Error searching foods:', error);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const handleCreateFood = () => {
    setEditingFood({ ...defaultFood });
    setIsNewFood(true);
  };

  const handleEditFood = (food: AlimentoV2) => {
    setEditingFood({ ...food });
    setIsNewFood(false);
  };

  const handleDeleteFood = async (food: AlimentoV2) => {
    if (!confirm(`Deseja realmente excluir "${food.nome}"?`)) return;
    
    const success = await deleteFood(food.id);
    if (success) {
      toast({
        title: 'Alimento excluído',
        description: `${food.nome} foi removido do banco de dados.`
      });
      // Refresh list
      const result = await searchFoodsEnhanced({
        query: searchQuery,
        category: selectedCategory || undefined,
        limit: 100
      });
      setFoods(result.foods);
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o alimento.',
        variant: 'destructive'
      });
    }
  };

  const handleSaveFood = async () => {
    if (!editingFood?.nome) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe o nome do alimento.',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      let result: AlimentoV2 | null;
      
      if (isNewFood) {
        result = await createFood(editingFood);
      } else {
        result = await updateFood(editingFood.id!, editingFood);
      }

      if (result) {
        toast({
          title: isNewFood ? 'Alimento criado' : 'Alimento atualizado',
          description: `${result.nome} foi ${isNewFood ? 'adicionado' : 'atualizado'} com sucesso.`
        });
        setEditingFood(null);
        // Refresh list
        const searchResult = await searchFoodsEnhanced({
          query: searchQuery,
          category: selectedCategory || undefined,
          limit: 100
        });
        setFoods(searchResult.foods);
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o alimento.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateEditingFood = (field: string, value: any) => {
    setEditingFood(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Gerenciar Base de Alimentos</h3>
          <Badge variant="secondary">{foods.length} alimentos</Badge>
        </div>
        <Button onClick={handleCreateFood} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Novo Alimento
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar alimento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={selectedCategory || 'all'}
          onValueChange={(v) => setSelectedCategory(v === 'all' ? null : v)}
        >
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.name} value={cat.name}>
                {cat.name} ({cat.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Food List */}
      <ScrollArea className="h-[400px] border rounded-lg">
        <div className="p-2 space-y-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))
          ) : foods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum alimento encontrado
            </div>
          ) : (
            foods.map((food) => (
              <div
                key={food.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium">{food.nome}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {food.categoria}
                    </Badge>
                    <span>{Math.round(food.kcal_por_referencia)} kcal</span>
                    <span>• {food.ptn_g_por_referencia.toFixed(1)}g P</span>
                    <span>• {food.cho_g_por_referencia.toFixed(1)}g C</span>
                    <span>• {food.lip_g_por_referencia.toFixed(1)}g G</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {showSelectButton && onSelectFood && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectFood(food, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditFood(food)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFood(food)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Edit Dialog */}
      <Dialog open={!!editingFood} onOpenChange={(open) => !open && setEditingFood(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isNewFood ? 'Novo Alimento' : 'Editar Alimento'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={editingFood?.nome || ''}
                onChange={(e) => updateEditingFood('nome', e.target.value)}
                placeholder="Ex: Arroz branco cozido"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={editingFood?.categoria || 'Outros'}
                  onValueChange={(v) => updateEditingFood('categoria', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medida">Medida Padrão</Label>
                <Input
                  id="medida"
                  value={editingFood?.medida_padrao_referencia || ''}
                  onChange={(e) => updateEditingFood('medida_padrao_referencia', e.target.value)}
                  placeholder="Ex: colher de sopa"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="peso">Peso Referência (g)</Label>
                <Input
                  id="peso"
                  type="number"
                  value={editingFood?.peso_referencia_g || 0}
                  onChange={(e) => updateEditingFood('peso_referencia_g', Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kcal">Calorias (kcal)</Label>
                <Input
                  id="kcal"
                  type="number"
                  value={editingFood?.kcal_por_referencia || 0}
                  onChange={(e) => updateEditingFood('kcal_por_referencia', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ptn">Proteína (g)</Label>
                <Input
                  id="ptn"
                  type="number"
                  step="0.1"
                  value={editingFood?.ptn_g_por_referencia || 0}
                  onChange={(e) => updateEditingFood('ptn_g_por_referencia', Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cho">Carboidrato (g)</Label>
                <Input
                  id="cho"
                  type="number"
                  step="0.1"
                  value={editingFood?.cho_g_por_referencia || 0}
                  onChange={(e) => updateEditingFood('cho_g_por_referencia', Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lip">Gordura (g)</Label>
                <Input
                  id="lip"
                  type="number"
                  step="0.1"
                  value={editingFood?.lip_g_por_referencia || 0}
                  onChange={(e) => updateEditingFood('lip_g_por_referencia', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fibra">Fibra (g)</Label>
              <Input
                id="fibra"
                type="number"
                step="0.1"
                value={editingFood?.fibra_g_por_referencia || 0}
                onChange={(e) => updateEditingFood('fibra_g_por_referencia', Number(e.target.value))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFood(null)}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button onClick={handleSaveFood} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
