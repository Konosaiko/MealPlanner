import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Box, Alert } from '@mui/material';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Tentative de connexion avec:', { email });
      
      const response = await api.post('/api/login', {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Réponse complète:', response);
      console.log('Headers:', response.headers);
      console.log('Status:', response.status);
      console.log('Data:', response.data);

      // Vérifier si le token est dans les headers ou dans le corps de la réponse
      const token = response.data?.token || response.headers['authorization']?.replace('Bearer ', '');
      
      if (token) {
        localStorage.setItem('token', token);
        navigate('/');
      } else {
        console.error('Token non trouvé dans la réponse:', {
          data: response.data,
          headers: response.headers
        });
        setError('Erreur de connexion: Token non reçu');
      }
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      console.error('Réponse d\'erreur:', error.response);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
        
        // Afficher un message d'erreur plus spécifique
        if (error.response.data && error.response.data.detail) {
          setError(error.response.data.detail);
        } else if (error.response.data && error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError('Erreur de connexion');
        }
      } else {
        setError('Erreur de connexion au serveur');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Paper className="p-8 max-w-md w-full space-y-8">
        <div>
          <Typography variant="h4" component="h1" className="text-center">
            MealPlanner
          </Typography>
          <Typography variant="h6" className="mt-2 text-center text-gray-600">
            Connectez-vous à votre compte
          </Typography>
        </div>

        {error && (
          <Alert severity="error" className="mt-4">
            {error}
          </Alert>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Box className="space-y-4">
            <TextField
              required
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              required
              fullWidth
              type="password"
              label="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </form>
      </Paper>
    </div>
  );
} 