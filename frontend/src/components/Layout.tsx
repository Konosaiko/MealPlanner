import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  useMediaQuery, 
  useTheme 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState } from 'react';

export default function Layout() {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isShoppingListActive = location.pathname.startsWith('/shopping-list');

  const navigationItems = [
    { 
      path: '/', 
      label: 'Planning', 
      icon: <CalendarMonthIcon />, 
      isActive: location.pathname === '/',
      color: '#3b82f6'
    },
    { 
      path: '/meals', 
      label: 'Repas', 
      icon: <RestaurantMenuIcon />, 
      isActive: location.pathname === '/meals',
      color: '#10b981'
    },
    { 
      path: '/shopping-list', 
      label: 'Courses', 
      icon: <ShoppingCartIcon />, 
      isActive: isShoppingListActive,
      color: '#f59e0b'
    },
    { 
      path: '/settings', 
      label: 'Paramètres', 
      icon: <SettingsIcon />, 
      isActive: location.pathname === '/settings',
      color: '#8b5cf6'
    },
  ];

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: '#ffffff',
          borderBottom: '2px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        }}
      >
        <Toolbar sx={{ py: { xs: 0.5, md: 1 } }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"}
            component="div" 
            sx={{ 
              flexGrow: 1, 
              color: '#1f2937', 
              fontWeight: 800,
              letterSpacing: '-0.025em',
              fontSize: { xs: '1.25rem', md: '1.5rem' }
            }}
          >
            🍽️ MealPlanner
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navigationItems.map((item) => (
                <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                  <Button
                    startIcon={item.icon}
                    sx={{
                      px: 3,
                      py: 1.5,
                      borderRadius: '12px',
                      color: item.isActive ? '#ffffff' : '#64748b',
                      bgcolor: item.isActive ? item.color : 'transparent',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      border: item.isActive ? 'none' : '1px solid #e2e8f0',
                      boxShadow: item.isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                      '&:hover': {
                        bgcolor: item.isActive ? item.color : '#f8fafc',
                        color: item.isActive ? '#ffffff' : '#1f2937',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.1)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuToggle}
              sx={{ 
                color: '#1f2937',
                bgcolor: '#f8fafc',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: '#3b82f6',
                  color: '#ffffff',
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            bgcolor: '#ffffff',
            borderLeft: '1px solid #e5e7eb',
            boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <Box sx={{ pt: 2, pb: 1 }}>
          <Typography
            variant="h6"
            sx={{
              px: 3,
              pb: 2,
              color: '#1f2937',
              fontWeight: 700,
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            🍽️ MealPlanner
          </Typography>
          <List sx={{ pt: 2 }}>
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={handleMobileMenuClose}
              >
                <ListItem
                  sx={{
                    mx: 2,
                    mb: 1,
                    borderRadius: '12px',
                    bgcolor: item.isActive ? `${item.color}15` : 'transparent',
                    border: item.isActive ? `2px solid ${item.color}` : '2px solid transparent',
                    '&:hover': {
                      bgcolor: item.isActive ? `${item.color}25` : '#f8fafc',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: item.isActive ? item.color : '#6b7280',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: item.isActive ? 600 : 500,
                        color: item.isActive ? item.color : '#374151',
                      },
                    }}
                  />
                </ListItem>
              </Link>
            ))}
          </List>
        </Box>
      </Drawer>

      <div style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <Outlet />
      </div>
    </div>
  );
} 