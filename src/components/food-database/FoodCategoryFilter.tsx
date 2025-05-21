
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';

interface FoodCategory {
  id: string;
  name: string;
  color?: string;
}

interface FoodCategoryFilterProps {
  onCategorySelect: (categoryId: string | null) => void;
  selectedCategory: string | null;
}

const FoodCategoryFilter: React.FC<FoodCategoryFilterProps> = ({ 
  onCategorySelect, 
  selectedCategory 
}) => {
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        // Use a direct query to the foods table to get distinct categories
        const { data, error } = await supabase
          .from('foods')
          .select('category_id, food_group')
          .not('category_id', 'is', null)
          .not('food_group', 'is', null)
          .order('food_group');

        if (error) {
          throw error;
        }

        // Transform the data into the expected format
        const uniqueCategories = Array.from(
          new Map(data.map(item => [item.category_id, {
            id: item.category_id,
            name: item.food_group
          }])).values()
        );

        setCategories(uniqueCategories || []);
      } catch (error) {
        console.error('Error fetching food categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium mb-3">Filtrar por categoria</h3>
      <RadioGroup 
        value={selectedCategory || ''} 
        onValueChange={(value) => onCategorySelect(value || null)}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="" id="all-categories" />
          <Label htmlFor="all-categories" className="cursor-pointer">
            Todas
          </Label>
        </div>
        
        {categories.map((category) => (
          <div key={category.id} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={category.id} 
              id={category.id} 
              style={{ borderColor: category.color }} 
            />
            <Label htmlFor={category.id} className="cursor-pointer">
              {category.name}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default FoodCategoryFilter;
