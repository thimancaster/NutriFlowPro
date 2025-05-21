
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AppleIcon, 
  BreadIcon, 
  MeatIcon, 
  CoffeeIcon, 
  CheeseBurgerIcon, 
  EggIcon,
  SaladIcon,
  MilkIcon
} from "lucide-react";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Food {
  id: string;
  name: string;
  category_id: string;
  subcategory_id: string;
  category_name: string;
  subcategory_name: string;
}

interface FoodListProps {
  searchTerm: string;
  categoryId: string | null;
  onFoodSelect: (foodId: string) => void;
}

const FoodList: React.FC<FoodListProps> = ({ searchTerm, categoryId, onFoodSelect }) => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const pageSize = 20;

  const foodIcons: Record<string, React.ReactNode> = {
    'Frutas': <AppleIcon className="h-4 w-4" />,
    'Carboidratos': <BreadIcon className="h-4 w-4" />,
    'Proteínas': <MeatIcon className="h-4 w-4" />,
    'Bebidas': <CoffeeIcon className="h-4 w-4" />,
    'Gorduras': <CheeseBurgerIcon className="h-4 w-4" />,
    'Laticínios': <MilkIcon className="h-4 w-4" />,
    'Ovos': <EggIcon className="h-4 w-4" />,
    'Hortaliças': <SaladIcon className="h-4 w-4" />
  };

  const fetchFoods = async (resetPage = false) => {
    setLoading(true);
    const currentPage = resetPage ? 0 : page;

    if (resetPage) {
      setFoods([]);
      setPage(0);
    }

    try {
      let query = supabase
        .from('foods')
        .select(`
          id, 
          name, 
          category_id,
          subcategory_id,
          food_categories!inner(name),
          food_subcategories(name)
        `)
        .range(currentPage * pageSize, (currentPage + 1) * pageSize - 1)
        .order('name');

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const formattedData = data?.map(item => ({
        id: item.id,
        name: item.name,
        category_id: item.category_id,
        subcategory_id: item.subcategory_id,
        category_name: item.food_categories.name,
        subcategory_name: item.food_subcategories?.name || ''
      })) || [];

      if (resetPage) {
        setFoods(formattedData);
      } else {
        setFoods(prev => [...prev, ...formattedData]);
      }

      setHasMore(formattedData.length === pageSize);

      if (!resetPage) {
        setPage(currentPage + 1);
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
      toast({
        title: 'Erro ao carregar alimentos',
        description: 'Não foi possível carregar a lista de alimentos.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods(true);
  }, [searchTerm, categoryId]);

  const handleFoodClick = (foodId: string) => {
    onFoodSelect(foodId);
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[60vh]">
        {foods.length === 0 && !loading ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Nenhum alimento encontrado.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {foods.map((food) => (
              <Card 
                key={food.id} 
                className="hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handleFoodClick(food.id)}
              >
                <CardContent className="p-3 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      {foodIcons[food.category_name] || <AppleIcon className="h-4 w-4" />}
                    </div>
                    <div>
                      <h3 className="font-medium">{food.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{food.category_name}</span>
                        {food.subcategory_name && (
                          <>
                            <span>•</span>
                            <span>{food.subcategory_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">Detalhes</Badge>
                </CardContent>
              </Card>
            ))}

            {loading && (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-3">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {hasMore && foods.length > 0 && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => fetchFoods()} 
            disabled={loading}
          >
            Carregar mais
          </Button>
        </div>
      )}
    </div>
  );
};

export default FoodList;
