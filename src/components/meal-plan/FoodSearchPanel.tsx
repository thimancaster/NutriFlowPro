import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { useFoodSearch } from '@/hooks/useFoodSearch';
import { PopularFoodsSuggestions } from './PopularFoodsSuggestions';
import { CategoryFilterGrid } from './CategoryFilterGrid';
import { QuickAddDialog } from './QuickAddDialog';
import { VirtualizedFoodList } from './VirtualizedFoodList';
import type { AlimentoV2 } from '@/services/enhancedFoodSearchService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getFoodCategories } from '@/services/enhancedFoodSearchService';
import { useQuery } from '@tanstack/react-query';

interface FoodSearchPanelProps {
  onFoodSelect: (food: AlimentoV2, quantity: number) => void;
  activeMealType: string;
}

export const FoodSearchPanel: React.FC<FoodSearchPanelProps> = ({
  onFoodSelect,
  activeMealType,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dialogFood, setDialogFood] = useState<AlimentoV2 | null>(null);

  const {
    foods,
    mostUsedFoods,
    popularFoods,
    isSearching,
    filters,
    updateFilters,
    toggleFavorite,
    trackUsage,
  } = useFoodSearch({
    query: searchQuery,
    category: selectedCategory || undefined,
    limit: 50,
  });

  // Get categories
  const { data: categories = [] } = useQuery({
    queryKey: ['food-categories'],
    queryFn: getFoodCategories,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Quick add (1 portion)
  const handleQuickAdd = (food: AlimentoV2) => {
    onFoodSelect(food, 1);
    if (food.id) {
      trackUsage(food.id);
    }
  };

  // Detailed add (show dialog)
  const handleDetailedAdd = (food: AlimentoV2) => {
    setDialogFood(food);
  };

  // Confirm from dialog
  const handleDialogConfirm = (quantity: number) => {
    if (dialogFood) {
      onFoodSelect(dialogFood, quantity);
      if (dialogFood.id) {
        trackUsage(dialogFood.id);
      }
    }
    setDialogFood(null);
  };

  const showSearchResults = searchQuery.trim() || selectedCategory;

  return (
    <>
      <Card className="h-full flex flex-col">
        {/* Sticky Search Header */}
        <CardHeader className="sticky top-0 z-10 bg-card border-b space-y-3 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Buscar Alimentos
          </CardTitle>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Digite o nome do alimento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-11 text-base"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Quick Category Filters */}
          {!showSearchResults && categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {categories.slice(0, 5).map((cat) => (
                <Badge
                  key={cat.name}
                  variant={selectedCategory === cat.name ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap hover:bg-accent transition-colors"
                  onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-4">
          <ScrollArea className="h-full pr-2">
            <div className="space-y-6">
              {/* Category Filters */}
              {!showSearchResults && (
                <CategoryFilterGrid
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              )}

              {/* Search Results */}
              {showSearchResults && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-foreground">
                      Resultados ({foods.length})
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory(null);
                      }}
                      className="h-7 text-xs"
                    >
                      Limpar
                    </Button>
                  </div>

                  {isSearching ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-28 w-full" />
                      ))}
                    </div>
                  ) : (
                    <VirtualizedFoodList
                      foods={foods}
                      onQuickAdd={handleQuickAdd}
                      onDetailedAdd={handleDetailedAdd}
                      onToggleFavorite={(food) =>
                        toggleFavorite({
                          alimentoId: food.id,
                          isFavorite: food.is_favorite || false,
                        })
                      }
                      height={Math.min(400, Math.max(200, foods.length * 100))}
                    />
                  )}
                </div>
              )}

              {/* Popular & Most Used (when no search) */}
              {!showSearchResults && (
                <PopularFoodsSuggestions
                  foods={popularFoods}
                  mostUsedFoods={mostUsedFoods}
                  onSelect={handleQuickAdd}
                  onDetailedAdd={handleDetailedAdd}
                  onToggleFavorite={(f) =>
                    toggleFavorite({
                      alimentoId: f.id,
                      isFavorite: f.is_favorite || false,
                    })
                  }
                />
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Quick Add Dialog */}
      <QuickAddDialog
        food={dialogFood}
        open={!!dialogFood}
        onConfirm={handleDialogConfirm}
        onCancel={() => setDialogFood(null)}
      />
    </>
  );
};
