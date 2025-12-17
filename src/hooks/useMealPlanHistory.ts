/**
 * UNDO/REDO HOOK FOR MEAL PLAN BUILDER
 * Manages history stack for meal plan changes
 */

import { useState, useCallback, useRef } from 'react';
import type { Meal } from '@/types/meal-plan';

interface HistoryState {
  meals: Meal[];
  activeMealIndex: number;
}

interface UseMealPlanHistoryReturn {
  /** Current meals state */
  meals: Meal[];
  /** Current active meal index */
  activeMealIndex: number;
  /** Update meals with history tracking */
  setMeals: (meals: Meal[] | ((prev: Meal[]) => Meal[])) => void;
  /** Update active meal index with history tracking */
  setActiveMealIndex: (index: number) => void;
  /** Undo last change */
  undo: () => void;
  /** Redo last undone change */
  redo: () => void;
  /** Can undo */
  canUndo: boolean;
  /** Can redo */
  canRedo: boolean;
  /** Reset history with new state */
  resetHistory: (meals: Meal[], activeMealIndex?: number) => void;
  /** History length for debugging */
  historyLength: number;
}

const MAX_HISTORY_SIZE = 50;

export function useMealPlanHistory(
  initialMeals: Meal[] = [],
  initialActiveMealIndex: number = 0
): UseMealPlanHistoryReturn {
  // Current state
  const [meals, setMealsInternal] = useState<Meal[]>(initialMeals);
  const [activeMealIndex, setActiveMealIndexInternal] = useState(initialActiveMealIndex);

  // History stacks
  const undoStack = useRef<HistoryState[]>([]);
  const redoStack = useRef<HistoryState[]>([]);

  // Save current state to undo stack
  const saveToHistory = useCallback(() => {
    undoStack.current.push({
      meals: JSON.parse(JSON.stringify(meals)),
      activeMealIndex,
    });

    // Limit history size
    if (undoStack.current.length > MAX_HISTORY_SIZE) {
      undoStack.current.shift();
    }

    // Clear redo stack on new action
    redoStack.current = [];
  }, [meals, activeMealIndex]);

  // Set meals with history tracking
  const setMeals = useCallback(
    (newMeals: Meal[] | ((prev: Meal[]) => Meal[])) => {
      saveToHistory();
      setMealsInternal(newMeals);
    },
    [saveToHistory]
  );

  // Set active meal index with history tracking (only if significant)
  const setActiveMealIndex = useCallback(
    (index: number) => {
      // Don't save to history for simple tab changes
      setActiveMealIndexInternal(index);
    },
    []
  );

  // Undo last change
  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;

    // Save current state to redo stack
    redoStack.current.push({
      meals: JSON.parse(JSON.stringify(meals)),
      activeMealIndex,
    });

    // Restore previous state
    const previousState = undoStack.current.pop()!;
    setMealsInternal(previousState.meals);
    setActiveMealIndexInternal(previousState.activeMealIndex);
  }, [meals, activeMealIndex]);

  // Redo last undone change
  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;

    // Save current state to undo stack
    undoStack.current.push({
      meals: JSON.parse(JSON.stringify(meals)),
      activeMealIndex,
    });

    // Restore next state
    const nextState = redoStack.current.pop()!;
    setMealsInternal(nextState.meals);
    setActiveMealIndexInternal(nextState.activeMealIndex);
  }, [meals, activeMealIndex]);

  // Reset history with new initial state
  const resetHistory = useCallback((newMeals: Meal[], newActiveMealIndex: number = 0) => {
    undoStack.current = [];
    redoStack.current = [];
    setMealsInternal(newMeals);
    setActiveMealIndexInternal(newActiveMealIndex);
  }, []);

  return {
    meals,
    activeMealIndex,
    setMeals,
    setActiveMealIndex,
    undo,
    redo,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
    resetHistory,
    historyLength: undoStack.current.length,
  };
}
