/**
 * DRAGGABLE MEAL ITEM WITH CROSS-MEAL SUPPORT
 * Drag and drop food items within and between meals
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MealItem } from '@/types/meal-plan';

interface DraggableMealItemProps {
  item: MealItem;
  onQuantityChange: (newQuantity: number) => void;
  onRemove: () => void;
  isDragging?: boolean;
}

export const DraggableMealItem: React.FC<DraggableMealItemProps> = ({
  item,
  onQuantityChange,
  onRemove,
  isDragging = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCurrentlyDragging = isDragging || isSortableDragging;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-3 group transition-all',
        isCurrentlyDragging && 'opacity-50 shadow-lg ring-2 ring-primary z-50'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="touch-none cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Arrastar item"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Food Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{item.nome}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{Math.round(item.kcal_calculado)} kcal</span>
            <span>•</span>
            <span>P: {item.ptn_g_calculado.toFixed(1)}g</span>
            <span>C: {item.cho_g_calculado.toFixed(1)}g</span>
            <span>G: {item.lip_g_calculado.toFixed(1)}g</span>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onQuantityChange(Math.max(0.5, item.quantidade - 0.5))}
            disabled={item.quantidade <= 0.5}
          >
            <Minus className="h-3 w-3" />
          </Button>

          <Input
            type="number"
            value={item.quantidade}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (value > 0) onQuantityChange(value);
            }}
            className="w-14 h-7 text-center text-sm px-1"
            step="0.5"
            min="0.5"
          />

          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onQuantityChange(item.quantidade + 0.5)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Measure */}
        <span className="text-xs text-muted-foreground w-20 text-center truncate">
          {item.medida_utilizada}
        </span>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

/**
 * DRAG OVERLAY ITEM
 * Rendered during drag operation for visual feedback
 */
export const DragOverlayItem: React.FC<{ item: MealItem }> = ({ item }) => {
  return (
    <Card className="p-3 shadow-xl ring-2 ring-primary bg-background">
      <div className="flex items-center gap-3">
        <GripVertical className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <p className="font-medium">{item.nome}</p>
          <p className="text-xs text-muted-foreground">
            {item.quantidade} × {item.medida_utilizada} • {Math.round(item.kcal_calculado)} kcal
          </p>
        </div>
      </div>
    </Card>
  );
};
