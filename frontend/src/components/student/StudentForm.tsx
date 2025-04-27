import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Snackbar,
  Paper,
  FormControlLabel,
  Switch,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { BaseLayout } from '../shared/BaseLayout';
import api from '../../utils/axios';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface Modality {
  id: number;
  name: string;
  price: number;
  payment_type: 'MONTHLY' | 'SESSION';
  description: string | null;
}

interface Physiotherapist {
  id: number;
  first_name: string;
  last_name: string;
}

interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  date_of_birth: Date | null;
  active: boolean;
  notes: string;
  physiotherapist?: number | null;
  modality: number;
}

const StudentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [physiotherapists, setPhysiotherapists] = useState<Physiotherapist[]>([]);
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    email: '',
    phone: '',
    date_of_birth: null,
    active: true,
    notes: '',
    physiotherapist: null,
    modality: 0
  });

  const isEdit = Boolean(id);

  const fetchPhysiotherapists = useCallback(async () => {
    if (!user?.is_staff) return;
    try {
      const response = await api.get('/api/physiotherapists/');
      setPhysiotherapists(response.data);
    } catch (error) {
      console.error('Error fetching physiotherapists:', error);
    }
  }, [user?.is_staff]);

  const fetchModalities = useCallback(async () => {
    try {
      const response = await api.get('/api/modalities/?active=true');
      setModalities(response.data);
    } catch (error) {
      console.error('Error fetching modalities:', error);
    }
  }, []);

  useEffect(() => {
    fetchPhysiotherapists();
    fetchModalities();
  }, [fetchPhysiotherapists, fetchModalities]);

  const fetchStudent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/students/${id}/`);
      const student = response.data;
      setFormData({
        ...student,
        date_of_birth: new Date(student.date_of_birth)
      });
    } catch (error) {
      console.error('Error fetching student:', error);
      setError('Erro ao carregar dados do aluno');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEdit) {
      fetchStudent();
    }
  }, [isEdit, fetchStudent]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoading(true);
      const submitData = {
        ...formData,
        date_of_birth: formData.date_of_birth?.toISOString().split('T')[0]
      };

      if (isEdit) {
        await api.put(`/api/students/${id}/`, submitData);
      } else {
        await api.post('/api/students/', submitData);
      }
      navigate('/students');
    } catch (error: any) {
      console.error('Error saving student:', error);
      setError(error.message || 'Erro ao salvar aluno');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'active' ? checked : value
    }));
  };

  return (
    <BaseLayout>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {isEdit ? 'Editar' : 'Novo'} Aluno
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Nome"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  label="Data de Nascimento"
                  value={formData.date_of_birth}
                  onChange={(date: Date | null) => setFormData(prev => ({ ...prev, date_of_birth: date }))}
                  format="dd/MM/yyyy"
                  disabled={loading}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>

              <FormControl fullWidth required>
                <InputLabel id="modality-label">Modalidade</InputLabel>
                <Select
                  labelId="modality-label"
                  label="Modalidade"
                  name="modality"
                  value={formData.modality || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, modality: Number(e.target.value) }))}
                  disabled={loading}
                >
                  <MenuItem value="">
                    <em>Selecione uma modalidade</em>
                  </MenuItem>
                  {modalities.map((modality) => (
                    <MenuItem key={modality.id} value={modality.id}>
                      {`${modality.name} - ${modality.payment_type === 'MONTHLY' ? 'Mensal' : 'Por Sessão'} - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(modality.price)}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {user?.is_staff && (
                <FormControl fullWidth>
                  <InputLabel id="physiotherapist-label">Fisioterapeuta</InputLabel>
                  <Select
                    labelId="physiotherapist-label"
                    label="Fisioterapeuta"
                    name="physiotherapist"
                    value={formData.physiotherapist || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, physiotherapist: e.target.value ? Number(e.target.value) : null }))}
                    disabled={loading}
                  >
                    <MenuItem value="">
                      <em>Nenhum</em>
                    </MenuItem>
                    {physiotherapists.map((physio) => (
                      <MenuItem key={physio.id} value={physio.id}>
                        {`${physio.first_name} ${physio.last_name}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}              <TextField
                fullWidth
                label="Observações"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={4}
                disabled={loading}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={handleChange}
                    name="active"
                    disabled={loading}
                  />
                }
                label="Aluno Ativo"
              />

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Cadastrar')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/students')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </Box>
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
        </Snackbar>
      </Box>
    </BaseLayout>
  );
};

export default StudentForm;
