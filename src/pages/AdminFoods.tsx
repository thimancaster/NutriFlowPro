import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, Database, Edit2, Save, RefreshCw, Filter, 
  ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Loader2 
} from 'lucide-react';

interface Food {
  id: string;
  nome: string;
  categoria: string;
  subcategoria: string | null;
  tipo_refeicao_sugerida: string[] | null;
  kcal_por_referencia: number;
  ptn_g_por_referencia: number;
  cho_g_por_referencia: number;
  lip_g_por_referencia: number;
  medida_padrao_referencia: string;
  peso_referencia_g: number;
}

interface CategoryStats {
  categoria: string;
  count: number;
}

const CATEGORIES = [
  'Carnes Bovinas',
  'Carnes Suínas',
  'Aves',
  'Peixes e Frutos do Mar',
  'Ovos',
  'Laticínios',
  'Cereais e Grãos',
  'Massas',
  'Pães e Padaria',
  'Leguminosas',
  'Verduras e Legumes',
  'Frutas',
  'Tubérculos',
  'Castanhas e Sementes',
  'Óleos e Gorduras',
  'Bebidas',
  'Doces e Sobremesas',
  'Lanches e Salgados',
  'Embutidos',
  'Outros',
];

const MEAL_TYPES = [
  { value: 'cafe_manha', label: 'Café da Manhã' },
  { value: 'lanche', label: 'Lanche' },
  { value: 'almoco', label: 'Almoço' },
  { value: 'jantar', label: 'Jantar' },
  { value: 'sobremesa', label: 'Sobremesa' },
];

