import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Star } from 'lucide-react';
import { QuickAddFoodCard } from './QuickAddFoodCard';
import type { AlimentoV2 } from '@/services/enhancedFoodSearchService';
import { Skeleton } from '@/components/ui/skeleton';

interface PopularFoodsSuggestionsProps {
  foods: AlimentoV2[];
  mostUsedFoods?: AlimentoV2[];
  onSelect: (food: AlimentoV2) => void;
  onDetailedAdd: (food: AlimentoV2) => void;
  onToggleFavorite?: (food: AlimentoV2) => void;
  loading?: boolean;
}

export const PopularFoodsSuggestions: React.FC<PopularFoodsSuggestionsProps> = ({
  foods,
  mostUsedFoods = [],
  onSelect,
  onDetailedAdd,
  onToggleFavorite,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Most Used by User */}
      {mostUsedFoods.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">Seus Favoritos</h3>
          </div>
          <div className="grid gap-2">
            {mostUsedFoods.slice(0, 5).map((food) => (
              <QuickAddFoodCard
                key={food.id}
                food={food}
                onQuickAdd={onSelect}
                onDetailedAdd={onDetailedAdd}
                onToggleFavorite={onToggleFavorite}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {/* Globally Popular */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Mais Usados</h3>
        </div>
        <div className="grid gap-2">
          {foods.slice(0, 10).map((food) => (
            <QuickAddFoodCard
              key={food.id}
              food={food}
              onQuickAdd={onSelect}
              onDetailedAdd={onDetailedAdd}
              onToggleFavorite={onToggleFavorite}
              isPopular
              compact
            />
          ))}
        </div>
      </div>
    </div>
  );
};
