export type MealIngredient = {
    id?: number;
    name: string;
    quantity: number;
    unit: string;
}

export type Meal = {
    id?: number;
    name: string;
    description?: string;
    preparationTime: number;
    portions: number;
    ingredients: MealIngredient[];
    createdAt?: string;
    updatedAt?: string;
} 