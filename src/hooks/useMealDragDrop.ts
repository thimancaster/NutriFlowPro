/**
 * DRAG AND DROP HOOK FOR MEAL PLAN BUILDER
 * Enables moving food items between meals using @dnd-kit
 */

import { useState, useCallback } from 'react';
import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import type { Meal, MealItem } from '@/types/meal-plan';

interface UseMealDragDropProps {
  meals: Meal[];
  onMealsChange: (meals: Meal[]) => void;
}

interface UseMealDragDropReturn {
  /** Currently dragged item ID */
  activeId: UniqueIdentifier | null;
  /** Currently dragged item */
  activeItem: MealItem | null;
  /** Index of meal containing active item */
  activeMealIndex: number | null;
  /** Handle drag start */
  handleDragStart: (event: DragStartEvent) => void;
  /** Handle drag over */
  handleDragOver: (event: DragOverEvent) => void;
  /** Handle drag end */
  handleDragEnd: (event: DragEndEvent) => void;
  /** Handle drag cancel */
  handleDragCancel: () => void;
}

export function useMealDragDrop({
  meals,
  onMealsChange,
}: UseMealDragDropProps): UseMealDragDropReturn {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeItem, setActiveItem] = useState<MealItem | null>(null);
  const [activeMealIndex, setActiveMealIndex] = useState<number | null>(null);

  // Find which meal contains an item
  const findMealIndex = useCallback((itemId: UniqueIdentifier): number => {
    for (let i = 0; i < meals.length; i++) {
      const found = meals[i].items.find((item) => item.id === itemId);
      if (found) return i;
    }
    return -1;
  }, [meals]);

  // Find item by ID
  const findItem = useCallback((itemId: UniqueIdentifier): MealItem | null => {
    for (const meal of meals) {
      const item = meal.items.find((item) => item.id === itemId);
      if (item) return item;
    }
    return null;
  }, [meals]);

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const item = findItem(active.id);
    const mealIndex = findMealIndex(active.id);

    setActiveId(active.id);
    setActiveItem(item);
    setActiveMealIndex(mealIndex);
  }, [findItem, findMealIndex]);

  // Handle drag over (for moving between containers)
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find source and destination meal indices
    let sourceMealIndex = findMealIndex(activeId);
    let destMealIndex = findMealIndex(overId);

    // If over is a meal container (not an item), find the meal index
    if (destMealIndex === -1) {
      // Check if overId is a meal id
      const mealIndex = meals.findIndex((m) => m.id === overId);
      if (mealIndex !== -1) {
        destMealIndex = mealIndex;
      }
    }

    // If same meal or invalid, do nothing
    if (sourceMealIndex === -1 || destMealIndex === -1 || sourceMealIndex === destMealIndex) {
      return;
    }

    // Move item from source to destination meal
    const newMeals = [...meals];
    const sourceMeal = { ...newMeals[sourceMealIndex] };
    const destMeal = { ...newMeals[destMealIndex] };

    // Find the item to move
    const itemIndex = sourceMeal.items.findIndex((item) => item.id === activeId);
    if (itemIndex === -1) return;

    const [movedItem] = sourceMeal.items.splice(itemIndex, 1);

    // Update source meal totals
    sourceMeal.items = [...sourceMeal.items];
    sourceMeal.kcal_total = sourceMeal.items.reduce((sum, i) => sum + i.kcal_calculado, 0);
    sourceMeal.ptn_g = sourceMeal.items.reduce((sum, i) => sum + i.ptn_g_calculado, 0);
    sourceMeal.cho_g = sourceMeal.items.reduce((sum, i) => sum + i.cho_g_calculado, 0);
    sourceMeal.lip_g = sourceMeal.items.reduce((sum, i) => sum + i.lip_g_calculado, 0);

    // Add to destination meal
    const overItemIndex = destMeal.items.findIndex((item) => item.id === overId);
    if (overItemIndex !== -1) {
      destMeal.items = [...destMeal.items.slice(0, overItemIndex), movedItem, ...destMeal.items.slice(overItemIndex)];
    } else {
      destMeal.items = [...destMeal.items, movedItem];
    }

    // Update destination meal totals
    destMeal.kcal_total = destMeal.items.reduce((sum, i) => sum + i.kcal_calculado, 0);
    destMeal.ptn_g = destMeal.items.reduce((sum, i) => sum + i.ptn_g_calculado, 0);
    destMeal.cho_g = destMeal.items.reduce((sum, i) => sum + i.cho_g_calculado, 0);
    destMeal.lip_g = destMeal.items.reduce((sum, i) => sum + i.lip_g_calculado, 0);

    newMeals[sourceMealIndex] = sourceMeal;
    newMeals[destMealIndex] = destMeal;

    onMealsChange(newMeals);
    setActiveMealIndex(destMealIndex);
  }, [meals, findMealIndex, onMealsChange]);

  // Handle drag end (for reordering within same meal)
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setActiveItem(null);
    setActiveMealIndex(null);

    if (!over || active.id === over.id) return;

    const sourceMealIndex = findMealIndex(active.id);
    const destMealIndex = findMealIndex(over.id);

    // Reorder within same meal
    if (sourceMealIndex !== -1 && sourceMealIndex === destMealIndex) {
      const newMeals = [...meals];
      const meal = { ...newMeals[sourceMealIndex] };
      const items = [...meal.items];

      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const [movedItem] = items.splice(oldIndex, 1);
        items.splice(newIndex, 0, movedItem);
        meal.items = items;
        newMeals[sourceMealIndex] = meal;
        onMealsChange(newMeals);
      }
    }
  }, [meals, findMealIndex, onMealsChange]);

  // Handle drag cancel
  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setActiveItem(null);
    setActiveMealIndex(null);
  }, []);

  return {
    activeId,
    activeItem,
    activeMealIndex,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
