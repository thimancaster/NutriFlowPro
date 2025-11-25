import React from 'react';
import { Button } from '@/components/ui/button';
import { Utensils, Search } from 'lucide-react';

interface EmptyMealStateProps {
  mealName: string;
  onSearchClick?: () => void;
}

export const EmptyMealState: React.FC<EmptyMealStateProps> = ({ 
  mealName,
  onSearchClick 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Utensils className="h-8 w-8 text-muted-foreground" />
      </div>
      <h4 className="font-medium text-lg">Refeição vazia</h4>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        Busque alimentos no painel à esquerda e clique para adicionar ao {mealName}
      </p>
      {onSearchClick && (
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={onSearchClick}
        >
          <Search className="h-4 w-4 mr-2" />
          Buscar alimentos
        </Button>
      )}
    </div>
  );
};
