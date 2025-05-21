import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { UtensilsCrossed } from 'lucide-react';

interface FoodListProps {
  searchTerm: string;
  categoryId: string | null;
  onFoodSelect: (foodId: string) => void;
}

interface Food {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const FoodList: React.FC<FoodListProps> = ({ searchTerm, categoryId, onFoodSelect }) => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);
      try {
        // Build query
        let query = supabase.from('foods').select(`
          id,
          name,
          food_group,
          calories,
          protein,
          carbs,
          fats
        `);

        // Apply filters
        if (searchTerm) {
          query = query.ilike('name', `%${searchTerm}%`);
        }

        if (categoryId) {
          query = query.eq('category', categoryId);
        }

        // Execute query
        const { data, error } = await query.order('name').limit(50);

        if (error) {
          throw error;
        }

        // Transform data to match Food interface
        const transformedData = data.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.food_group,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats
        }));

        setFoods(transformedData || []);
      } catch (error) {
        console.error('Error fetching foods:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os alimentos.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, [searchTerm, categoryId, toast]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex space-x-2 mt-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (foods.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Nenhum alimento encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {foods.map((food) => (
        <Card 
          key={food.id} 
          className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
          onClick={() => onFoodSelect(food.id)}
        >
          <CardContent className="p-4">
            <h3 className="font-medium text-base truncate">{food.name}</h3>
            {food.brand && (
              <p className="text-sm text-muted-foreground truncate">{food.brand}</p>
            )}
            {food.category && (
              <Badge variant="outline" className="mt-1">
                {food.category}
              </Badge>
            )}
            <div className="flex justify-between mt-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Calorias</p>
                <p className="font-medium">{food.calories}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Proteína</p>
                <p className="font-medium">{food.protein}g</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Carbs</p>
                <p className="font-medium">{food.carbs}g</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Gordura</p>
                <p className="font-medium">{food.fats}g</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FoodList;
