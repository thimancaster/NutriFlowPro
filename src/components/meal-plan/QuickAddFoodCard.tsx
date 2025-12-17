import React from 'react';
import { Button } from '@/components/ui/button';
import { Star, Plus, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AlimentoV2 } from '@/services/enhancedFoodSearchService';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
    <TooltipProvider delayDuration={300}>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.12 }}
        layout
      >
        <div
          className={cn(
            'group relative flex items-center gap-3 rounded-lg border border-border/60',
            'bg-card hover:bg-accent/50 hover:border-primary/40 transition-all duration-150',
            'cursor-pointer select-none',
            compact ? 'p-2' : 'p-3',
            isPopular && 'ring-1 ring-primary/20 bg-primary/5'
          )}
          onClick={() => onQuickAdd(food)}
        >
          {/* Popular Badge */}
          {isPopular && (
            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-medium shadow-sm">
              Popular
            </div>
          )}

          {/* Food Info - Flex grow */}
          <div className="flex-1 min-w-0">
            {/* Food Name */}
            <h4 className={cn(
              'font-medium text-foreground truncate group-hover:text-primary transition-colors',
              compact ? 'text-xs' : 'text-sm'
            )}>
              {food.nome}
            </h4>

            {/* Nutritional Info - Inline compact */}
            <div className={cn(
              'flex items-center gap-1.5 text-muted-foreground',
              compact ? 'text-[10px]' : 'text-xs'
            )}>
              <span className="font-semibold text-foreground">
                {Math.round(food.kcal_por_referencia)} kcal
              </span>
              <span className="opacity-40">•</span>
              <span>P:{food.ptn_g_por_referencia.toFixed(0)}g</span>
              <span className="opacity-40">•</span>
              <span>C:{food.cho_g_por_referencia.toFixed(0)}g</span>
              <span className="opacity-40">•</span>
              <span>G:{food.lip_g_por_referencia.toFixed(0)}g</span>
            </div>

            {/* Portion Info */}
            <p className={cn(
              'text-muted-foreground/70 truncate',
              compact ? 'text-[10px]' : 'text-xs'
            )}>
              {food.peso_referencia_g}g • {food.medida_padrao_referencia}
            </p>
          </div>

          {/* Action Buttons - Horizontal */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Quick Add Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="default"
                  className={cn(
                    'shrink-0 shadow-sm',
                    compact ? 'h-7 w-7' : 'h-8 w-8'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAdd(food);
                  }}
                >
                  <Plus className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Adicionar 1 porção</p>
              </TooltipContent>
            </Tooltip>

            {/* Detailed Add Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className={cn(
                    'shrink-0',
                    compact ? 'h-7 w-7' : 'h-8 w-8'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDetailedAdd(food);
                  }}
                >
                  <Info className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Ajustar quantidade</p>
              </TooltipContent>
            </Tooltip>

            {/* Favorite Button */}
            {onToggleFavorite && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      'shrink-0',
                      compact ? 'h-7 w-7' : 'h-8 w-8'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(food);
                    }}
                  >
                    <Star
                      className={cn(
                        'transition-colors',
                        compact ? 'h-3.5 w-3.5' : 'h-4 w-4',
                        food.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{food.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};
