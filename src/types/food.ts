export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type HealthMode = 'healthy' | 'normal';
export type Venue = '7-11' | 'street' | 'restaurant' | 'home';

export interface FoodItem {
  id: string;
  nameTH: string;
  nameEN: string;
  emoji: string;
  description: string;
  image: string;
  category: HealthMode;
  mealTypes: MealType[];
  availableAt: Venue[];
  calories: number;
  priceMin: number;
  priceMax: number;
}

export type AppPhase = 'idle' | 'spinning' | 'result';

export type BudgetMood = 'broke' | 'normal' | 'any';

export interface FilterState {
  mealType: MealType | 'any';
  healthMode: HealthMode | 'any';
  availableAt: Venue | 'any';
  budgetMood: BudgetMood;
}
