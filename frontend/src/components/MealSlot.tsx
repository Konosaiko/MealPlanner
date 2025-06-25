import { Paper, Typography, Box } from '@mui/material';
import type { WeekMeal } from '../types/weekMeal';

interface MealSlotProps {
  weekMeal: WeekMeal;
  onClick: () => void;
}

export default function MealSlot({ weekMeal, onClick }: MealSlotProps) {
  return (
    <Paper 
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2 },
        mb: { xs: 1.5, sm: 2 },
        cursor: 'pointer',
        borderColor: 'divider',
        borderRadius: '12px',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: '0 4px 12px -4px rgba(59, 130, 246, 0.25)',
          backgroundColor: '#f0f9ff',
          transform: 'translateY(-1px)',
        },
      }}
      onClick={onClick}
    >
      <Typography 
        variant="subtitle1" 
        sx={{ 
          fontWeight: 600, 
          color: 'text.primary', 
          textAlign: 'center', 
          mb: 1,
          fontSize: { xs: '0.875rem', sm: '1rem' },
          lineHeight: 1.3
        }}
      >
        {weekMeal.meal.name}
      </Typography>
      <Box sx={{ textAlign: 'center' }}>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            fontWeight: 500
          }}
        >
          🍽️ {weekMeal.portions} portion{weekMeal.portions > 1 ? 's' : ''}
        </Typography>
      </Box>
    </Paper>
  );
} 