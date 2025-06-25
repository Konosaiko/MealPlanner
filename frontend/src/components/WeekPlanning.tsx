import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';

interface MealSlot {
  id: number;
  day: string;
  mealType: 'LUNCH' | 'DINNER';
  meal: {
    id: number;
    name: string;
  } | null;
}

interface WeekPlanning {
  id: number;
  startDate: string;
  endDate: string;
  mealSlots: MealSlot[];
}

export default function WeekPlanning() {
  const [weekPlanning, setWeekPlanning] = useState<WeekPlanning | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  const fetchWeekPlanning = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/week-planning/current', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du planning');
      }
      
      const data = await response.json();
      setWeekPlanning(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekPlanning();
  }, []);

  const handleGenerateShoppingList = async () => {
    if (!weekPlanning) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/shopping-list/generate/${weekPlanning.startDate}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de la liste de courses');
      }

      navigate(`/shopping-list/${weekPlanning.startDate}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
      setOpenDialog(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!weekPlanning) {
    return (
      <Box>
        <Typography>Aucun planning disponible</Typography>
      </Box>
    );
  }

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const mealTypes = [
    { type: 'LUNCH', label: 'Midi' },
    { type: 'DINNER', label: 'Soir' },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2">
          Planning de la semaine
        </Typography>
        <Box>
          <Tooltip title="Générer la liste de courses">
            <IconButton
              color="primary"
              onClick={() => setOpenDialog(true)}
              sx={{ mr: 1 }}
            >
              <ShoppingCartIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/meals/new')}
          >
            Ajouter un repas
          </Button>
        </Box>
      </Box>

      <Box 
        display="grid" 
        gridTemplateColumns={{
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)'
        }}
        gap={2}
      >
        {days.map((day) => (
          <Paper key={day} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {day}
            </Typography>
            {mealTypes.map(({ type, label }) => {
              const mealSlot = weekPlanning.mealSlots.find(
                (slot) => slot.day === day && slot.mealType === type
              );
              return (
                <Box key={type} mb={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {label}
                  </Typography>
                  {mealSlot?.meal ? (
                    <Typography>{mealSlot.meal.name}</Typography>
                  ) : (
                    <Button
                      size="small"
                      onClick={() => navigate(`/meals/select?day=${day}&type=${type}`)}
                    >
                      Ajouter un repas
                    </Button>
                  )}
                </Box>
              );
            })}
          </Paper>
        ))}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Générer la liste de courses</DialogTitle>
        <DialogContent>
          <Typography>
            Voulez-vous générer une nouvelle liste de courses basée sur ce planning ?
            Les ingrédients déjà disponibles seront marqués comme tels.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleGenerateShoppingList} variant="contained">
            Générer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 