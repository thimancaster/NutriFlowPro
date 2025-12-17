import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X, Loader2 } from 'lucide-react';
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
import { cn } from '@/lib/utils';

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
  const inputRef = useRef<HTMLInputElement>(null);

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
    limit: 100, // Increased limit for better results
  });

  // Get categories
  const { data: categories = [] } = useQuery({
    queryKey: ['food-categories'],
    queryFn: getFoodCategories,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to clear search
      if (e.key === 'Escape' && searchQuery) {
        e.preventDefault();
        setSearchQuery('');
        setSelectedCategory(null);
        inputRef.current?.focus();
      }
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

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
      <Card className="h-full flex flex-col overflow-hidden">
        {/* Sticky Search Header */}
        <CardHeader className="sticky top-0 z-10 bg-card border-b space-y-3 pb-3 shrink-0">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-base font-semibold">
              <Search className="h-4 w-4" />
              Buscar Alimentos
            </span>
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </CardTitle>

          {/* Search Input - Larger and more prominent */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              placeholder="Digite: açaí, pão, frango..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base rounded-lg border-2 focus:border-primary"
            />
            {searchQuery ? (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-destructive/10"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            ) : isSearching ? (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            ) : null}
          </div>

          {/* Quick Category Chips */}
          {categories.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
              <Badge
                variant={!selectedCategory ? "default" : "outline"}
                className={cn(
                  "cursor-pointer whitespace-nowrap transition-all text-xs shrink-0",
                  !selectedCategory && "bg-primary text-primary-foreground"
                )}
                onClick={() => setSelectedCategory(null)}
              >
                Todos
              </Badge>
              {categories.slice(0, 6).map((cat) => (
                <Badge
                  key={cat.name}
                  variant={selectedCategory === cat.name ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer whitespace-nowrap transition-all text-xs shrink-0",
                    selectedCategory === cat.name && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                >
                  {cat.name}
                  <span className="ml-1 opacity-60">({cat.count})</span>
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* Search Results */}
              {showSearchResults && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between sticky top-0 bg-card py-2 -mt-2">
                    <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                      Resultados
                      <Badge variant="secondary" className="font-normal">
                        {foods.length} encontrados
                      </Badge>
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory(null);
                      }}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Limpar
                    </Button>
                  </div>

                  {isSearching ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : foods.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <p className="text-muted-foreground">
                        Nenhum alimento encontrado para "{searchQuery}"
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tente buscar sem acentos ou termos mais simples
                      </p>
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
                      height={Math.min(500, Math.max(300, foods.length * 72))}
                      itemHeight={72}
                    />
                  )}
                </div>
              )}

              {/* Category Grid and Popular/Most Used (when no search) */}
              {!showSearchResults && (
                <>
                  <CategoryFilterGrid
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                  />

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
                </>
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
