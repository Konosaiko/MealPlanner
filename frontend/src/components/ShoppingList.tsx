import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Menu,
  ListItemIcon,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GetAppIcon from '@mui/icons-material/GetApp';
import { useParams } from 'react-router-dom';
import api from '../services/api';

interface ShoppingItem {
  id: number;
  ingredient: {
    id: number;
    name: string;
  };
  quantity: string;
  unit: string;
  isAvailable: boolean;
}

interface ShoppingList {
  id: number;
  items: ShoppingItem[];
  generatedAt: string;
  isCompleted: boolean;
}

const COMMON_UNITS = [
  'g',
  'kg',
  'ml',
  'l',
  'pièce',
  'unité',
  'cuillère à soupe',
  'cuillère à café',
  'tasse',
  'verre',
  'tranche',
  'pincée',
];

export default function ShoppingList() {
  const { weekPlanningId } = useParams();
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableIngredients, setAvailableIngredients] = useState<number[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    unit: 'pièce',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchShoppingList = async () => {
    try {
      setLoading(true);
      // D'abord essayer de récupérer une liste existante
      const getResponse = await api.get(`/api/shopping-list/${weekPlanningId}`);
      
      if (getResponse.status === 200) {
        const listData = getResponse.data;
        const formattedList = {
          id: listData.id,
          items: listData.shoppingItems.map((item: any) => ({
            id: item.id,
            ingredient: item.ingredient,
            quantity: item.quantity,
            unit: item.unit,
            isAvailable: item.isAvailable,
          })),
          generatedAt: listData.createdAt,
          isCompleted: listData.isCompleted || false,
        };
        
        setShoppingList(formattedList);
        setAvailableIngredients(
          formattedList.items
            .filter((item: ShoppingItem) => item.isAvailable)
            .map((item: ShoppingItem) => item.ingredient.id)
        );
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Si aucune liste n'existe, essayer de la générer
        try {
          const generateResponse = await api.post(`/api/shopping-list/generate/${weekPlanningId}`);
          if (generateResponse.status === 200) {
            // Récupérer la liste générée
            await fetchShoppingList();
            return;
          }
        } catch (generateErr) {
          setError('Erreur lors de la génération de la liste de courses');
        }
      } else {
        setError(err.response?.data?.message || 'Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShoppingList();
  }, [weekPlanningId]);

  const handleIngredientToggle = async (ingredientId: number) => {
    // Trouver l'item correspondant à cet ingrédient
    const item = shoppingList?.items.find(item => item.ingredient.id === ingredientId);
    if (!item) return;

    const newAvailableIngredients = availableIngredients.includes(ingredientId)
      ? availableIngredients.filter(id => id !== ingredientId)
      : [...availableIngredients, ingredientId];

    setAvailableIngredients(newAvailableIngredients);

    try {
      // Utiliser l'API de toggle directement sur l'item
      await api.patch(`/api/shopping-list/item/${item.id}/toggle`);
      
      // Rafraîchir la liste après modification
      await fetchShoppingList();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour des ingrédients');
      // Restaurer l'état précédent en cas d'erreur
      setAvailableIngredients(availableIngredients);
    }
  };

  const handleAddIngredient = async () => {
    if (!newIngredient.name.trim() || !newIngredient.quantity.trim()) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      setAddLoading(true);
      const response = await api.post(`/api/shopping-list/${shoppingList?.id}/item`, {
        ingredientName: newIngredient.name.trim(),
        quantity: newIngredient.quantity,
        unit: newIngredient.unit,
      });

      if (response.status === 200) {
        // Rafraîchir la liste après ajout
        await fetchShoppingList();
        setAddDialogOpen(false);
        setNewIngredient({ name: '', quantity: '', unit: 'pièce' });
        setError(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout de l\'ingrédient');
    } finally {
      setAddLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setAddDialogOpen(false);
    setNewIngredient({ name: '', quantity: '', unit: 'pièce' });
    setError(null);
  };

  const formatShoppingListText = () => {
    if (!shoppingList) return '';
    
    const today = new Date();
    const formattedDate = today.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    let text = `📝 LISTE DE COURSES\n`;
    text += `📅 ${formattedDate}\n\n`;
    
    const remainingItems = shoppingList.items.filter(item => 
      !availableIngredients.includes(item.ingredient.id)
    );
    
    const completedItems = shoppingList.items.filter(item => 
      availableIngredients.includes(item.ingredient.id)
    );
    
    if (remainingItems.length > 0) {
      text += `🛒 À ACHETER (${remainingItems.length}):\n`;
      remainingItems.forEach(item => {
        text += `☐ ${item.ingredient.name} - ${item.quantity} ${item.unit}\n`;
      });
      text += '\n';
    }
    
    if (completedItems.length > 0) {
      text += `✅ DÉJÀ DISPONIBLE (${completedItems.length}):\n`;
      completedItems.forEach(item => {
        text += `☑ ${item.ingredient.name} - ${item.quantity} ${item.unit}\n`;
      });
    }
    
    return text;
  };

  const handleExportMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handleCopyToClipboard = async () => {
    try {
      const text = formatShoppingListText();
      await navigator.clipboard.writeText(text);
      setSnackbar({ open: true, message: 'Liste copiée dans le presse-papiers !', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors de la copie', severity: 'error' });
    }
    handleExportMenuClose();
  };

  const handleNativeShare = async () => {
    try {
      const text = formatShoppingListText();
      
      if (navigator.share) {
        await navigator.share({
          title: 'Liste de courses',
          text: text,
        });
      } else {
        // Fallback pour les navigateurs qui ne supportent pas Web Share API
        await navigator.clipboard.writeText(text);
        setSnackbar({ open: true, message: 'Liste copiée (partage non supporté)', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors du partage', severity: 'error' });
    }
    handleExportMenuClose();
  };

  const handleDownloadText = () => {
    try {
      const text = formatShoppingListText();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `liste-courses-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSnackbar({ open: true, message: 'Fichier téléchargé !', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors du téléchargement', severity: 'error' });
    }
    handleExportMenuClose();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!shoppingList) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Aucune liste de courses disponible
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2" display="flex" alignItems="center">
          <ShoppingCartIcon sx={{ mr: 1 }} />
          Liste de courses
        </Typography>
        <Box>
          <Tooltip title="Exporter la liste">
            <IconButton onClick={handleExportMenuOpen} color="primary" sx={{ mr: 1 }}>
              <ShareIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ajouter un ingrédient">
            <IconButton onClick={() => setAddDialogOpen(true)} color="primary" sx={{ mr: 1 }}>
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rafraîchir la liste">
            <IconButton onClick={fetchShoppingList} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <List>
            {shoppingList.items.map((item) => (
              <ListItem
                key={item.id}
                secondaryAction={
                  <Checkbox
                    edge="end"
                    checked={availableIngredients.includes(item.ingredient.id)}
                    onChange={() => handleIngredientToggle(item.ingredient.id)}
                  />
                }
              >
                <ListItemText
                  primary={item.ingredient.name}
                  secondary={`${item.quantity} ${item.unit}`}
                  sx={{
                    textDecoration: availableIngredients.includes(item.ingredient.id)
                      ? 'line-through'
                      : 'none',
                    color: availableIngredients.includes(item.ingredient.id)
                      ? 'text.secondary'
                      : 'text.primary',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Dialog pour ajouter un ingrédient */}
      <Dialog open={addDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un ingrédient</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              autoFocus
              fullWidth
              label="Nom de l'ingrédient"
              value={newIngredient.name}
              onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="Ex: Lait, Pain, Pommes..."
            />
            
            <Box display="flex" gap={2}>
              <TextField
                label="Quantité"
                value={newIngredient.quantity}
                onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
                sx={{ flex: 1 }}
                placeholder="Ex: 1, 500, 2.5..."
              />
              
              <TextField
                select
                label="Unité"
                value={newIngredient.unit}
                onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                sx={{ flex: 1 }}
              >
                {COMMON_UNITS.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={addLoading}>
            Annuler
          </Button>
          <Button 
            onClick={handleAddIngredient} 
            variant="contained" 
            disabled={addLoading}
            startIcon={addLoading ? <CircularProgress size={20} /> : null}
          >
            {addLoading ? 'Ajout...' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu d'export */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleNativeShare}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          Partager vers Notes/Apps
        </MenuItem>
        <MenuItem onClick={handleCopyToClipboard}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          Copier le texte
        </MenuItem>
        <MenuItem onClick={handleDownloadText}>
          <ListItemIcon>
            <GetAppIcon fontSize="small" />
          </ListItemIcon>
          Télécharger (.txt)
        </MenuItem>
      </Menu>

      {/* Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
} 