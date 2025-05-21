
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, DownloadIcon, InfoIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface FoodDetailsProps {
  foodId: string;
}

interface FoodDetail {
  id: string;
  name: string;
  brand?: string;
  description?: string;
  category_name: string;
  subcategory_name: string;
  caloric_density?: string;
  glycemic_index?: string;
  source?: string;
}

interface NutritionalValue {
  id: string;
  measure_id: string;
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

interface FoodMeasure {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  type: string;
  is_default: boolean;
}

interface FoodRestriction {
  id: string;
  restriction_name: string;
}

const FoodDetails: React.FC<FoodDetailsProps> = ({ foodId }) => {
  const [food, setFood] = useState<FoodDetail | null>(null);
  const [measures, setMeasures] = useState<FoodMeasure[]>([]);
  const [selectedMeasure, setSelectedMeasure] = useState<string | null>(null);
  const [nutritionalValues, setNutritionalValues] = useState<NutritionalValue | null>(null);
  const [restrictions, setRestrictions] = useState<FoodRestriction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFoodDetails = async () => {
      setLoading(true);
      try {
        // Fetch food details
        const { data: foodData, error: foodError } = await supabase
          .from('foods')
          .select(`
            id,
            name,
            brand,
            description,
            caloric_density,
            glycemic_index,
            source,
            food_categories(name),
            food_subcategories(name)
          `)
          .eq('id', foodId)
          .single();

        if (foodError) throw foodError;

        setFood({
          id: foodData.id,
          name: foodData.name,
          brand: foodData.brand,
          description: foodData.description,
          category_name: foodData.food_categories?.name || '',
          subcategory_name: foodData.food_subcategories?.name || '',
          caloric_density: foodData.caloric_density,
          glycemic_index: foodData.glycemic_index,
          source: foodData.source
        });

        // Fetch measures
        const { data: measuresData, error: measuresError } = await supabase
          .from('food_measures')
          .select('id, name, quantity, unit, type, is_default')
          .eq('food_id', foodId)
          .order('is_default', { ascending: false });

        if (measuresError) throw measuresError;

        setMeasures(measuresData || []);

        // Set default measure
        if (measuresData && measuresData.length > 0) {
          const defaultMeasure = measuresData.find(m => m.is_default) || measuresData[0];
          setSelectedMeasure(defaultMeasure.id);
          
          // Fetch nutritional values for the default measure
          const { data: nutritionData, error: nutritionError } = await supabase
            .from('nutritional_values')
            .select('*')
            .eq('food_id', foodId)
            .eq('measure_id', defaultMeasure.id)
            .single();

          if (nutritionError && nutritionError.code !== 'PGRST116') {
            throw nutritionError;
          }

          setNutritionalValues(nutritionData || null);
        }

        // Fetch restrictions
        const { data: restrictionsData, error: restrictionsError } = await supabase
          .from('food_restrictions')
          .select(`
            id,
            restriction_types(name)
          `)
          .eq('food_id', foodId);

        if (restrictionsError) throw restrictionsError;

        setRestrictions(
          (restrictionsData || []).map(item => ({
            id: item.id,
            restriction_name: item.restriction_types.name
          }))
        );

      } catch (error) {
        console.error('Error fetching food details:', error);
        toast({
          title: 'Erro ao carregar detalhes',
          description: 'Não foi possível carregar os detalhes do alimento.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFoodDetails();
  }, [foodId]);

  const handleMeasureChange = async (measureId: string) => {
    setSelectedMeasure(measureId);
    try {
      const { data, error } = await supabase
        .from('nutritional_values')
        .select('*')
        .eq('food_id', foodId)
        .eq('measure_id', measureId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setNutritionalValues(data || null);
    } catch (error) {
      console.error('Error fetching nutritional values:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os valores nutricionais para esta medida.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!food) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <InfoIcon className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">Alimento não encontrado</h3>
          <p className="text-muted-foreground">
            O alimento selecionado não foi encontrado ou foi removido.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get the selected measure details
  const currentMeasure = measures.find(m => m.id === selectedMeasure);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{food.name}</CardTitle>
            <div className="text-muted-foreground mt-1 flex items-center space-x-2">
              <Badge variant="outline">{food.category_name}</Badge>
              {food.subcategory_name && <Badge variant="outline">{food.subcategory_name}</Badge>}
              {food.brand && <span>• {food.brand}</span>}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="nutrition">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="nutrition">Informações Nutricionais</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="nutrition">
            <div className="space-y-6">
              <div>
                <Label>Medida caseira</Label>
                <Select 
                  value={selectedMeasure || ''}
                  onValueChange={handleMeasureChange}
                >
                  <SelectTrigger className="w-full">
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
              </div>

              {currentMeasure && nutritionalValues ? (
                <div className="bg-background rounded-lg p-4 border">
                  <h3 className="font-semibold mb-4">
                    Valores nutricionais para {currentMeasure.name} ({currentMeasure.quantity} {currentMeasure.unit})
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-lg mb-2">Macronutrientes</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-primary/5 p-3 rounded-md">
                          <div className="text-sm text-muted-foreground">Calorias</div>
                          <div className="font-semibold text-lg">{nutritionalValues.calories} kcal</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-md">
                          <div className="text-sm text-muted-foreground">Proteínas</div>
                          <div className="font-semibold text-lg text-green-700">{nutritionalValues.protein}g</div>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-md">
                          <div className="text-sm text-muted-foreground">Gorduras</div>
                          <div className="font-semibold text-lg text-amber-700">{nutritionalValues.fat}g</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-md">
                          <div className="text-sm text-muted-foreground">Carboidratos</div>
                          <div className="font-semibold text-lg text-blue-700">{nutritionalValues.carbs}g</div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-2">Informações adicionais</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {nutritionalValues.fiber !== null && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fibras</span>
                            <span className="font-medium">{nutritionalValues.fiber}g</span>
                          </div>
                        )}
                        {nutritionalValues.sugar !== null && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Açúcares</span>
                            <span className="font-medium">{nutritionalValues.sugar}g</span>
                          </div>
                        )}
                        {nutritionalValues.sodium !== null && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sódio</span>
                            <span className="font-medium">{nutritionalValues.sodium}mg</span>
                          </div>
                        )}
                        {nutritionalValues.potassium !== null && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Potássio</span>
                            <span className="font-medium">{nutritionalValues.potassium}mg</span>
                          </div>
                        )}
                        {nutritionalValues.calcium !== null && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Cálcio</span>
                            <span className="font-medium">{nutritionalValues.calcium}mg</span>
                          </div>
                        )}
                        {nutritionalValues.iron !== null && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ferro</span>
                            <span className="font-medium">{nutritionalValues.iron}mg</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-lg p-6 text-center">
                  <p className="text-muted-foreground">
                    Não há informações nutricionais disponíveis para este alimento e medida.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="details">
            <div className="space-y-6">
              {food.description && (
                <div>
                  <h3 className="font-semibold mb-2">Descrição</h3>
                  <p className="text-muted-foreground">{food.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {food.caloric_density && (
                  <div className="bg-muted/30 p-3 rounded-md">
                    <h4 className="text-sm font-medium">Densidade calórica</h4>
                    <p>{food.caloric_density}</p>
                  </div>
                )}
                
                {food.glycemic_index && (
                  <div className="bg-muted/30 p-3 rounded-md">
                    <h4 className="text-sm font-medium">Índice glicêmico</h4>
                    <p>{food.glycemic_index}</p>
                  </div>
                )}
              </div>
              
              {restrictions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Restrições alimentares</h3>
                  <div className="flex flex-wrap gap-2">
                    {restrictions.map(restriction => (
                      <Badge key={restriction.id} variant="destructive">
                        {restriction.restriction_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {food.source && (
                <div>
                  <h3 className="font-semibold mb-2">Fonte</h3>
                  <p className="text-muted-foreground">{food.source}</p>
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
