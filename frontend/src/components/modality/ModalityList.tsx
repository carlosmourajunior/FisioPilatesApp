import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import api from '../../utils/axios';
import { BaseLayout } from '../shared/BaseLayout';
import { format } from 'date-fns';

interface Modality {
  id: number;
  name: string;
  description: string | null;
  price: number;
  payment_type: 'MONTHLY' | 'SESSION';
  created_at: string;
  updated_at: string;
}

const ModalityList: React.FC = () => {
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showOnlyActive, setShowOnlyActive] = useState(true);

  const fetchModalities = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/modalities/?active=${showOnlyActive}`);
      setModalities(response.data);
    } catch (error) {
      setError('Erro ao carregar modalidades');
      console.error('Error fetching modalities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta modalidade?')) {
      return;
    }

    try {
      await api.delete(`/api/modalities/${id}/`);
      setSuccessMessage('Modalidade excluída com sucesso');
      fetchModalities();
    } catch (error) {
      setError('Erro ao excluir modalidade');
      console.error('Error deleting modality:', error);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await api.patch(`/api/modalities/${id}/`, { active: !currentStatus });
      setSuccessMessage('Status da modalidade atualizado com sucesso');
      fetchModalities();
    } catch (error) {
      setError('Erro ao atualizar status da modalidade');
      console.error('Error updating modality status:', error);
    }
  };

  useEffect(() => {
    fetchModalities();
  }, [showOnlyActive]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <BaseLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Modalidades
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/modalities/new"
          >
            Nova Modalidade
          </Button>
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showOnlyActive}
                onChange={(e) => setShowOnlyActive(e.target.checked)}
                color="primary"
              />
            }
            label="Mostrar apenas modalidades ativas"
          />
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Tipo de Pagamento</TableCell>
                <TableCell>Preço</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {modalities.map((modality) => (
                <TableRow key={modality.id}>
                  <TableCell>{modality.name}</TableCell>
                  <TableCell>{modality.payment_type === 'MONTHLY' ? 'Mensal' : 'Sessão'}</TableCell>
                  <TableCell>{formatPrice(modality.price)}</TableCell>
                  <TableCell>{modality.description}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      component={Link}
                      to={`/modalities/edit/${modality.id}`}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(modality.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {modalities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Nenhuma modalidade encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage(null)}
        >
          <Alert severity="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        </Snackbar>
      </Box>
    </BaseLayout>
  );
};

export default ModalityList;
