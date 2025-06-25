import type { Meal } from './meal';

export type WeekMeal = {
    id: number;
    meal: Meal;
    day: number;
    period: 'midi' | 'soir';
    weekStart: string;
    portions: number;
}; 