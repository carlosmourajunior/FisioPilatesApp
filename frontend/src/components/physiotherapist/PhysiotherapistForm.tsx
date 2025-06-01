import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Snackbar,
  Paper,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/axios';
import { BaseLayout } from '../shared/BaseLayout';

interface PhysiotherapistFormProps {}

/*
interface FormErrorState {
  error: string | null;
}
*/

interface PhysiotherapistFormData {
  username: string;
  email: string;
  password?: string;
  password_confirm?: string;
  first_name: string;
  last_name: string;
  crefito: string;
  phone: string;
  specialization: string;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

const PhysiotherapistForm: React.FC<PhysiotherapistFormProps> = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PhysiotherapistFormData>({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    crefito: '',
    phone: '',
    specialization: ''
  });
  
  const isEdit = Boolean(id);

  const fetchPhysiotherapist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/physiotherapists/${id}/`);
      const { password, password_confirm, ...data } = response.data;
      setFormData(data);
    } catch (error) {
      setError('Erro ao carregar dados do fisioterapeuta');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEdit) {
      fetchPhysiotherapist();
    }
  }, [isEdit, fetchPhysiotherapist]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoading(true);
      const apiData = {
        ...formData,
        user: {
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name
        }
      };
      
      if (isEdit) {
        await api.put(`/api/physiotherapists/${id}/`, apiData);
      } else {
        await api.post('/api/physiotherapists/', apiData);
      }
      navigate('/physiotherapists');
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Erro ao salvar fisioterapeuta';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePasswords = (): string => {
    if (!isEdit && formData.password !== formData.password_confirm) {
      return "As senhas não coincidem";
    }
    return "";
  };
  return (
    <BaseLayout>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEdit ? 'Editar' : 'Novo'} Fisioterapeuta
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flexBasis: { xs: '100%', sm: '45%' } }}>
              <TextField
                fullWidth
                label="Nome"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Box>
            <Box sx={{ flexBasis: { xs: '100%', sm: '45%' } }}>
              <TextField
                fullWidth
                label="Sobrenome"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Box>
            <Box sx={{ flexBasis: { xs: '100%', sm: '45%' } }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Box>
            <Box sx={{ flexBasis: { xs: '100%', sm: '45%' } }}>
              <TextField
                fullWidth
                label="Nome de usuário"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Box>
            
            {!isEdit && (
              <>
                <Box sx={{ flexBasis: { xs: '100%', sm: '45%' } }}>
                  <TextField
                    fullWidth
                    label="Senha"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    margin="normal"
                  />
                </Box>
                <Box sx={{ flexBasis: { xs: '100%', sm: '45%' } }}>
                  <TextField
                    fullWidth
                    label="Confirmar senha"
                    name="password_confirm"
                    type="password"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    required
                    margin="normal"
                    error={!!validatePasswords()}
                    helperText={validatePasswords()}
                  />
                </Box>
              </>
            )}
            <Box sx={{ flexBasis: { xs: '100%', sm: '45%' } }}>
              <TextField
                fullWidth
                label="CREFITO"
                name="crefito"
                value={formData.crefito}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Box>
            <Box sx={{ flexBasis: { xs: '100%', sm: '45%' } }}>
              <TextField
                fullWidth
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Box>
            <Box sx={{ flexBasis: '100%' }}>
              <TextField
                fullWidth
                label="Especialização"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Box>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {isEdit ? 'Atualizar' : 'Cadastrar'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/physiotherapists')}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>      </Box>
    </BaseLayout>
  );
};

export default PhysiotherapistForm;
