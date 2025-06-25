import type { WeekMeal } from '../types/weekMeal';
import { format } from 'date-fns';
import api from './api';

export const weekMealService = {
    async getWeekMeals(weekStart: Date): Promise<WeekMeal[]> {
        const response = await api.get(
            `/api/week-meals?weekStart=${format(weekStart, 'yyyy-MM-dd')}`
        );
        return response.data;
    },

    async createWeekMeal(mealId: number, day: number, period: 'midi' | 'soir', weekStart: Date, portions: number = 1): Promise<WeekMeal> {
        const response = await api.post('/api/week-meals', {
            mealId,
            day,
            period,
            weekStart: format(weekStart, 'yyyy-MM-dd'),
            portions
        });
        return response.data;
    },

    async deleteWeekMeal(id: number): Promise<void> {
        await api.delete(`/api/week-meals/${id}`);
    }
}; 