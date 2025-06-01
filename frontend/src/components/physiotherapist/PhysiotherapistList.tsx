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
import { Link } from 'react-router-dom';
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
  const [physiotherapists, setPhysiotherapists] = useState<Physiotherapist[]>([]);  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fetchPhysiotherapists = async () => {
    try {
      const response = await api.get('/api/physiotherapists/');
      setPhysiotherapists(response.data);
    } catch (error) {
      setError('Erro ao carregar fisioterapeutas');
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

  const isMobile = window.innerWidth <= 600;

  return (
    <BaseLayout>
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', mb: 3, gap: 2 }}>
          <Typography variant={isMobile ? "h5" : "h4"} component="h1">
            Fisioterapeutas
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/physiotherapists/new"
            fullWidth={isMobile}
          >
            Novo Fisioterapeuta
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                {!isMobile && (
                  <>
                    <TableCell>Email</TableCell>
                    <TableCell>CREFITO</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Especialização</TableCell>
                  </>
                )}
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {physiotherapists.map((physio: Physiotherapist) => (
                <TableRow key={physio.id}>
                  <TableCell>
                    {`${physio.first_name} ${physio.last_name}`}
                    {isMobile && (
                      <>
                        <Typography variant="caption" display="block" color="text.secondary">
                          CREFITO: {physio.crefito}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {physio.phone}
                        </Typography>
                      </>
                    )}
                  </TableCell>
                  {!isMobile && (
                    <>
                      <TableCell>{physio.email}</TableCell>
                      <TableCell>{physio.crefito}</TableCell>
                      <TableCell>{physio.phone}</TableCell>
                      <TableCell>{physio.specialization}</TableCell>
                    </>
                  )}
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <IconButton
                        color="primary"
                        component={Link}
                        to={`/physiotherapists/edit/${physio.id}`}
                        size={isMobile ? "small" : "medium"}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(physio.id)}
                        size={isMobile ? "small" : "medium"}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {physiotherapists.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isMobile ? 2 : 6} align="center">
                    Nenhum fisioterapeuta encontrado
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
        </Snackbar>    </Box>
    </BaseLayout>
  );
};

export default PhysiotherapistList;
