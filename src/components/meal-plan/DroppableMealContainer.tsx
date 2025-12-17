/**
 * DROPPABLE MEAL CONTAINER
 * Accepts dragged food items from other meals
 */

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DraggableMealItem } from './DraggableMealItem';
import { cn } from '@/lib/utils';
import type { Meal, MealItem } from '@/types/meal-plan';

interface DroppableMealContainerProps {
  meal: Meal;
  isActive: boolean;
  onItemQuantityChange: (itemIndex: number, newQuantity: number) => void;
  onItemRemove: (itemIndex: number) => void;
  activeItemId?: string | null;
}

export const DroppableMealContainer: React.FC<DroppableMealContainerProps> = ({
  meal,
  isActive,
  onItemQuantityChange,
  onItemRemove,
  activeItemId,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: meal.id,
  });

  const progressPercent = meal.alvo_kcal > 0 
    ? (meal.kcal_total / meal.alvo_kcal) * 100 
    : 0;

  const itemIds = meal.items.map((item) => item.id);

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        'h-full flex flex-col transition-all duration-200',
        isActive && 'ring-2 ring-primary',
        isOver && 'ring-2 ring-primary/50 bg-primary/5'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {meal.nome_refeicao}
            {meal.horario_sugerido && (
              <Badge variant="outline" className="text-xs font-normal">
                {meal.horario_sugerido}
              </Badge>
            )}
          </CardTitle>
          <Badge variant="secondary">
            {Math.round(meal.kcal_total)} / {meal.alvo_kcal} kcal
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mt-2">
          <Progress
            value={Math.min(progressPercent, 100)}
            className="h-1.5"
            indicatorClassName={cn(
              progressPercent > 110 && 'bg-destructive',
              progressPercent >= 90 && progressPercent <= 110 && 'bg-primary',
              progressPercent < 90 && 'bg-amber-500'
            )}
          />
        </div>

        {/* Macro Summary */}
        <div className="flex gap-3 text-xs text-muted-foreground mt-2">
          <span>P: {meal.ptn_g.toFixed(0)}g</span>
          <span>C: {meal.cho_g.toFixed(0)}g</span>
          <span>G: {meal.lip_g.toFixed(0)}g</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto">
        {meal.items.length === 0 ? (
          <div
            className={cn(
              'flex items-center justify-center h-32 rounded-lg border-2 border-dashed transition-colors',
              isOver ? 'border-primary bg-primary/10' : 'border-muted'
            )}
          >
            <p className="text-sm text-muted-foreground">
              {isOver ? 'Solte aqui' : 'Arraste alimentos para cá'}
            </p>
          </div>
        ) : (
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {meal.items.map((item, index) => (
                <DraggableMealItem
                  key={item.id}
                  item={item}
                  onQuantityChange={(qty) => onItemQuantityChange(index, qty)}
                  onRemove={() => onItemRemove(index)}
                  isDragging={activeItemId === item.id}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </CardContent>
    </Card>
  );
};
