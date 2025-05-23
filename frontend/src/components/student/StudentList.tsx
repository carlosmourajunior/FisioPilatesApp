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
  FormControlLabel,
  Chip,
  Card,
  CardContent,
  TextField,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, AttachMoney as AttachMoneyIcon, Visibility as VisibilityIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import { BaseLayout } from '../shared/BaseLayout';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AxiosError } from 'axios';
import PaymentForm from '../payment/PaymentForm';
import { PaymentService } from '../../services/PaymentService';
import { PaymentStatus } from '../../types/payment';

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
  payment_date: string | null;
  session_quantity: number | null;
  commission: number;
}

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [paymentStatuses, setPaymentStatuses] = useState<Record<number, PaymentStatus>>({});
  const isMobile = window.innerWidth <= 600;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/students/?active=${showOnlyActive}`);
      setStudents(response.data);
      
      // Fetch payment status for each student
      const statuses: Record<number, PaymentStatus> = {};
      await Promise.all(
        response.data.map(async (student: Student) => {
          if (student.modality) {
            try {
              const status = await PaymentService.getPaymentStatus(student.id);
              statuses[student.id] = status;
            } catch (error) {
              console.error('Error fetching payment status for student:', student.id, error);
            }
          }
        })
      );
      setPaymentStatuses(statuses);
    } catch (error) {
      setError('Erro ao carregar alunos');
      const axiosError = error as AxiosError;
      console.error('Error fetching students:', axiosError);
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
      fetchStudents();
    } catch (error) {
      const axiosError = error as AxiosError;
      setError('Erro ao excluir aluno');
      console.error('Error deleting student:', axiosError);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await api.patch(`/api/students/${id}/`, { active: !currentStatus });
      setSuccessMessage('Status do aluno atualizado com sucesso');
      fetchStudents();
    } catch (error) {
      const axiosError = error as AxiosError;
      setError('Erro ao atualizar status do aluno');
      console.error('Error updating student status:', axiosError);
    }
  };

  const handlePaymentClick = (student: Student) => {
    setSelectedStudent(student);
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    setSuccessMessage('Pagamento registrado com sucesso');
    fetchStudents();
  };

  useEffect(() => {
    fetchStudents();
  }, [showOnlyActive]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const renderPaymentStatus = (student: Student) => {
    const status = paymentStatuses[student.id];
    if (!status || !student.modality_details) return null;

    if (status.payment_type === 'MONTHLY') {
      return (
        <Chip
          label={status.paid_current_month ? 'Mês atual pago' : 'Pagamento pendente'}
          color={status.paid_current_month ? 'success' : 'warning'}
          size="small"
        />
      );
    } else {
      if (!status.session_quantity) return null;
      const percentPaid = ((status.total_paid || 0) / (status.total_value || 1)) * 100;
      return (
        <Box>
          <Typography variant="body2">
            {formatCurrency(status.total_paid || 0)} / {formatCurrency(status.total_value || 0)}
          </Typography>
          <Chip
            label={`${Math.round(percentPaid)}% pago`}
            color={percentPaid >= 100 ? 'success' : 'warning'}
            size="small"
          />
        </Box>
      );
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPending = !showOnlyPending || (
      student.modality_details && 
      (!paymentStatuses[student.id]?.paid_current_month)
    );
    return matchesSearch && matchesPending;
  });

  return (
    <BaseLayout>
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', mb: 3, gap: 2 }}>
          <Typography variant={isMobile ? "h5" : "h4"} component="h1">
            Alunos
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"              onClick={async () => {
                try {
                  const response = await api.get('/api/students/download_template/', {
                    responseType: 'blob'
                  });
                  const url = window.URL.createObjectURL(new Blob([response.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', 'template_alunos.xlsx');
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  setError('Erro ao baixar o template');
                  console.error('Error downloading template:', error);
                }
              }}
              startIcon={<CloudUploadIcon />}
            >
              Baixar Template
            </Button>
            <Button
              variant="outlined"
              color="primary"
              component="label"
              startIcon={<CloudUploadIcon />}
            >
              Upload Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const formData = new FormData();
                    formData.append('file', file);
                    api.post('/api/students/upload/', formData, {
                      headers: {
                        'Content-Type': 'multipart/form-data',
                      },
                    })
                    .then(() => {
                      setSuccessMessage('Alunos importados com sucesso');
                      fetchStudents();
                    })
                    .catch((error) => {
                      setError('Erro ao importar alunos');
                      console.error('Error uploading file:', error);
                    });
                  }
                }}
              />
            </Button>
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
        </Box>

        <Box sx={{ mb: 3, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
          <TextField
            fullWidth
            size={isMobile ? "small" : "medium"}
            label="Buscar por nome"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showOnlyActive}
                  onChange={(e) => setShowOnlyActive(e.target.checked)}
                  color="primary"
                />
              }
              label="Apenas ativos"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showOnlyPending}
                  onChange={(e) => setShowOnlyPending(e.target.checked)}
                  color="warning"
                />
              }
              label="Apenas pendentes"
            />
          </Box>
        </Box>

        {isMobile ? (
          // Visualização mobile em cards
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredStudents.map((student) => (
              <Card key={student.id}>
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle1" component="div">
                        {student.name}
                      </Typography>
                      {student.modality_details && (
                        <Typography variant="caption" color="text.secondary">
                          {student.modality_details.name}
                        </Typography>
                      )}
                    </Box>
                    <Switch
                      checked={student.active}
                      onChange={() => handleToggleActive(student.id, student.active)}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  
                  {student.modality_details && renderPaymentStatus(student)}

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
                    <IconButton
                      color="info"
                      component={Link}
                      to={`/students/details/${student.id}`}
                      size="small"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    {student.modality_details && (
                      <IconButton
                        color="primary"
                        onClick={() => handlePaymentClick(student)}
                        size="small"
                      >
                        <AttachMoneyIcon />
                      </IconButton>
                    )}
                    <IconButton
                      color="primary"
                      component={Link}
                      to={`/students/edit/${student.id}`}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(student.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
            {filteredStudents.length === 0 && (
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography>Nenhum aluno encontrado</Typography>
              </Paper>
            )}
          </Box>
        ) : (
          // Visualização desktop em tabela
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>Data de Nascimento</TableCell>
                  <TableCell>Modalidade</TableCell>
                  <TableCell>Status do Pagamento</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell>{formatDate(student.date_of_birth)}</TableCell>
                    <TableCell>
                      {student.modality_details ? 
                        `${student.modality_details.name} - ${student.modality_details.payment_type === 'MONTHLY' ? 'Mensal' : 'Por Sessão'}` : 
                        'Não definida'
                      }
                    </TableCell>
                    <TableCell>
                      {student.modality_details && renderPaymentStatus(student)}
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={student.active}
                            onChange={() => handleToggleActive(student.id, student.active)}
                            color="primary"
                            size="small"
                          />
                        }
                        label={student.active ? 'Ativo' : 'Inativo'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <IconButton
                          color="info"
                          component={Link}
                          to={`/students/details/${student.id}`}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        {student.modality_details && (
                          <IconButton
                            color="primary"
                            onClick={() => handlePaymentClick(student)}
                          >
                            <AttachMoneyIcon />
                          </IconButton>
                        )}
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
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {selectedStudent && (
          <PaymentForm
            open={paymentDialogOpen}
            onClose={() => setPaymentDialogOpen(false)}
            studentId={selectedStudent.id}
            modalityId={selectedStudent.modality}
            onSuccess={handlePaymentSuccess}
          />
        )}

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
