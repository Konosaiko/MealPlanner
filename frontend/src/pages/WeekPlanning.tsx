import { useState, useEffect } from 'react';
import { Paper, Typography, Button, IconButton, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { format, addWeeks, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import MealModal from '../components/MealModal';
import MealDetailsModal from '../components/MealDetailsModal';
import MealSelectionModal from '../components/MealSelectionModal';
import MealSlot from '../components/MealSlot';
import type { Meal } from '../types/meal';
import type { WeekMeal } from '../types/weekMeal';
import { mealService } from '../services/mealService';
import { weekMealService } from '../services/weekMealService';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import axios from 'axios';

export default function WeekPlanning() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isMealSelectionModalOpen, setIsMealSelectionModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<number | undefined>();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [selectedWeekMealId, setSelectedWeekMealId] = useState<number | undefined>();
  const [selectedMealPortions, setSelectedMealPortions] = useState<number | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<{ day: number, period: 'midi' | 'soir' } | null>(null);
  const [weekMeals, setWeekMeals] = useState<WeekMeal[]>([]);
  const [loading, setLoading] = useState(false);
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier l'authentification au chargement
    const checkAuth = async () => {
      try {
        await api.get('/api/me');
        loadWeekMeals();
      } catch (error) {
        console.error('Erreur d\'authentification:', error);
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    loadWeekMeals();
  }, [currentWeek]);

  const loadWeekMeals = async () => {
    try {
      setLoading(true);
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const fetchedWeekMeals = await weekMealService.getWeekMeals(weekStart);
      setWeekMeals(fetchedWeekMeals);
    } catch (error) {
      console.error('Erreur lors du chargement des repas de la semaine:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  };

  // Ouvrir la modal de sélection (nouveau ou existant)
  const handleOpenSelectionModal = (dayIndex: number, period: 'midi' | 'soir') => {
    setSelectedSlot({ day: dayIndex, period });
    setIsMealSelectionModalOpen(true);
  };

  const handleCloseSelectionModal = () => {
    setIsMealSelectionModalOpen(false);
    setSelectedSlot(null);
  };

  // Ouvrir la modal de création de repas
  const handleOpenMealModal = (mealId?: number) => {
    setSelectedMealId(mealId);
    setIsMealModalOpen(true);
  };

  const handleCloseMealModal = () => {
    setIsMealModalOpen(false);
    setSelectedMealId(undefined);
  };

  // Ouvrir la modal de détails d'un repas
  const handleOpenDetailsModal = (meal: Meal, weekMealId: number) => {
    // Récupérer les portions du WeekMeal
    const weekMeal = weekMeals.find(wm => wm.id === weekMealId);
    setSelectedMeal(meal);
    setSelectedWeekMealId(weekMealId);
    setSelectedMealPortions(weekMeal?.portions);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedMeal(null);
    setSelectedWeekMealId(undefined);
    setSelectedMealPortions(undefined);
  };

  // Gérer la sélection d'un repas existant
  const handleSelectExistingMeal = async (meal: Meal, portions: number) => {
    if (selectedSlot && meal.id) {
      try {
        const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
        await weekMealService.createWeekMeal(meal.id, selectedSlot.day, selectedSlot.period, weekStart, portions);
        loadWeekMeals();
      } catch (error) {
        console.error('Erreur lors de l\'ajout du repas au planning:', error);
      }
    }
  };

  // Gérer la création d'un nouveau repas depuis la sélection
  const handleCreateNewFromSelection = () => {
    handleOpenMealModal();
  };

  // Gérer la modification depuis la modal de détails
  const handleEditFromDetails = () => {
    if (selectedMeal && selectedMeal.id) {
      handleCloseDetailsModal();
      // Trouver le slot du repas pour pouvoir le modifier
      const weekMeal = weekMeals.find(wm => wm.id === selectedWeekMealId);
      if (weekMeal) {
        handleOpenMealModal(selectedMeal.id);
      }
    }
  };

  // Gérer la suppression depuis la modal de détails
  const handleDeleteFromDetails = async () => {
    if (selectedWeekMealId) {
      try {
        await weekMealService.deleteWeekMeal(selectedWeekMealId);
        loadWeekMeals();
        handleCloseDetailsModal();
      } catch (error) {
        console.error('Erreur lors de la suppression du repas du planning:', error);
      }
    }
  };

  const handleMealSuccess = async (meal: Meal) => {
    if (selectedSlot && meal.id) {
      try {
        const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
        // Utiliser les portions par défaut du repas lors de la création
        await weekMealService.createWeekMeal(meal.id, selectedSlot.day, selectedSlot.period, weekStart, meal.portions);
        loadWeekMeals();
      } catch (error) {
        console.error('Erreur lors de l\'ajout du repas au planning:', error);
      }
    }
    handleCloseMealModal();
  };

  const getMealsForSlot = (dayIndex: number, period: 'midi' | 'soir'): WeekMeal[] => {
    return weekMeals.filter(wm => wm.day === dayIndex && wm.period === period);
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });

  const handleGenerateShoppingList = async () => {
    try {
      setLoading(true);
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const formattedDate = format(weekStart, 'yyyy-MM-dd');
      
      // Récupérer le token JWT du localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Non authentifié');
      }
      
      const response = await fetch(`http://localhost:8000/api/shopping-list/generate/${formattedDate}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Si le token est expiré, rediriger vers la page de connexion
          navigate('/login');
          return;
        }
        throw new Error('Erreur lors de la génération de la liste de courses');
      }

      const data = await response.json();
      navigate(`/shopping-list/${formattedDate}`);
    } catch (error) {
      console.error('Erreur lors de la génération de la liste de courses:', error);
      if (error instanceof Error && error.message === 'Non authentifié') {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      background: '#ffffff', 
      minHeight: '100vh', 
      padding: '1rem', 
      paddingTop: { xs: '1rem', md: '2rem' } 
    }}>
      {/* En-tête */}
      <div style={{ 
        marginBottom: '2rem', 
        textAlign: 'center',
        paddingBottom: '1rem'
      }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            color: '#1f2937', 
            fontWeight: 800, 
            textAlign: 'center',
            marginBottom: '1rem',
            letterSpacing: '-0.025em',
            fontSize: { xs: '1.875rem', sm: '2.25rem', md: '3rem' }
          }}
        >
          Planning de la semaine
        </Typography>
        <div style={{
          height: '4px',
          width: '80px',
          background: 'linear-gradient(90deg, #3b82f6, #10b981)',
          margin: '0 auto',
          borderRadius: '2px'
        }} />
      </div>

      {/* Navigation des semaines */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          background: '#ffffff',
          padding: '0.75rem 1rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          maxWidth: '420px',
          margin: '0 auto'
        }}>
          <IconButton 
            onClick={handlePreviousWeek} 
            size="small"
            sx={{
              bgcolor: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              '&:hover': {
                bgcolor: '#3b82f6',
                color: '#ffffff',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px -4px rgba(59, 130, 246, 0.4)'
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#374151', 
              fontWeight: 600,
              textAlign: 'center',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              minWidth: { xs: '180px', sm: '220px' }
            }}
          >
            Semaine du {format(weekStart, 'dd MMMM yyyy', { locale: fr })}
          </Typography>
          
          <IconButton 
            onClick={handleNextWeek} 
            size="small"
            sx={{
              bgcolor: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              '&:hover': {
                bgcolor: '#3b82f6',
                color: '#ffffff',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px -4px rgba(59, 130, 246, 0.4)'
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </div>
      </div>

      {/* Bouton liste de courses */}
      <Box display="flex" justifyContent="center" mb={4}>
        <Button
          variant="contained"
          size="large"
          startIcon={<ShoppingCartIcon />}
          onClick={handleGenerateShoppingList}
          disabled={loading}
          sx={{
            px: { xs: 3, sm: 4 },
            py: 1.5,
            borderRadius: '16px',
            bgcolor: '#f59e0b',
            fontWeight: 600,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            textTransform: 'none',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              bgcolor: '#d97706',
              transform: 'translateY(-2px)',
              boxShadow: '0 10px 25px -3px rgba(245, 158, 11, 0.4)',
            },
            '&:disabled': {
              bgcolor: '#d1d5db',
              color: '#9ca3af',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          Générer la liste de courses
        </Button>
      </Box>

      {/* Calendrier responsive */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',                    // Mobile: 1 colonne
            sm: 'repeat(2, 1fr)',         // Petite tablette: 2 colonnes
            md: 'repeat(3, 1fr)',         // Moyenne tablette: 3 colonnes
            lg: 'repeat(4, 1fr)',         // Grande tablette: 4 colonnes
            xl: 'repeat(7, 1fr)'          // Desktop: 7 colonnes (semaine complète)
          },
          gap: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
          maxWidth: '1400px',
          margin: '0 auto',
          px: { xs: 0, sm: 1, md: 2 }
        }}
      >
        {days.map((day, index) => {
          const currentDay = addDays(weekStart, index);
          const lunchMeals = getMealsForSlot(index, 'midi');
          const dinnerMeals = getMealsForSlot(index, 'soir');

          return (
            <Paper
              key={day}
              elevation={0}
              sx={{
                overflow: 'hidden',
                borderRadius: '20px',
                border: '1px solid #e5e7eb',
                minHeight: { xs: '280px', sm: '320px', md: '350px' },
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  borderColor: '#3b82f6',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
                bgcolor: '#ffffff',
              }}
            >
              {/* En-tête du jour */}
              <Box sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                padding: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, 
                textAlign: 'center' 
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#ffffff', 
                    fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' }
                  }}
                >
                  {day}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontWeight: 500,
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                  }}
                >
                  {format(currentDay, 'dd/MM')}
                </Typography>
              </Box>
              
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between', 
                padding: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                gap: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
              }}>
                {/* Section Midi */}
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      textAlign: 'center', 
                      mb: { xs: 1, md: 2 }, 
                      color: '#374151',
                      fontWeight: 600,
                      fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' }
                    }}
                  >
                    🌞 Midi
                  </Typography>
                  {lunchMeals.map(weekMeal => (
                    <MealSlot
                      key={weekMeal.id}
                      weekMeal={weekMeal}
                      onClick={() => handleOpenDetailsModal(weekMeal.meal, weekMeal.id)}
                    />
                  ))}
                  {lunchMeals.length === 0 && (
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenSelectionModal(index, 'midi')}
                      fullWidth
                      sx={{ 
                        borderRadius: '12px', 
                        py: { xs: 1, md: 1.5 }, 
                        fontWeight: 600,
                        borderColor: '#d1d5db',
                        color: '#6b7280',
                        textTransform: 'none',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        '&:hover': {
                          borderColor: '#3b82f6',
                          color: '#3b82f6',
                          bgcolor: '#f0f9ff'
                        }
                      }}
                    >
                      Ajouter un repas
                    </Button>
                  )}
                </Box>
                
                {/* Section Soir */}
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      textAlign: 'center', 
                      mb: { xs: 1, md: 2 }, 
                      color: '#374151',
                      fontWeight: 600,
                      fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' }
                    }}
                  >
                    🌙 Soir
                  </Typography>
                  {dinnerMeals.map(weekMeal => (
                    <MealSlot
                      key={weekMeal.id}
                      weekMeal={weekMeal}
                      onClick={() => handleOpenDetailsModal(weekMeal.meal, weekMeal.id)}
                    />
                  ))}
                  {dinnerMeals.length === 0 && (
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenSelectionModal(index, 'soir')}
                      fullWidth
                      sx={{ 
                        borderRadius: '12px', 
                        py: { xs: 1, md: 1.5 }, 
                        fontWeight: 600,
                        borderColor: '#d1d5db',
                        color: '#6b7280',
                        textTransform: 'none',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        '&:hover': {
                          borderColor: '#10b981',
                          color: '#10b981',
                          bgcolor: '#f0fdf4'
                        }
                      }}
                    >
                      Ajouter un repas
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* Modals */}
      <MealSelectionModal
        open={isMealSelectionModalOpen}
        onClose={handleCloseSelectionModal}
        onSelectMeal={handleSelectExistingMeal}
        onCreateNew={handleCreateNewFromSelection}
      />

      <MealModal
        open={isMealModalOpen}
        onClose={handleCloseMealModal}
        mealId={selectedMealId}
        onSuccess={handleMealSuccess}
      />

      <MealDetailsModal
        open={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        meal={selectedMeal}
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteFromDetails}
        adjustedPortions={selectedMealPortions}
      />
    </div>
  );
} 