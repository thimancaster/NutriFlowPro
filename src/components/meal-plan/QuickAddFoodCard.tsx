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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'group relative overflow-hidden border-border/50 hover:border-primary/50 transition-all cursor-pointer',
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

            {/* Category */}
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {food.categoria}
              {food.subcategoria && ` • ${food.subcategoria}`}
            </p>

            {/* Nutritional Info */}
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {Math.round(food.kcal_por_referencia)}
                </span>{' '}
                kcal
              </span>
              <span className="text-muted-foreground">
                P: <span className="font-semibold text-foreground">{food.ptn_g_por_referencia.toFixed(1)}</span>g
              </span>
              <span className="text-muted-foreground">
                C: <span className="font-semibold text-foreground">{food.cho_g_por_referencia.toFixed(1)}</span>g
              </span>
              <span className="text-muted-foreground">
                G: <span className="font-semibold text-foreground">{food.lip_g_por_referencia.toFixed(1)}</span>g
              </span>
            </div>

            {/* Portion */}
            <p className="text-xs text-muted-foreground mt-1">
              Porção: {food.peso_referencia_g}g ({food.medida_padrao_referencia})
            </p>

            {/* Description */}
            {!compact && food.descricao_curta && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {food.descricao_curta}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-1">
            {/* Quick Add Button */}
            <Button
              size="icon"
              variant="default"
              className="h-8 w-8 shrink-0"
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
              className="h-8 w-8 shrink-0"
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
                className="h-8 w-8 shrink-0"
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
      </Card>
    </motion.div>
  );
};
