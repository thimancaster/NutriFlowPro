/**
 * VIRTUALIZED FOOD LIST - OPTIMIZED
 * Uses react-window v2 for efficient rendering with FIXED heights
 * Performance optimized: no dynamic calculations, memoized components
 */

import React, { CSSProperties, ReactElement, memo, useCallback } from 'react';
import { List } from 'react-window';
import { QuickAddFoodCard } from './QuickAddFoodCard';
import type { AlimentoV2 } from '@/services/enhancedFoodSearchService';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

// FIXED HEIGHT - Critical for performance (no dynamic calculations)
const ITEM_HEIGHT = 76;
const LIST_HEIGHT = 400;

interface VirtualizedFoodListProps {
  foods: AlimentoV2[];
  onQuickAdd: (food: AlimentoV2) => void;
  onDetailedAdd: (food: AlimentoV2) => void;
  onToggleFavorite: (food: AlimentoV2) => void;
  height?: number;
  itemHeight?: number;
  onClearSearch?: () => void;
}

interface RowProps {
  foods: AlimentoV2[];
  onQuickAdd: (food: AlimentoV2) => void;
  onDetailedAdd: (food: AlimentoV2) => void;
  onToggleFavorite: (food: AlimentoV2) => void;
}

// Row component for react-window v2 (cannot be wrapped in memo due to react-window types)
const FoodRow = ({
  index,
  style,
  foods,
  onQuickAdd,
  onDetailedAdd,
  onToggleFavorite,
}: {
  ariaAttributes: {
    "aria-posinset": number;
    "aria-setsize": number;
    role: "listitem";
  };
  index: number;
  style: CSSProperties;
} & RowProps): ReactElement => {
  const food = foods[index];

  if (!food) {
    return <div style={style} />;
  }

  return (
    <div style={{ ...style, paddingRight: '8px', paddingBottom: '4px' }}>
      <QuickAddFoodCard
        food={food}
        onQuickAdd={onQuickAdd}
        onDetailedAdd={onDetailedAdd}
        onToggleFavorite={() => onToggleFavorite(food)}
        compact
      />
    </div>
  );
};

// Empty state component - memoized
const EmptyState = memo(({ onClearSearch }: { onClearSearch?: () => void }) => (
  <div className="text-center py-12 space-y-3">
    <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
      <Search className="h-8 w-8 text-muted-foreground/50" />
    </div>
    <div>
      <p className="text-sm font-medium text-muted-foreground">
        Nenhum alimento encontrado
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        Tente buscar por outro termo ou categoria
      </p>
    </div>
    {onClearSearch && (
      <Button
        variant="outline"
        size="sm"
        onClick={onClearSearch}
        className="mt-2"
      >
        Limpar busca
      </Button>
    )}
  </div>
));

EmptyState.displayName = 'EmptyState';

// Non-virtualized list for small datasets - memoized
const SmallList = memo(({
  foods,
  onQuickAdd,
  onDetailedAdd,
  onToggleFavorite,
}: RowProps) => (
  <div className="space-y-2">
    {foods.map((food) => (
      <QuickAddFoodCard
        key={food.id}
        food={food}
        onQuickAdd={onQuickAdd}
        onDetailedAdd={onDetailedAdd}
        onToggleFavorite={() => onToggleFavorite(food)}
        compact
      />
    ))}
  </div>
));

SmallList.displayName = 'SmallList';

export const VirtualizedFoodList: React.FC<VirtualizedFoodListProps> = memo(({
  foods,
  onQuickAdd,
  onDetailedAdd,
  onToggleFavorite,
  height = LIST_HEIGHT,
  itemHeight = ITEM_HEIGHT,
  onClearSearch,
}) => {
  // Empty state
  if (foods.length === 0) {
    return <EmptyState onClearSearch={onClearSearch} />;
  }

  // For small lists (<=10), don't virtualize - avoids overhead
  if (foods.length <= 10) {
    return (
      <SmallList
        foods={foods}
        onQuickAdd={onQuickAdd}
        onDetailedAdd={onDetailedAdd}
        onToggleFavorite={onToggleFavorite}
      />
    );
  }

  // Virtualized list using react-window v2 API with FIXED height
  return (
    <List
      rowComponent={FoodRow}
      rowCount={foods.length}
      rowHeight={itemHeight}
      rowProps={{
        foods,
        onQuickAdd,
        onDetailedAdd,
        onToggleFavorite,
      }}
      overscanCount={5}
      style={{ height, width: '100%' }}
    />
  );
});

VirtualizedFoodList.displayName = 'VirtualizedFoodList';
