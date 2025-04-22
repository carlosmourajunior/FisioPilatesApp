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
  Snackbar
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import { BaseLayout } from '../shared/BaseLayout';

interface Physiotherapist {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  crefito: string;
  phone: string;
  specialization: string;
}

const PhysiotherapistList: React.FC = () => {
  const [physiotherapists, setPhysiotherapists] = useState<Physiotherapist[]>([]);  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPhysiotherapists = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/physiotherapists/');
      setPhysiotherapists(response.data);
    } catch (error) {
      setError('Erro ao carregar fisioterapeutas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/physiotherapists/${id}/`);
      setSuccessMessage('Fisioterapeuta excluído com sucesso');
      fetchPhysiotherapists();
    } catch (error) {
      setError('Erro ao excluir fisioterapeuta');
    }
  };

  useEffect(() => {
    fetchPhysiotherapists();
  }, []);
  return (
    <BaseLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Fisioterapeutas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/physiotherapists/new"
        >
          Novo Fisioterapeuta
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>CREFITO</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Especialização</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {physiotherapists.map((physio: Physiotherapist) => (
              <TableRow key={physio.id}>
                <TableCell>{`${physio.first_name} ${physio.last_name}`}</TableCell>
                <TableCell>{physio.email}</TableCell>
                <TableCell>{physio.crefito}</TableCell>
                <TableCell>{physio.phone}</TableCell>
                <TableCell>{physio.specialization}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    component={Link}
                    to={`/physiotherapists/edit/${physio.id}`}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(physio.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
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
      </Snackbar>    </Box>
    </BaseLayout>
  );
};

export default PhysiotherapistList;
