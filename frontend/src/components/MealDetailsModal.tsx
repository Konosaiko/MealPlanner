import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Box,
  Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { Meal } from '../types/meal';

interface MealDetailsModalProps {
  open: boolean;
  onClose: () => void;
  meal: Meal | null;
  onEdit: () => void;
  onDelete: () => void;
  adjustedPortions?: number;
}

export default function MealDetailsModal({ 
  open, 
  onClose, 
  meal, 
  onEdit, 
  onDelete,
  adjustedPortions
}: MealDetailsModalProps) {
  if (!meal) return null;

  const ingredients = meal.ingredients || [];
  
  const portionRatio = adjustedPortions && meal.portions 
    ? adjustedPortions / meal.portions 
    : 1;

  const displayPortions = adjustedPortions || meal.portions;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          {meal.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <AccessTimeIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {meal.preparationTime} minutes de préparation
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
            {displayPortions} portion{displayPortions > 1 ? 's' : ''}
            {adjustedPortions && adjustedPortions !== meal.portions && (
              <span style={{ color: 'text.secondary', fontWeight: 400 }}>
                {' '}(recette originale : {meal.portions} portion{meal.portions > 1 ? 's' : ''})
              </span>
            )}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {meal.description && (
          <>
            <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
              Description
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              {meal.description}
            </Typography>
            <Divider sx={{ mb: 3 }} />
          </>
        )}

        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          Ingrédients ({ingredients.length})
        </Typography>
        
        {ingredients.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {ingredients.map((ingredient, index) => {
              const adjustedQuantity = Math.round((ingredient.quantity * portionRatio) * 100) / 100;
              
              return (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {ingredient.name}
                  </Typography>
                  <Chip 
                    label={`${adjustedQuantity} ${ingredient.unit}`}
                    size="small"
                    variant="outlined"
                    color={adjustedPortions && adjustedPortions !== meal.portions ? "primary" : "default"}
                  />
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Aucun ingrédient défini
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>
          Fermer
        </Button>
        <Button
          onClick={onEdit}
          variant="outlined"
          startIcon={<EditIcon />}
          color="primary"
        >
          Modifier
        </Button>
        <Button
          onClick={onDelete}
          variant="outlined"
          startIcon={<DeleteIcon />}
          color="error"
        >
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  );
} 