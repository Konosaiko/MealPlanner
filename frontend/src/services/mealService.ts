import type { Meal, MealIngredient } from '../types/meal';
import api from './api';

/**
 * Calcule les quantités d'ingrédients ajustées pour un nombre de portions souhaité
 * @param meal Le repas de base
 * @param desiredPortions Le nombre de portions souhaité
 * @returns Les ingrédients avec les quantités ajustées
 */
export const calculateAdjustedIngredients = (meal: Meal, desiredPortions: number): MealIngredient[] => {
    if (!meal.ingredients || meal.portions === 0) {
        return [];
    }
    
    const ratio = desiredPortions / meal.portions;
    
    return meal.ingredients.map(ingredient => ({
        ...ingredient,
        quantity: Math.round((ingredient.quantity * ratio) * 100) / 100 // Arrondir à 2 décimales
    }));
};

export const mealService = {
    async getAllMeals(): Promise<Meal[]> {
        const response = await api.get('/api/meals');
        return response.data;
    },

    async getMeal(id: number): Promise<Meal> {
        const response = await api.get(`/api/meals/${id}`);
        return response.data;
    },

    async createMeal(meal: Omit<Meal, 'id'>): Promise<Meal> {
        const response = await api.post('/api/meals', meal);
        return response.data;
    },

    async updateMeal(id: number, meal: Omit<Meal, 'id'>): Promise<Meal> {
        const response = await api.put(`/api/meals/${id}`, meal);
        return response.data;
    },

    async deleteMeal(id: number): Promise<void> {
        await api.delete(`/api/meals/${id}`);
    }
}; 