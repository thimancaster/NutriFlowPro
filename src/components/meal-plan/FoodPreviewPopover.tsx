/**
 * FOOD PREVIEW POPOVER
 * Shows nutritional details on hover using HoverCard from shadcn
 */

import React from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import type { AlimentoV2 } from '@/services/enhancedFoodSearchService';
import { Flame, Beef, Wheat, Droplets, Leaf, AlertCircle } from 'lucide-react';

interface FoodPreviewPopoverProps {
  food: AlimentoV2;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const FoodPreviewPopover: React.FC<FoodPreviewPopoverProps> = ({
  food,
  children,
  side = 'right',
}) => {
  return (
    <HoverCard openDelay={400} closeDelay={150}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80" side={side} align="start">
        <div className="space-y-3">
          {/* Header */}
          <div>
            <h4 className="font-semibold text-foreground leading-tight">
              {food.nome}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs font-normal">
                {food.categoria}
              </Badge>
              {food.subcategoria && (
                <span className="text-xs text-muted-foreground">
                  {food.subcategoria}
                </span>
              )}
            </div>
          </div>

          {/* Descrição */}
          {food.descricao_curta && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {food.descricao_curta}
            </p>
          )}

          {/* Informação Nutricional */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-orange-500/10 dark:bg-orange-500/20 p-2 rounded-md">
              <Flame className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Calorias</p>
                <p className="font-semibold text-sm text-foreground">
                  {Math.round(food.kcal_por_referencia)} kcal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-red-500/10 dark:bg-red-500/20 p-2 rounded-md">
              <Beef className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-xs text-muted-foreground">Proteína</p>
                <p className="font-semibold text-sm text-foreground">
                  {food.ptn_g_por_referencia.toFixed(1)}g
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-amber-500/10 dark:bg-amber-500/20 p-2 rounded-md">
              <Wheat className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-xs text-muted-foreground">Carboidrato</p>
                <p className="font-semibold text-sm text-foreground">
                  {food.cho_g_por_referencia.toFixed(1)}g
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-blue-500/10 dark:bg-blue-500/20 p-2 rounded-md">
              <Droplets className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Gordura</p>
                <p className="font-semibold text-sm text-foreground">
                  {food.lip_g_por_referencia.toFixed(1)}g
                </p>
              </div>
            </div>
          </div>

          {/* Fibra e Sódio */}
          {(food.fibra_g_por_referencia || food.sodio_mg_por_referencia) && (
            <div className="flex gap-4 text-xs">
              {food.fibra_g_por_referencia !== undefined && food.fibra_g_por_referencia !== null && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Leaf className="h-3 w-3 text-green-500" />
                  <span>Fibra: {food.fibra_g_por_referencia.toFixed(1)}g</span>
                </div>
              )}
              {food.sodio_mg_por_referencia !== undefined && food.sodio_mg_por_referencia !== null && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                  <span>Sódio: {Math.round(food.sodio_mg_por_referencia)}mg</span>
                </div>
              )}
            </div>
          )}

          {/* Porção de referência */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Porção:</span>{' '}
              {food.peso_referencia_g}g ({food.medida_padrao_referencia})
            </p>
          </div>

          {/* Keywords/Tags */}
          {food.keywords && food.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {food.keywords.slice(0, 5).map((kw, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 font-normal"
                >
                  {kw}
                </Badge>
              ))}
              {food.keywords.length > 5 && (
                <span className="text-[10px] text-muted-foreground">
                  +{food.keywords.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Preparo sugerido */}
          {food.preparo_sugerido && (
            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              💡 <span className="font-medium">Preparo:</span> {food.preparo_sugerido}
            </p>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
