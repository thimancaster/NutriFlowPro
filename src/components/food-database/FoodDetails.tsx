import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Clock, Utensils, Info, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getFoodDetails, getNutritionalValues, getFoodRestrictions } from '@/integrations/supabase/functions';

interface FoodDetail {
  id: string;
  name: string;
  brand?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  caloric_density?: string;
  glycemic_index?: string;
  source?: string;
}

interface FoodMeasure {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  type?: string;
  is_default: boolean;
}

interface NutritionalValue {
  id?: string;
  measure_id?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  potassium?: number;
  calcium?: number;
  iron?: number;
  vitamin_a?: number;
  vitamin_c?: number;
  vitamin_d?: number;
  vitamin_e?: number;
}

interface FoodRestriction {
  id: string;
  restriction_name: string;
}

interface FoodDetailsProps {
  foodId: string;
}

const FoodDetails: React.FC<FoodDetailsProps> = ({ foodId }) => {
  const [food, setFood] = useState<FoodDetail | null>(null);
  const [measures, setMeasures] = useState<FoodMeasure[]>([]);
  const [selectedMeasure, setSelectedMeasure] = useState<string | null>(null);
  const [nutritionalValues, setNutritionalValues] = useState<NutritionalValue | null>(null);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('nutrition');
  const { toast } = useToast();

  useEffect(() => {
    const fetchFoodData = async () => {
      setLoading(true);
      try {
        // Get food details
        const foodData = await getFoodDetails(foodId);
        
        if (foodData) {
          setFood(foodData);
          
          // Create a default measure based on portion info
          const defaultMeasure: FoodMeasure = {
            id: foodId,
            name: 'Porção',
            quantity: 100,
            unit: 'g',
            is_default: true
          };
          
          setMeasures([defaultMeasure]);
          setSelectedMeasure(defaultMeasure.id);
          
          // Get nutritional values
          const nutritionData = await getNutritionalValues(foodId);
          if (nutritionData) {
            setNutritionalValues(nutritionData);
          }
          
          // Get food restrictions (if implemented)
          const restrictionsData = await getFoodRestrictions(foodId);
          if (restrictionsData && Array.isArray(restrictionsData)) {
            setRestrictions(restrictionsData.map(r => r.restriction_name));
          }
        }
      } catch (error) {
        console.error('Error fetching food details:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os detalhes do alimento.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (foodId) {
      fetchFoodData();
    }
  }, [foodId, toast]);

  const handleSelectMeasure = (measureId: string) => {
    setSelectedMeasure(measureId);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!food) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-10">
          <AlertTriangle className="h-10 w-10 text-amber-500 mb-2" />
          <h3 className="text-lg font-semibold">Alimento não encontrado</h3>
          <p className="text-muted-foreground">
            Não foi possível encontrar informações para este alimento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{food.name}</CardTitle>
        {food.brand && <p className="text-muted-foreground">{food.brand}</p>}
        <div className="flex flex-wrap gap-2 mt-2">
          {food.category && (
            <Badge variant="secondary">{food.category}</Badge>
          )}
          {food.subcategory && (
            <Badge variant="outline">{food.subcategory}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="nutrition">
              <Utensils className="mr-2 h-4 w-4" />
              Valores Nutricionais
            </TabsTrigger>
            <TabsTrigger value="info">
              <Info className="mr-2 h-4 w-4" />
              Informações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nutrition">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Medida:</label>
                {measures.length > 0 && (
                  <Select
                    value={selectedMeasure || ''}
                    onValueChange={handleSelectMeasure}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma medida" />
                    </SelectTrigger>
                    <SelectContent>
                      {measures.map((measure) => (
                        <SelectItem key={measure.id} value={measure.id}>
                          {measure.name} ({measure.quantity} {measure.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {nutritionalValues && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Macronutrientes</h3>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      <div className="border rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground">Calorias</p>
                        <p className="font-bold">{nutritionalValues.calories} kcal</p>
                      </div>
                      <div className="border rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground">Proteína</p>
                        <p className="font-bold">{nutritionalValues.protein} g</p>
                      </div>
                      <div className="border rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground">Carboidratos</p>
                        <p className="font-bold">{nutritionalValues.carbs} g</p>
                      </div>
                      <div className="border rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground">Gorduras</p>
                        <p className="font-bold">{nutritionalValues.fat} g</p>
                      </div>
                    </div>
                  </div>

                  {(nutritionalValues.fiber || nutritionalValues.sugar) && (
                    <div>
                      <h3 className="font-semibold">Detalhamento de Carboidratos</h3>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {nutritionalValues.fiber !== undefined && (
                          <div className="border rounded-lg p-3 text-center">
                            <p className="text-xs text-muted-foreground">Fibras</p>
                            <p className="font-bold">{nutritionalValues.fiber} g</p>
                          </div>
                        )}
                        {nutritionalValues.sugar !== undefined && (
                          <div className="border rounded-lg p-3 text-center">
                            <p className="text-xs text-muted-foreground">Açúcares</p>
                            <p className="font-bold">{nutritionalValues.sugar} g</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="info">
            <div className="space-y-4">
              {food.description && (
                <div>
                  <h3 className="font-semibold mb-1">Descrição</h3>
                  <p>{food.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {food.caloric_density && (
                  <div>
                    <h3 className="text-sm font-semibold">Densidade Calórica</h3>
                    <p>{food.caloric_density}</p>
                  </div>
                )}
                {food.glycemic_index && (
                  <div>
                    <h3 className="text-sm font-semibold">Índice Glicêmico</h3>
                    <p>{food.glycemic_index}</p>
                  </div>
                )}
              </div>

              {food.source && (
                <div>
                  <h3 className="text-sm font-semibold">Fonte</h3>
                  <p>{food.source}</p>
                </div>
              )}

              {restrictions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Restrições Alimentares</h3>
                  <div className="flex flex-wrap gap-1">
                    {restrictions.map((restriction) => (
                      <Badge key={restriction} variant="destructive">
                        {restriction}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FoodDetails;
