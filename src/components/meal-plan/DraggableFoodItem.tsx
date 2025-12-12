/**
 * DRAGGABLE FOOD ITEM
 * Item de alimento com drag & drop
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MealAssemblyFood } from '@/types/mealPlanTypes';

interface DraggableFoodItemProps {
  food: MealAssemblyFood;
  onQuantityChange: (newQuantity: number) => void;
  onRemove: () => void;
}

const DraggableFoodItem: React.FC<DraggableFoodItemProps> = ({
  food,
  onQuantityChange,
  onRemove
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: food.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 border rounded-lg bg-background hover:bg-accent/50 transition-colors"
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Food Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{food.name}</p>
        <p className="text-sm text-muted-foreground">
          {Math.round(food.calories)} kcal | {Math.round(food.protein)}g PTN | {Math.round(food.carbs)}g CHO | {Math.round(food.fat)}g LIP
        </p>
      </div>

      {/* Quantity Input */}
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={food.quantity}
          onChange={(e) => onQuantityChange(Number(e.target.value))}
          className="w-24"
          min={1}
          onClick={(e) => e.stopPropagation()}
        />
        <span className="text-sm text-muted-foreground w-8">{food.unit}</span>
      </div>

      {/* Remove Button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={onRemove}
        className="shrink-0"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
};

export default DraggableFoodItem;
