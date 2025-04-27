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
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import { BaseLayout } from '../shared/BaseLayout';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AxiosError } from 'axios';

interface Modality {
  id: number;
  name: string;
  price: number;
  payment_type: 'MONTHLY' | 'SESSION';
}

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  registration_date: string;
  active: boolean;
  notes: string | null;
  modality: number;
  modality_details: Modality;
}

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('Fetching students with active filter:', showOnlyActive);
      const response = await api.get(`/api/students/?active=${showOnlyActive}`);
      console.log('Students response:', response.data);
      setStudents(response.data);    } catch (error) {
      setError('Erro ao carregar alunos');
      const axiosError = error as AxiosError;
      console.error('Error fetching students:', axiosError);
      console.error('Error details:', {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este aluno?')) {
      return;
    }

    try {
      await api.delete(`/api/students/${id}/`);
      setSuccessMessage('Aluno excluído com sucesso');
      fetchStudents();    } catch (error) {
      const axiosError = error as AxiosError;
      setError('Erro ao excluir aluno');
      console.error('Error deleting student:', axiosError);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await api.patch(`/api/students/${id}/`, { active: !currentStatus });
      setSuccessMessage('Status do aluno atualizado com sucesso');
      fetchStudents();    } catch (error) {
      const axiosError = error as AxiosError;
      setError('Erro ao atualizar status do aluno');
      console.error('Error updating student status:', axiosError);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [showOnlyActive]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <BaseLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Alunos
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/students/new"
          >
            Novo Aluno
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
            label="Mostrar apenas alunos ativos"
          />
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Data de Nascimento</TableCell>
                <TableCell>Data de Registro</TableCell>
                <TableCell>Modalidade</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>{formatDate(student.date_of_birth)}</TableCell>
                  <TableCell>{formatDate(student.registration_date)}</TableCell>
                  <TableCell>
                    {student.modality_details ? 
                      `${student.modality_details.name} - ${student.modality_details.payment_type === 'MONTHLY' ? 'Mensal' : 'Por Sessão'}` : 
                      'Não definida'
                    }
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={student.active}
                          onChange={() => handleToggleActive(student.id, student.active)}
                          color="primary"
                        />
                      }
                      label={student.active ? 'Ativo' : 'Inativo'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      component={Link}
                      to={`/students/edit/${student.id}`}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(student.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Nenhum aluno encontrado
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

export default StudentList;