const AdminFoods: React.FC = () => {
  const { toast } = useToast();
  const [foods, setFoods] = useState<Food[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Outros');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;
  
  // Edit dialog
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [editForm, setEditForm] = useState({
    categoria: '',
    subcategoria: '',
    tipo_refeicao_sugerida: [] as string[],
  });

  // Load category stats
  useEffect(() => {
    loadCategoryStats();
  }, []);

  // Load foods when filters change
  useEffect(() => {
    loadFoods();
  }, [selectedCategory, page, searchTerm]);

  const loadCategoryStats = async () => {
    const { data, error } = await supabase
      .from('alimentos_v2')
      .select('categoria')
      .eq('ativo', true);

    if (error) {
      console.error('Error loading stats:', error);
      return;
    }

    const stats: Record<string, number> = {};
    data?.forEach(item => {
      stats[item.categoria] = (stats[item.categoria] || 0) + 1;
    });

    const statsArray = Object.entries(stats)
      .map(([categoria, count]) => ({ categoria, count }))
      .sort((a, b) => b.count - a.count);

    setCategoryStats(statsArray);
  };

  const loadFoods = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('alimentos_v2')
        .select('id, nome, categoria, subcategoria, tipo_refeicao_sugerida, kcal_por_referencia, ptn_g_por_referencia, cho_g_por_referencia, lip_g_por_referencia, medida_padrao_referencia, peso_referencia_g', { count: 'exact' })
        .eq('ativo', true);

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('categoria', selectedCategory);
      }

      if (searchTerm) {
        query = query.ilike('nome', `%${searchTerm}%`);
      }

      query = query
        .order('nome', { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      setFoods(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error loading foods:', error);
      toast({
        title: 'Erro ao carregar alimentos',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditFood = (food: Food) => {
    setEditingFood(food);
    setEditForm({
      categoria: food.categoria,
      subcategoria: food.subcategoria || '',
      tipo_refeicao_sugerida: food.tipo_refeicao_sugerida || [],
    });
  };

  const handleSaveFood = async () => {
    if (!editingFood) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('alimentos_v2')
        .update({
          categoria: editForm.categoria,
          subcategoria: editForm.subcategoria || null,
          tipo_refeicao_sugerida: editForm.tipo_refeicao_sugerida,
        })
        .eq('id', editingFood.id);

      if (error) throw error;

      toast({
        title: 'Alimento atualizado',
        description: `${editingFood.nome} foi atualizado com sucesso.`,
      });

      setEditingFood(null);
      loadFoods();
      loadCategoryStats();
    } catch (error) {
      console.error('Error saving food:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível atualizar o alimento.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMealTypeToggle = (mealType: string) => {
    setEditForm(prev => ({
      ...prev,
      tipo_refeicao_sugerida: prev.tipo_refeicao_sugerida.includes(mealType)
        ? prev.tipo_refeicao_sugerida.filter(t => t !== mealType)
        : [...prev.tipo_refeicao_sugerida, mealType],
    }));
  };

  const outrosCount = categoryStats.find(s => s.categoria === 'Outros')?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Admin - Gestão de Alimentos | NutriFlow Pro</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            Gestão de Alimentos
          </h1>
          <p className="text-muted-foreground">
            Administre categorias e metadados dos alimentos da base de dados
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {categoryStats.slice(0, 6).map(stat => (
            <Card 
              key={stat.categoria} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === stat.categoria ? 'ring-2 ring-primary' : ''
              } ${stat.categoria === 'Outros' ? 'border-yellow-500' : ''}`}
              onClick={() => {
                setSelectedCategory(stat.categoria);
                setPage(0);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl font-bold">{stat.count}</span>
                  {stat.categoria === 'Outros' && (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate" title={stat.categoria}>
                  {stat.categoria}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alert for "Outros" */}
        {outrosCount > 0 && (
          <Card className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="p-4 flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                  {outrosCount} alimentos precisam de categorização
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Clique em "Outros" acima para filtrar e corrigir as categorias manualmente.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(0);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-64">
                <Select value={selectedCategory} onValueChange={(v) => {
                  setSelectedCategory(v);
                  setPage(0);
                }}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={() => loadFoods()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Foods Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Alimentos ({totalCount})</CardTitle>
                <CardDescription>
                  {selectedCategory === 'all' ? 'Todos os alimentos' : `Categoria: ${selectedCategory}`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Página {page + 1} de {totalPages || 1}</span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Tipo Refeição</TableHead>
                      <TableHead className="text-right">Kcal</TableHead>
                      <TableHead className="text-right">PTN</TableHead>
                      <TableHead className="text-right">CHO</TableHead>
                      <TableHead className="text-right">LIP</TableHead>
                      <TableHead className="w-[80px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {foods.map(food => (
                      <TableRow key={food.id}>
                        <TableCell className="font-medium">
                          <div>
                            {food.nome}
                            <div className="text-xs text-muted-foreground">
                              {food.peso_referencia_g}g - {food.medida_padrao_referencia}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={food.categoria === 'Outros' ? 'destructive' : 'secondary'}
                          >
                            {food.categoria}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {food.tipo_refeicao_sugerida?.map(tipo => (
                              <Badge key={tipo} variant="outline" className="text-xs">
                                {MEAL_TYPES.find(m => m.value === tipo)?.label || tipo}
                              </Badge>
                            ))}
                            {(!food.tipo_refeicao_sugerida || food.tipo_refeicao_sugerida.length === 0) && (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{food.kcal_por_referencia}</TableCell>
                        <TableCell className="text-right">{food.ptn_g_por_referencia}g</TableCell>
                        <TableCell className="text-right">{food.cho_g_por_referencia}g</TableCell>
                        <TableCell className="text-right">{food.lip_g_por_referencia}g</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditFood(food)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingFood} onOpenChange={() => setEditingFood(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Alimento</DialogTitle>
            </DialogHeader>
            
            {editingFood && (
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Nome</Label>
                  <p className="font-medium">{editingFood.nome}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select 
                    value={editForm.categoria} 
                    onValueChange={(v) => setEditForm(prev => ({ ...prev, categoria: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategoria">Subcategoria (opcional)</Label>
                  <Input
                    id="subcategoria"
                    value={editForm.subcategoria}
                    onChange={(e) => setEditForm(prev => ({ ...prev, subcategoria: e.target.value }))}
                    placeholder="Ex: Integral, Light, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipos de Refeição Sugerida</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {MEAL_TYPES.map(meal => (
                      <div key={meal.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={meal.value}
                          checked={editForm.tipo_refeicao_sugerida.includes(meal.value)}
                          onCheckedChange={() => handleMealTypeToggle(meal.value)}
                        />
                        <label htmlFor={meal.value} className="text-sm cursor-pointer">
                          {meal.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground mb-2">Info Nutricional (por {editingFood.peso_referencia_g}g)</p>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Kcal:</span>
                      <span className="ml-1 font-medium">{editingFood.kcal_por_referencia}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">PTN:</span>
                      <span className="ml-1 font-medium">{editingFood.ptn_g_por_referencia}g</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CHO:</span>
                      <span className="ml-1 font-medium">{editingFood.cho_g_por_referencia}g</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">LIP:</span>
                      <span className="ml-1 font-medium">{editingFood.lip_g_por_referencia}g</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingFood(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveFood} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminFoods;
