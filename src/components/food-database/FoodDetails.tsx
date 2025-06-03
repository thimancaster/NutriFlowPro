
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { getFoodDetails } from '@/integrations/supabase/functions';
import NutritionalAnalysis from './NutritionalAnalysis';

interface FoodDetail {
  id: string;
  name: string;
  food_group: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sodium?: number;
  sugar?: number;
  saturated_fat?: number;
  glycemic_index?: number;
  is_organic?: boolean;
  allergens?: string[];
  season?: string[];
  preparation_time?: number;
  cost_level?: string;
  availability?: string;
  sustainability_score?: number;
  serving_suggestion?: string;
  portion_size: number;
  portion_unit: string;
  nutritional_info?: any;
}

interface FoodDetailsProps {
  foodId: string;
  onBack: () => void;
  onEdit?: (food: FoodDetail) => void;
  onDelete?: (foodId: string) => void;
}

const FoodDetails: React.FC<FoodDetailsProps> = ({
  foodId,
  onBack,
  onEdit,
  onDelete
}) => {
  const [food, setFood] = useState<FoodDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFoodDetails();
  }, [foodId]);

  const loadFoodDetails = async () => {
    try {
      setLoading(true);
      const foodData = await getFoodDetails(foodId);
      if (foodData) {
        // Fix the type conversion for glycemic_index
        const formattedFood: FoodDetail = {
          ...foodData,
          glycemic_index: foodData.glycemic_index ? Number(foodData.glycemic_index) : undefined
        };
        setFood(formattedFood);
      }
    } catch (error) {
      console.error('Error loading food details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes do alimento...</p>
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 mb-4">Alimento não encontrado.</p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <div className="flex gap-2">
          {onEdit && (
            <Button onClick={() => onEdit(food)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button 
              onClick={() => onDelete(food.id)} 
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          )}
        </div>
      </div>

      {/* Food Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {food.name}
            {food.is_organic && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Orgânico
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Informações Básicas</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Grupo:</span> {food.food_group}</div>
                <div><span className="font-medium">Porção:</span> {food.portion_size}{food.portion_unit}</div>
                {food.preparation_time && (
                  <div><span className="font-medium">Tempo de preparo:</span> {food.preparation_time} min</div>
                )}
                {food.cost_level && (
                  <div><span className="font-medium">Custo:</span> {food.cost_level}</div>
                )}
                {food.availability && (
                  <div><span className="font-medium">Disponibilidade:</span> {food.availability}</div>
                )}
              </div>
            </div>

            {food.serving_suggestion && (
              <div>
                <h3 className="font-semibold mb-2">Sugestão de Consumo</h3>
                <p className="text-sm text-gray-600">{food.serving_suggestion}</p>
              </div>
            )}
          </div>

          {food.season && food.season.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Sazonalidade</h3>
              <div className="flex flex-wrap gap-1">
                {food.season.map((season) => (
                  <Badge key={season} variant="secondary">
                    {season}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nutritional Analysis */}
      <NutritionalAnalysis food={food} />
    </div>
  );
};

export default FoodDetails;
