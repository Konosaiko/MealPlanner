import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { Meal } from '../types/meal';
import { mealService, calculateAdjustedIngredients } from '../services/mealService';

interface MealSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelectMeal: (meal: Meal, portions: number) => void;
  onCreateNew: () => void;
}

export default function MealSelectionModal({ 
  open, 
  onClose, 
  onSelectMeal, 
  onCreateNew 
}: MealSelectionModalProps) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0); // 0: sélection repas, 1: sélection portions
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [selectedPortions, setSelectedPortions] = useState(1);

  useEffect(() => {
    if (open) {
      loadMeals();
      setSearchTerm('');
      setStep(0);
      setSelectedMeal(null);
      setSelectedPortions(1);
    }
  }, [open]);

  useEffect(() => {
    // Filtrer les repas selon le terme de recherche
    if (searchTerm.trim() === '') {
      setFilteredMeals(meals);
    } else {
      const filtered = meals.filter(meal =>
        meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (meal.description && meal.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredMeals(filtered);
    }
  }, [meals, searchTerm]);

  const loadMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedMeals = await mealService.getAllMeals();
      setMeals(fetchedMeals);
    } catch (err) {
      setError('Erreur lors du chargement des repas');
      console.error('Erreur lors du chargement des repas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMealForPortions = (meal: Meal) => {
    setSelectedMeal(meal);
    setSelectedPortions(meal.portions || 1); // Utiliser les portions par défaut du repas
    setStep(1);
  };

  const handleConfirmSelection = () => {
    if (selectedMeal) {
      onSelectMeal(selectedMeal, selectedPortions);
      onClose();
    }
  };

  const handleCreateNew = () => {
    onCreateNew();
    onClose();
  };

  const handleBack = () => {
    setStep(0);
    setSelectedMeal(null);
  };

  const adjustedIngredients = selectedMeal ? calculateAdjustedIngredients(selectedMeal, selectedPortions) : [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {step === 0 ? 'Ajouter un repas au planning' : `Portions pour "${selectedMeal?.name}"`}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {step === 0 && (
          <>
            <Box sx={{ mb: 4 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateNew}
                fullWidth
                size="large"
                sx={{ mb: 2 }}
              >
                Créer un nouveau repas
              </Button>
              
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                ou choisir un repas existant
              </Typography>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TextField
                  fullWidth
                  placeholder="Rechercher un repas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                {filteredMeals.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm ? 'Aucun repas trouvé' : 'Aucun repas disponible'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm 
                        ? 'Essayez avec d\'autres mots-clés' 
                        : 'Créez votre premier repas'
                      }
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ maxHeight: 384, overflowY: 'auto' }}>
                    {filteredMeals.map((meal) => (
                      <ListItem key={meal.id} disablePadding>
                        <ListItemButton 
                          onClick={() => handleSelectMealForPortions(meal)}
                          sx={{ borderRadius: 2, mb: 1 }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                {meal.name}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <AccessTimeIcon fontSize="small" color="action" />
                                  <Typography variant="body2" color="text.secondary">
                                    {meal.preparationTime} minutes
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                  🍽️ {meal.portions} portion{meal.portions > 1 ? 's' : ''} (recette de base)
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </>
            )}
          </>
        )}

        {step === 1 && selectedMeal && (
          <Box>
            <Box sx={{ mb: 4 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Cette recette est prévue pour <strong>{selectedMeal.portions} portion{selectedMeal.portions > 1 ? 's' : ''}</strong>.
                Combien de portions souhaitez-vous préparer ?
              </Typography>
              
              <TextField
                label="Nombre de portions"
                type="number"
                value={selectedPortions}
                onChange={(e) => setSelectedPortions(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1 }}
                fullWidth
                sx={{ mb: 3 }}
              />
            </Box>

            {adjustedIngredients.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Ingrédients ajustés pour {selectedPortions} portion{selectedPortions > 1 ? 's' : ''} :
                </Typography>
                <List dense>
                  {adjustedIngredients.map((ingredient, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={`${ingredient.name}`}
                        secondary={`${ingredient.quantity} ${ingredient.unit}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {step === 1 && (
          <Button onClick={handleBack} startIcon={<ArrowBackIcon />}>
            Retour
          </Button>
        )}
        <Button onClick={onClose}>
          Annuler
        </Button>
        {step === 1 && (
          <Button onClick={handleConfirmSelection} variant="contained">
            Ajouter au planning
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 