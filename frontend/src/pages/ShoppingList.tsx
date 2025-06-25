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
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Stack,
  Divider,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GetAppIcon from '@mui/icons-material/GetApp';
import { useParams } from 'react-router-dom';

interface Ingredient {
  id: number;
  name: string;
}

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
  shoppingItems: ShoppingItem[];
  weekStart: string;
  createdAt: string;
}

interface EditItemData {
  quantity: string;
  unit: string;
  ingredientName: string;
}

export default function ShoppingList() {
  const { date } = useParams();
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [originalShoppingList, setOriginalShoppingList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [editData, setEditData] = useState<EditItemData>({ quantity: '', unit: '', ingredientName: '' });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemData, setNewItemData] = useState<EditItemData>({ quantity: '', unit: '', ingredientName: '' });
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchShoppingList = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(`http://localhost:8000/api/shopping-list/${date}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la liste de courses');
      }

      const data = await response.json();
      console.log('Données reçues du backend:', data); // Debug
      setShoppingList(data);
      setOriginalShoppingList(JSON.parse(JSON.stringify(data))); // Deep copy pour comparaison
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredients = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/ingredients', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableIngredients(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des ingrédients:', err);
      setAvailableIngredients([]);
    }
  };

  useEffect(() => {
    fetchShoppingList();
    fetchIngredients();
  }, [date]);

  // Vérifier s'il y a des changements non sauvegardés
  useEffect(() => {
    if (!shoppingList || !originalShoppingList) {
      setHasUnsavedChanges(false);
      return;
    }

    // Comparer les états des checkboxes
    const hasChanges = shoppingList.shoppingItems.some(item => {
      const originalItem = originalShoppingList.shoppingItems.find(orig => orig.id === item.id);
      return originalItem && originalItem.isAvailable !== item.isAvailable;
    });

    setHasUnsavedChanges(hasChanges);
  }, [shoppingList, originalShoppingList]);

  const handleIngredientToggle = async (itemId: number) => {
    if (!shoppingList) return;

    // Mise à jour locale uniquement (pas de sauvegarde automatique)
    const updatedItems = shoppingList.shoppingItems.map(item => 
      item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
    );
    setShoppingList({ ...shoppingList, shoppingItems: updatedItems });
  };

  const handleEditItem = (item: ShoppingItem) => {
    setEditingItem(item);
    setEditData({
      quantity: item.quantity,
      unit: item.unit,
      ingredientName: item.ingredient.name
    });
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !shoppingList) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(`http://localhost:8000/api/shopping-list/item/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity: editData.quantity,
          unit: editData.unit,
          ingredientName: editData.ingredientName
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modification de l\'élément');
      }

      await fetchShoppingList();
      setEditingItem(null);
      setEditData({ quantity: '', unit: '', ingredientName: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!shoppingList) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(`http://localhost:8000/api/shopping-list/item/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'élément');
      }

      await fetchShoppingList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleAddItem = async () => {
    if (!shoppingList || !newItemData.ingredientName || !newItemData.quantity) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(`http://localhost:8000/api/shopping-list/${shoppingList.id}/item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity: newItemData.quantity,
          unit: newItemData.unit,
          ingredientName: newItemData.ingredientName
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout de l\'élément');
      }

      await fetchShoppingList();
      setIsAddDialogOpen(false);
      setNewItemData({ quantity: '', unit: '', ingredientName: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleSaveList = async () => {
    if (!shoppingList) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Non authentifié');
      }

      // Sauvegarder tous les états des checkboxes
      const updatePromises = shoppingList.shoppingItems.map(item => {
        const originalItem = originalShoppingList?.shoppingItems.find(orig => orig.id === item.id);
        
        // Seulement si l'état a changé
        if (originalItem && originalItem.isAvailable !== item.isAvailable) {
          return fetch(`http://localhost:8000/api/shopping-list/item/${item.id}/toggle`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          });
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);

      // Marquer la liste comme sauvegardée
      const response = await fetch(`http://localhost:8000/api/shopping-list/${shoppingList.id}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde de la liste');
      }

      // Mettre à jour l'état de référence
      setOriginalShoppingList(JSON.parse(JSON.stringify(shoppingList)));
      setHasUnsavedChanges(false);
      
      // Optionnel : afficher un message de succès
      console.log('Liste sauvegardée avec succès !');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
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
    
    const remainingItems = shoppingList.shoppingItems.filter(item => !item.isAvailable);
    const completedItems = shoppingList.shoppingItems.filter(item => item.isAvailable);
    
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
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2" display="flex" alignItems="center">
          <ShoppingCartIcon sx={{ mr: 1 }} />
          Liste de courses
          {hasUnsavedChanges && <Typography variant="body2" color="warning.main" sx={{ ml: 1 }}>*</Typography>}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Exporter la liste">
            <IconButton onClick={handleExportMenuOpen} color="primary">
              <ShareIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sauvegarder la liste">
            <span>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveList}
                disabled={!hasUnsavedChanges}
              >
                Sauvegarder
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Rafraîchir la liste">
            <IconButton onClick={fetchShoppingList} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Card>
        <CardContent>
          <List>
            {shoppingList.shoppingItems.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem
                  secondaryAction={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Checkbox
                        edge="end"
                        checked={Boolean(item.isAvailable)}
                        onChange={() => handleIngredientToggle(item.id)}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleEditItem(item)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteItem(item.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemText
                    primary={item.ingredient.name}
                    secondary={`${item.quantity} ${item.unit}`}
                    sx={{
                      textDecoration: item.isAvailable ? 'line-through' : 'none',
                      color: item.isAvailable ? 'text.secondary' : 'text.primary',
                    }}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Bouton flottant pour ajouter un élément */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setIsAddDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Dialog d'édition */}
      <Dialog open={!!editingItem} onClose={() => setEditingItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier l'élément</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={availableIngredients || []}
              getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
              freeSolo
              inputValue={editData.ingredientName}
              onChange={(_, value) => {
                setEditData(prev => ({
                  ...prev,
                  ingredientName: value ? (typeof value === 'string' ? value : value.name) : ''
                }));
              }}
              onInputChange={(_, value) => {
                setEditData(prev => ({
                  ...prev,
                  ingredientName: value || ''
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Ingrédient"
                  required
                />
              )}
            />
            <TextField
              label="Quantité"
              value={editData.quantity}
              onChange={(e) => setEditData(prev => ({ ...prev, quantity: e.target.value }))}
              required
            />
            <TextField
              label="Unité"
              value={editData.unit}
              onChange={(e) => setEditData(prev => ({ ...prev, unit: e.target.value }))}
              placeholder="g, kg, L, pièce(s)..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingItem(null)}>Annuler</Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={!editData.ingredientName || !editData.quantity}
          >
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog d'ajout */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un élément</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={availableIngredients || []}
              getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
              freeSolo
              inputValue={newItemData.ingredientName}
              onChange={(_, value) => {
                setNewItemData(prev => ({
                  ...prev,
                  ingredientName: value ? (typeof value === 'string' ? value : value.name) : ''
                }));
              }}
              onInputChange={(_, value) => {
                setNewItemData(prev => ({
                  ...prev,
                  ingredientName: value || ''
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Ingrédient"
                  required
                />
              )}
            />
            <TextField
              label="Quantité"
              value={newItemData.quantity}
              onChange={(e) => setNewItemData(prev => ({ ...prev, quantity: e.target.value }))}
              required
            />
            <TextField
              label="Unité"
              value={newItemData.unit}
              onChange={(e) => setNewItemData(prev => ({ ...prev, unit: e.target.value }))}
              placeholder="g, kg, L, pièce(s)..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
          <Button
            onClick={handleAddItem}
            variant="contained"
            disabled={!newItemData.ingredientName || !newItemData.quantity}
          >
            Ajouter
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