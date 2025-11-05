import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wheat, 
  Beef, 
  Apple, 
  Salad, 
  Milk, 
  Sandwich,
  Fish,
  Droplet,
  Cookie
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  name: string;
  count: number;
}

interface CategoryFilterGridProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

// Map category names to icons
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('cereal') || name.includes('arroz') || name.includes('massa')) {
    return Wheat;
  }
  if (name.includes('carne') || name.includes('bovina')) {
    return Beef;
  }
  if (name.includes('fruta')) {
    return Apple;
  }
  if (name.includes('vegetal') || name.includes('verdura') || name.includes('legume')) {
    return Salad;
  }
  if (name.includes('latic') || name.includes('leite') || name.includes('queijo')) {
    return Milk;
  }
  if (name.includes('pão') || name.includes('pães')) {
    return Sandwich;
  }
  if (name.includes('peixe') || name.includes('fruto do mar')) {
    return Fish;
  }
  if (name.includes('óleo') || name.includes('gordura')) {
    return Droplet;
  }
  if (name.includes('doce') || name.includes('açúcar')) {
    return Cookie;
  }
  return Wheat; // default
};

export const CategoryFilterGrid: React.FC<CategoryFilterGridProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">Categorias</h3>
        {selectedCategory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectCategory(null)}
            className="h-7 text-xs"
          >
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.name);
          const isSelected = selectedCategory === category.name;

          return (
            <Button
              key={category.name}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                onSelectCategory(isSelected ? null : category.name)
              }
              className={cn(
                'h-auto py-3 flex-col items-start gap-1 text-left',
                isSelected && 'ring-2 ring-primary'
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-xs font-medium truncate flex-1">
                  {category.name}
                </span>
              </div>
              <Badge
                variant={isSelected ? 'secondary' : 'outline'}
                className="text-xs h-5"
              >
                {category.count}
              </Badge>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
