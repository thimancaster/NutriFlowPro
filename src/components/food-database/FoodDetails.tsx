
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Leaf, 
  Clock, 
  Award, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Plus
} from 'lucide-react';
import { getFoodDetails, getFoodSubstitutions, calculateNutritionalDensity } from '@/integrations/supabase/functions';
import { useToast } from '@/hooks/use-toast';

interface FoodDetailsProps {
  foodId: string;
  onBack: () => void;
}

const FoodDetails: React.FC<FoodDetailsProps> = ({ foodId, onBack }) => {
  const [food, setFood] = useState<any>(null);
  const [substitutions, setSubstitutions] = useState<any[]>([]);
  const [nutritionalDensity, setNutritionalDensity] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFoodDetails();
  }, [foodId]);

  const loadFoodDetails = async () => {
    setLoading(true);
    try {
      const [foodData, substitutionsData, densityScore] = await Promise.all([
        getFoodDetails(foodId),
        getFoodSubstitutions(foodId),
        calculateNutritionalDensity(foodId)
      ]);

      setFood(foodData);
      setSubstitutions(substitutionsData);
      setNutritionalDensity(densityScore);
    } catch (error) {
      console.error('Error loading food details:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do alimento.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addToMealPlan = () => {
    // Integração com o sistema de planos alimentares
    toast({
      title: 'Funcionalidade em desenvolvimento',
      description: 'A integração com planos alimentares será implementada em breve.',
    });
  };

  if (loading || !food) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-40 bg-muted rounded"></div>
            <div className="h-40 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const macroTotal = food.protein + food.carbs + food.fats;
  const proteinPercentage = macroTotal > 0 ? (food.protein * 4 / food.calories) * 100 : 0;
  const carbsPercentage = macroTotal > 0 ? (food.carbs * 4 / food.calories) * 100 : 0;
  const fatsPercentage = macroTotal > 0 ? (food.fats * 9 / food.calories) * 100 : 0;

  const getNutritionalGrade = (density: number) => {
    if (density >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (density >= 60) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (density >= 40) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const grade = getNutritionalGrade(nutritionalDensity);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar à busca
        </Button>
        <Button onClick={addToMealPlan}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar ao Plano
        </Button>
      </div>

      {/* Food Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{food.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{food.food_group}</Badge>
            {food.is_organic && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <Leaf className="h-3 w-3 mr-1" />
                Orgânico
              </Badge>
            )}
            {food.preparation_time && food.preparation_time > 0 && (
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {food.preparation_time} min preparo
              </Badge>
            )}
            <Badge className={`${grade.bg} ${grade.color} border-0`}>
              <Award className="h-3 w-3 mr-1" />
              Nota {grade.grade}
            </Badge>
          </div>
        </div>

        <p className="text-muted-foreground">
          Porção de referência: {food.portion_size}{food.portion_unit}
        </p>
      </div>

      <Tabs defaultValue="nutrition" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="nutrition">Nutrição</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
          <TabsTrigger value="substitutions">Substituições</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>

        <TabsContent value="nutrition" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Macronutrients */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informação Nutricional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{food.calories}</p>
                    <p className="text-sm text-muted-foreground">Calorias</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{food.protein}g</p>
                    <p className="text-sm text-muted-foreground">Proteína</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{food.carbs}g</p>
                    <p className="text-sm text-muted-foreground">Carboidratos</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{food.fats}g</p>
                    <p className="text-sm text-muted-foreground">Gorduras</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Distribuição Calórica</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Proteína ({Math.round(proteinPercentage)}%)</span>
                      <span>{Math.round(food.protein * 4)} kcal</span>
                    </div>
                    <Progress value={proteinPercentage} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Carboidratos ({Math.round(carbsPercentage)}%)</span>
                      <span>{Math.round(food.carbs * 4)} kcal</span>
                    </div>
                    <Progress value={carbsPercentage} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Gorduras ({Math.round(fatsPercentage)}%)</span>
                      <span>{Math.round(food.fats * 9)} kcal</span>
                    </div>
                    <Progress value={fatsPercentage} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Nutrients */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nutrientes Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {food.fiber > 0 && (
                  <div className="flex justify-between">
                    <span>Fibras</span>
                    <span className="font-medium">{food.fiber}g</span>
                  </div>
                )}
                {food.sodium > 0 && (
                  <div className="flex justify-between">
                    <span>Sódio</span>
                    <span className="font-medium">{food.sodium}mg</span>
                  </div>
                )}
                {food.sugar > 0 && (
                  <div className="flex justify-between">
                    <span>Açúcares</span>
                    <span className="font-medium">{food.sugar}g</span>
                  </div>
                )}
                {food.saturated_fat > 0 && (
                  <div className="flex justify-between">
                    <span>Gordura Saturada</span>
                    <span className="font-medium">{food.saturated_fat}g</span>
                  </div>
                )}
                {food.glycemic_index && (
                  <div className="flex justify-between">
                    <span>Índice Glicêmico</span>
                    <span className="font-medium">{food.glycemic_index}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Densidade Nutricional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${grade.bg} ${grade.color}`}>
                    <span className="text-2xl font-bold">{grade.grade}</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Math.round(nutritionalDensity)}/100</p>
                    <p className="text-sm text-muted-foreground">Pontuação nutricional</p>
                  </div>
                  <Progress value={nutritionalDensity} className="w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Características</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Sustentabilidade</span>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-1 text-green-600" />
                    <span>{food.sustainability_score || 'N/A'}/10</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Disponibilidade</span>
                  <Badge variant={food.availability === 'comum' ? 'default' : 'secondary'}>
                    {food.availability || 'Comum'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Custo</span>
                  <Badge variant="outline">
                    {food.cost_level || 'Médio'}
                  </Badge>
                </div>
                {food.season && food.season.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Época</span>
                    <span className="text-sm">{food.season.join(', ')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Allergens */}
          {food.allergens && food.allergens.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Alérgenos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {food.allergens.map((allergen: string) => (
                    <Badge key={allergen} variant="destructive">
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="substitutions" className="space-y-6">
          {substitutions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {substitutions.map((substitution) => (
                <Card key={substitution.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{substitution.substitute.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{substitution.reason}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Calorias: {substitution.substitute.calories}</div>
                      <div>Proteína: {substitution.substitute.protein}g</div>
                      <div>Carbs: {substitution.substitute.carbs}g</div>
                      <div>Gordura: {substitution.substitute.fats}g</div>
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Similaridade: {Math.round(substitution.nutritional_similarity?.total || 85)}%
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-10">
                <p className="text-muted-foreground">Nenhuma substituição disponível para este alimento.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Detalhadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {food.serving_suggestion && (
                <div>
                  <h4 className="font-medium mb-2">Sugestão de Consumo</h4>
                  <p className="text-sm text-muted-foreground">{food.serving_suggestion}</p>
                </div>
              )}
              
              {food.meal_time && food.meal_time.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Horários Recomendados</h4>
                  <div className="flex flex-wrap gap-2">
                    {food.meal_time.map((time: string) => (
                      <Badge key={time} variant="outline">
                        {time === 'breakfast' && 'Café da Manhã'}
                        {time === 'morning_snack' && 'Lanche da Manhã'}
                        {time === 'lunch' && 'Almoço'}
                        {time === 'afternoon_snack' && 'Lanche da Tarde'}
                        {time === 'dinner' && 'Jantar'}
                        {time === 'evening_snack' && 'Ceia'}
                        {time === 'any' && 'Qualquer horário'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {food.nutritional_info && Object.keys(food.nutritional_info).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Informações Nutricionais Adicionais</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <pre className="text-sm">{JSON.stringify(food.nutritional_info, null, 2)}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FoodDetails;
