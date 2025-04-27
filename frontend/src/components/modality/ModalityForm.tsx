import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/axios';
import { BaseLayout } from '../shared/BaseLayout';

interface ModalityFormData {
  name: string;
  description: string;
  price: string;
  payment_type: 'MONTHLY' | 'SESSION';
}

const ModalityForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [formData, setFormData] = useState<ModalityFormData>({
    name: '',
    description: '',
    price: '',
    payment_type: 'MONTHLY',
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
        price: response.data.price.toString(),
        payment_type: response.data.payment_type,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

              <FormControl fullWidth required>
                <InputLabel id="payment-type-label">Tipo de Pagamento</InputLabel>
                <Select
                  labelId="payment-type-label"
                  name="payment_type"
                  value={formData.payment_type}
                  label="Tipo de Pagamento"
                  onChange={handleChange}
                >
                  <MenuItem value="MONTHLY">Mensal</MenuItem>
                  <MenuItem value="SESSION">Sessão</MenuItem>
                </Select>
              </FormControl>

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
