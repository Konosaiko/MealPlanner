import { useState } from 'react';
import {
  Paper,
  Typography,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoGenerateList: true,
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      <Typography variant="h4" component="h1">
        Paramètres
      </Typography>

      <Paper className="p-4">
        <List>
          <ListItem>
            <ListItemText
              primary="Notifications"
              secondary="Recevoir des rappels pour la planification"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings.notifications}
                onChange={() => handleToggle('notifications')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Mode sombre"
              secondary="Activer le thème sombre"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings.darkMode}
                onChange={() => handleToggle('darkMode')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Génération automatique"
              secondary="Générer automatiquement la liste de courses"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings.autoGenerateList}
                onChange={() => handleToggle('autoGenerateList')}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>

        <div className="mt-8">
          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={handleLogout}
          >
            Se déconnecter
          </Button>
        </div>
      </Paper>
    </div>
  );
} 