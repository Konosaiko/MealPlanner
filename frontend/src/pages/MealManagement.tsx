import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MealModal from '../components/MealModal';
import type { Meal } from '../types/meal';
import { mealService } from '../services/mealService';

export default function MealManagement() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<number | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<Meal | null>(null);

  useEffect(() => {
    loadMeals();
  }, []);

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

  const handleOpenMealModal = (mealId?: number) => {
    setSelectedMealId(mealId);
    setIsMealModalOpen(true);
  };

  const handleCloseMealModal = () => {
    setIsMealModalOpen(false);
    setSelectedMealId(undefined);
  };

  const handleMealSuccess = () => {
    // Recharger la liste des repas après création/modification
    loadMeals();
    handleCloseMealModal();
  };

  const handleDeleteClick = (meal: Meal) => {
    setMealToDelete(meal);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (mealToDelete && mealToDelete.id) {
      try {
        await mealService.deleteMeal(mealToDelete.id);
        loadMeals(); // Recharger la liste
        setDeleteDialogOpen(false);
        setMealToDelete(null);
      } catch (err) {
        setError('Erreur lors de la suppression du repas');
        console.error('Erreur lors de la suppression:', err);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setMealToDelete(null);
  };

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3, md: 4 }, 
      minHeight: '100vh',
      bgcolor: '#ffffff'
    }}>
      {/* En-tête */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}
      >
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
            fontWeight: 700,
            color: '#1f2937'
          }}
        >
          Gestion des repas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenMealModal()}
          sx={{
            px: { xs: 3, sm: 4 },
            py: 1.5,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            fontWeight: 600,
            borderRadius: '12px',
            alignSelf: { xs: 'stretch', sm: 'auto' }
          }}
        >
          Nouveau repas
        </Button>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ mb: 3, borderRadius: '12px' }}
        >
          {error}
        </Alert>
      )}

      {/* Barre de recherche */}
      <Paper 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: 4,
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}
      >
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
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            }
          }}
        />
      </Paper>

      {loading ? (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '200px' 
          }}
        >
          <CircularProgress size={60} />
        </Box>
      ) : filteredMeals.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            gutterBottom
            sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
          >
            {searchTerm ? 'Aucun repas trouvé' : 'Aucun repas créé'}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 4,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              maxWidth: '400px',
              margin: '0 auto 2rem auto'
            }}
          >
            {searchTerm 
              ? 'Essayez avec d\'autres mots-clés' 
              : 'Commencez par créer votre premier repas'
            }
          </Typography>
          {!searchTerm && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenMealModal()}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '12px'
              }}
            >
              Créer un repas
            </Button>
          )}
        </Box>
      ) : (
        /* Grille responsive des repas */
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: { xs: 2, sm: 3, md: 4 },
            mb: 4
          }}
        >
          {filteredMeals.map((meal) => (
            <Box key={meal.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    borderColor: '#3b82f6'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '1rem', sm: '1.125rem' },
                      mb: 2,
                      color: '#1f2937'
                    }}
                  >
                    {meal.name}
                  </Typography>
                  
                  {meal.description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        fontSize: { xs: '0.875rem', sm: '0.875rem' },
                        lineHeight: 1.5
                      }}
                    >
                      {meal.description.length > 100 
                        ? `${meal.description.substring(0, 100)}...` 
                        : meal.description
                      }
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {meal.preparationTime} min
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      🍽️ {meal.portions} portion{meal.portions > 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  
                  {meal.ingredients && meal.ingredients.length > 0 && (
                    <Chip 
                      label={`${meal.ingredients.length} ingrédient${meal.ingredients.length > 1 ? 's' : ''}`}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        mt: 2,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        borderRadius: '8px'
                      }}
                    />
                  )}
                </CardContent>
                
                <CardActions sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
                  <Button
                    size="small"
                    onClick={() => handleOpenMealModal(meal.id)}
                    startIcon={<EditIcon />}
                    sx={{ 
                      mr: 1,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      borderRadius: '8px'
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(meal)}
                    startIcon={<DeleteIcon />}
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      borderRadius: '8px'
                    }}
                  >
                    Supprimer
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* Modal de création/modification */}
      <MealModal
        open={isMealModalOpen}
        onClose={handleCloseMealModal}
        mealId={selectedMealId}
        onSuccess={handleMealSuccess}
      />

      {/* Dialogue de confirmation de suppression */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Confirmer la suppression
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Typography>
            Êtes-vous sûr de vouloir supprimer le repas "{mealToDelete?.name}" ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={handleDeleteCancel}
            sx={{ borderRadius: '8px' }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: '8px' }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 