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
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { BaseLayout } from '../shared/BaseLayout';
import api from '../../utils/axios';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import StudentScheduling from './StudentScheduling';

interface Schedule {
  id?: number;
  weekday: number;
  hour: number;
}

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
  payment_type: 'PRE' | 'POS';
  active: boolean;
  notes: string;
  physiotherapist?: number | null;
  modality: number;
  schedules: Schedule[];
  payment_date: Date | null;
  session_quantity: number | null;
  commission: number;
}

const StudentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [physiotherapists, setPhysiotherapists] = useState<Physiotherapist[]>([]);
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [selectedModality, setSelectedModality] = useState<Modality | null>(null);  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    email: '',
    phone: '',
    date_of_birth: null,
    payment_type: 'PRE',
    active: true,
    notes: '',
    physiotherapist: null,
    modality: 0,
    schedules: [],
    payment_date: null,
    session_quantity: null,
    commission: 50
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
        date_of_birth: new Date(student.date_of_birth),
        schedules: student.schedules || []
      });

      // Set selected modality
      const modality = student.modality_details;
      if (modality) {
        setSelectedModality(modality);
      }
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

      let studentId: number;
      if (isEdit) {
        await api.put(`/api/students/${id}/`, submitData);
        studentId = Number(id);
      } else {
        const response = await api.post('/api/students/', submitData);
        studentId = response.data.id;
      }

      // Handle schedules if modality is monthly
      if (selectedModality?.payment_type === 'MONTHLY') {
        // Delete existing schedules if editing
        if (isEdit) {
          const currentSchedules = await api.get(`/api/schedules/?student=${studentId}`);
          await Promise.all(
            currentSchedules.data.map((schedule: any) =>
              api.delete(`/api/schedules/${schedule.id}/`)
            )
          );
        }

        // Create new schedules
        await Promise.all(
          formData.schedules.map(schedule =>
            api.post('/api/schedules/', {
              ...schedule,
              student: studentId
            })
          )
        );
      }

      navigate('/students');
    } catch (error: any) {
      console.error('Error saving student:', error);
      setError(error.message || 'Erro ao salvar aluno');
    } finally {
      setLoading(false);
    }
  };  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleModalityChange = (event: any) => {
    const modalityId = Number(event.target.value);
    const selected = modalities.find(m => m.id === modalityId);
    
    setFormData(prev => ({
      ...prev,
      modality: modalityId,
      // Clear type-specific fields
      schedules: selected?.payment_type === 'MONTHLY' ? prev.schedules : [],
      payment_date: selected?.payment_type === 'MONTHLY' ? prev.payment_date : null,
      session_quantity: selected?.payment_type === 'SESSION' ? prev.session_quantity : null
    }));
    
    setSelectedModality(selected || null);
  };

  const handleSchedulesChange = (newSchedules: Schedule[]) => {
    setFormData(prev => ({
      ...prev,
      schedules: newSchedules
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
                onChange={handleTextChange}
                required
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleTextChange}
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={handleTextChange}
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
                <InputLabel id="payment-type-label">Tipo de Pagamento</InputLabel>
                <Select
                  labelId="payment-type-label"
                  label="Tipo de Pagamento"
                  name="payment_type"
                  value={formData.payment_type}
                  onChange={handleSelectChange}
                  disabled={loading}
                >
                  <MenuItem value="PRE">Pré-pago</MenuItem>
                  <MenuItem value="POS">Pós-pago</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel id="modality-label">Modalidade</InputLabel>
                <Select
                  labelId="modality-label"
                  label="Modalidade"
                  name="modality"
                  value={formData.modality || ''}
                  onChange={handleModalityChange}
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

              {selectedModality?.payment_type === 'MONTHLY' && (
                <StudentScheduling
                  schedules={formData.schedules}
                  onChange={handleSchedulesChange}
                />
              )}

              {user?.is_staff && (
                <FormControl fullWidth>
                  <InputLabel id="physiotherapist-label">Fisioterapeuta</InputLabel>
                  <Select
                    labelId="physiotherapist-label"
                    label="Fisioterapeuta"
                    name="physiotherapist"                    value={formData.physiotherapist?.toString() || ''}
                    onChange={handleSelectChange}
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
              )}

              <TextField
                fullWidth
                label="Comissão (%)"
                name="commission"
                type="number"
                value={formData.commission}
                onChange={handleTextChange}
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 1
                }}
                helperText="Porcentagem de comissão (entre 0 e 100%)"
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Observações"
                name="notes"
                value={formData.notes}
                onChange={handleTextChange}
                multiline
                rows={4}
                disabled={loading}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={handleSwitchChange}
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
