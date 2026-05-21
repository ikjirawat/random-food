export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type HealthMode = 'healthy' | 'normal';
export type Cuisine = 'thai' | 'chinese' | 'japanese';
export type Venue = '7-11' | 'street' | 'restaurant' | 'home';

export type { FoodItem } from '../schemas/food';

export type AppPhase = 'idle' | 'spinning' | 'result';

export type BudgetMood = 'broke' | 'normal' | 'any';

export interface FilterState {
  mealType: MealType | 'any';
  healthMode: HealthMode | 'any';
  cuisine: Cuisine | 'any';
  availableAt: Venue | 'any';
  budgetMood: BudgetMood;
}
