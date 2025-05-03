
export interface MealItem {
  name: string;
  portion: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  selected?: boolean;
}

export interface Meal {
  name: string;
  time: string;
  calories: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: MealItem[];
}
