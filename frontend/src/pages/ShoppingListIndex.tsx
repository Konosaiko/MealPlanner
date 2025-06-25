import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Divider,
  Button,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

interface ShoppingListSummary {
  id: number;
  weekStart: string;
  createdAt: string;
  itemCount: number;
  completedItems: number;
  isCompleted: boolean;
}

export default function ShoppingListIndex() {
  const navigate = useNavigate();
  const [shoppingLists, setShoppingLists] = useState<ShoppingListSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShoppingLists = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch('http://localhost:8000/api/shopping-lists', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des listes de courses');
      }

      const data = await response.json();
      setShoppingLists(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShoppingLists();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getWeekRange = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const handleNavigateToList = (weekStart: string) => {
    navigate(`/shopping-list/${weekStart}`);
  };

  const handleCreateNewList = () => {
    // Rediriger vers le planning pour générer une nouvelle liste
    navigate('/');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" display="flex" alignItems="center">
          <ShoppingCartIcon sx={{ mr: 2, fontSize: 40 }} />
          Mes listes de courses
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNewList}
          size="large"
        >
          Nouvelle liste
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {shoppingLists.length === 0 && !loading ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucune liste de courses trouvée
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Créez votre premier planning hebdomadaire pour générer automatiquement vos listes de courses.
            </Typography>
            <Button
              variant="contained"
              startIcon={<CalendarTodayIcon />}
              onClick={handleCreateNewList}
            >
              Créer un planning
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <List>
              {shoppingLists.map((list, index) => (
                <React.Fragment key={list.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleNavigateToList(list.weekStart)}
                      sx={{
                        py: 2,
                        px: 3,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                          <Typography variant="h6" component="div">
                            Semaine du {getWeekRange(list.weekStart)}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              size="small"
                              label={`${list.completedItems}/${list.itemCount} articles`}
                              color={list.isCompleted ? 'success' : 'default'}
                              variant={list.isCompleted ? 'filled' : 'outlined'}
                            />
                            <ArrowForwardIcon color="action" />
                          </Stack>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Créée le {formatDate(list.createdAt)}
                          </Typography>
                          {list.isCompleted && (
                            <Chip
                              size="small"
                              label="Terminée"
                              color="success"
                            />
                          )}
                        </Stack>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                  {index < shoppingLists.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
} 