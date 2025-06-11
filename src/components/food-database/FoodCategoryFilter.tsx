
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getFoodCategories } from '@/integrations/supabase/functions';

interface FoodCategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

const FoodCategoryFilter: React.FC<FoodCategoryFilterProps> = ({ 
  selectedCategory, 
  onCategoryChange 
}) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await getFoodCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-1/4"></div>
        <div className="flex flex-wrap gap-2">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="h-8 bg-muted rounded w-20"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">Categorias</h3>
      <ScrollArea className="w-full">
        <div className="flex flex-wrap gap-2 pb-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(null)}
            className="h-8"
          >
            Todas
            {selectedCategory === null && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                ✓
              </Badge>
            )}
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category.id)}
              className="h-8"
              style={{
                borderColor: selectedCategory === category.id ? category.color : undefined,
                backgroundColor: selectedCategory === category.id ? category.color : undefined
              }}
            >
              {category.icon && (
                <span className="mr-1">{category.icon}</span>
              )}
              {category.name}
              {selectedCategory === category.id && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  ✓
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FoodCategoryFilter;
