import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Snackbar,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/axios';
import { BaseLayout } from '../shared/BaseLayout';

interface ModalityFormData {
  name: string;
  description: string;
  frequency: string;
  price: string;
  active: boolean;
}

const ModalityForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [formData, setFormData] = useState<ModalityFormData>({
    name: '',
    description: '',
    frequency: '',
    price: '',
    active: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      loadModality();
    }
  }, [id]);

  const loadModality = async () => {
    try {
      const response = await api.get(`/api/modalities/${id}/`);
      setFormData({
        name: response.data.name,
        description: response.data.description || '',
        frequency: response.data.frequency,
        price: response.data.price.toString(),
        active: response.data.active,
      });
    } catch (error) {
      setError('Erro ao carregar modalidade');
      console.error('Error loading modality:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (isEditing) {
        await api.put(`/api/modalities/${id}/`, payload);
      } else {
        await api.post('/api/modalities/', payload);
      }

      navigate('/modalities');
    } catch (error) {
      setError('Erro ao salvar modalidade');
      console.error('Error saving modality:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <BaseLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditing ? 'Editar Modalidade' : 'Nova Modalidade'}
        </Typography>

        <Paper sx={{ p: 3, mt: 2 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nome"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
              />

              <TextField
                label="Frequência"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                required
                fullWidth
                helperText="Ex: 2x por semana, 3x por semana"
              />

              <TextField
                label="Preço"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                fullWidth
                type="number"
                inputProps={{ step: "0.01" }}
              />

              <TextField
                label="Descrição"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  onClick={() => navigate('/modalities')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Salvar
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </BaseLayout>
  );
};

export default ModalityForm;
