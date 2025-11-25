import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Plus, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AlimentoV2 } from '@/services/enhancedFoodSearchService';
import { cn } from '@/lib/utils';

interface QuickAddFoodCardProps {
  food: AlimentoV2;
  onQuickAdd: (food: AlimentoV2) => void;
  onDetailedAdd: (food: AlimentoV2) => void;
  onToggleFavorite?: (food: AlimentoV2) => void;
  isPopular?: boolean;
  compact?: boolean;
}

export const QuickAddFoodCard: React.FC<QuickAddFoodCardProps> = ({
  food,
  onQuickAdd,
  onDetailedAdd,
  onToggleFavorite,
  isPopular = false,
  compact = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15 }}
    >
      <div
        className={cn(
          'group relative overflow-hidden rounded-lg border border-border/50 hover:border-primary/50 bg-card hover:shadow-sm transition-all cursor-pointer',
          compact ? 'p-3' : 'p-4',
          isPopular && 'border-primary/30 bg-primary/5'
        )}
        onClick={() => onQuickAdd(food)}
      >
        {/* Popular Badge */}
        {isPopular && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
            Popular
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Food Name */}
            <h4 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {food.nome}
            </h4>

            {/* Portion & Nutritional Info in one line */}
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
              <span className="font-semibold text-foreground">{Math.round(food.kcal_por_referencia)} kcal</span>
              <span>•</span>
              <span>P: {food.ptn_g_por_referencia.toFixed(1)}g</span>
              <span>•</span>
              <span>C: {food.cho_g_por_referencia.toFixed(1)}g</span>
              <span>•</span>
              <span>G: {food.lip_g_por_referencia.toFixed(1)}g</span>
            </div>

            {/* Portion Size */}
            <p className="text-xs text-muted-foreground mt-1">
              {food.peso_referencia_g}g • {food.medida_padrao_referencia}
            </p>
          </div>

          {/* Action Buttons - Vertical Stack */}
          <div className="flex flex-col gap-1 shrink-0">
            {/* Quick Add Button */}
            <Button
              size="icon"
              variant="default"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(food);
              }}
              title="Adicionar 1 porção"
            >
              <Plus className="h-4 w-4" />
            </Button>

            {/* Detailed Add Button */}
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onDetailedAdd(food);
              }}
              title="Ajustar quantidade"
            >
              <Info className="h-4 w-4" />
            </Button>

            {/* Favorite Button */}
            {onToggleFavorite && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(food);
                }}
                title={food.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Star
                  className={cn(
                    'h-4 w-4 transition-colors',
                    food.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                  )}
                />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
