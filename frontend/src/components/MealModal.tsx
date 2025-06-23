import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { Meal, MealIngredient } from '../types/meal';
import { mealService } from '../services/mealService';

interface MealModalProps {
  open: boolean;
  onClose: () => void;
  mealId?: number;
  onSuccess: (meal: Meal) => void;
}

const emptyIngredient: MealIngredient = {
  name: '',
  quantity: 0,
  unit: ''
};

const emptyMeal: Meal = {
  name: '',
  description: '',
  preparationTime: 0,
  portions: 1,
  ingredients: [{ ...emptyIngredient }]
};

export default function MealModal({ open, onClose, mealId, onSuccess }: MealModalProps) {
  const [meal, setMeal] = useState<Meal>(emptyMeal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMeal = async () => {
      if (mealId) {
        try {
          setLoading(true);
          const loadedMeal = await mealService.getMeal(mealId);
          setMeal({
            ...loadedMeal,
            description: loadedMeal.description || '',
            ingredients: loadedMeal.ingredients || []
          });
        } catch (err) {
          setError("Erreur lors du chargement du repas");
        } finally {
          setLoading(false);
        }
      } else {
        setMeal({ ...emptyMeal });
      }
    };

    loadMeal();
  }, [mealId]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      let savedMeal: Meal;
      if (mealId) {
        savedMeal = await mealService.updateMeal(mealId, meal);
      } else {
        savedMeal = await mealService.createMeal(meal);
      }
      onSuccess(savedMeal);
    } catch (err) {
      setError("Erreur lors de l'enregistrement du repas");
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = () => {
    setMeal(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...emptyIngredient }]
    }));
  };

  const handleRemoveIngredient = (index: number) => {
    setMeal(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleIngredientChange = (index: number, field: keyof MealIngredient, value: string | number) => {
    setMeal(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => 
        i === index ? { ...ingredient, [field]: value } : ingredient
      )
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mealId ? 'Modifier le repas' : 'Nouveau repas'}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <TextField
          label="Nom du repas"
          value={meal.name || ''}
          onChange={(e) => setMeal(prev => ({ ...prev, name: e.target.value }))}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="Description"
          value={meal.description || ''}
          onChange={(e) => setMeal(prev => ({ ...prev, description: e.target.value }))}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <TextField
            label="Temps de préparation (minutes)"
            type="number"
            value={meal.preparationTime || 0}
            onChange={(e) => setMeal(prev => ({ ...prev, preparationTime: parseInt(e.target.value) || 0 }))}
            sx={{ flex: 1 }}
            required
          />
          <TextField
            label="Nombre de portions"
            type="number"
            value={meal.portions || 1}
            onChange={(e) => setMeal(prev => ({ ...prev, portions: parseInt(e.target.value) || 1 }))}
            sx={{ flex: 1 }}
            inputProps={{ min: 1 }}
            required
          />
        </Box>

        <Typography variant="h6" sx={{ mt: 4, mb: 2, color: 'primary.main' }}>
          Ingrédients
        </Typography>

        {meal.ingredients.map((ingredient, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
            <TextField
              label="Nom"
              value={ingredient.name || ''}
              onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
              className="flex-grow"
              size="small"
              required
            />
            <TextField
              label="Quantité"
              type="number"
              value={ingredient.quantity || 0}
              onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value) || 0)}
              className="w-24"
              size="small"
              required
            />
            <TextField
              label="Unité"
              value={ingredient.unit || ''}
              onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
              className="w-24"
              size="small"
              required
            />
            <IconButton
              onClick={() => handleRemoveIngredient(index)}
              disabled={meal.ingredients.length === 1}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        <Button
          startIcon={<AddIcon />}
          onClick={handleAddIngredient}
          variant="outlined"
          sx={{ mt: 2 }}
        >
          Ajouter un ingrédient
        </Button>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !meal.name || !meal.preparationTime || meal.ingredients.some(i => !i.name || !i.quantity || !i.unit)}
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 