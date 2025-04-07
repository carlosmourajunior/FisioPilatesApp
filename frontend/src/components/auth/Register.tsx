import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Paper, Stack, Alert, Link } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

interface FormData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}

export const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.password_confirm) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const { password_confirm, ...registerData } = formData;
      await register(registerData);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Erro no registro:', err);
      setError(
        err.response?.data?.password_confirm ||
        err.response?.data?.error ||
        err.message ||
        'Falha no registro. Por favor, tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Criar Conta
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                required
                fullWidth
                label="Nome"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                disabled={loading}
                autoFocus
              />
              <TextField
                required
                fullWidth
                label="Sobrenome"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                disabled={loading}
              />
            </Box>
            <TextField
              required
              fullWidth
              label="Nome de usuário"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              required
              fullWidth
              label="Senha"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              required
              fullWidth
              label="Confirmar Senha"
              name="password_confirm"
              type="password"
              value={formData.password_confirm}
              onChange={handleChange}
              disabled={loading}
              error={Boolean(formData.password && formData.password_confirm && formData.password !== formData.password_confirm)}
              helperText={
                formData.password && 
                formData.password_confirm && 
                formData.password !== formData.password_confirm
                  ? "As senhas não coincidem"
                  : ''
              }
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 1, height: 48 }}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                Já tem uma conta?{' '}
                <Link component={RouterLink} to="/login" variant="body2" underline="hover">
                  Entrar
                </Link>
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};