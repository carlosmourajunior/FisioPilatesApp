import React, { useEffect, useState, useCallback } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, AttachMoney as AttachMoneyIcon, Visibility as VisibilityIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import api from '../../utils/axios';
import { BaseLayout } from '../shared/BaseLayout';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AxiosError } from 'axios';
import PaymentForm from '../payment/PaymentForm';


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
  payment_status?: {
    payment_type: 'MONTHLY' | 'SESSION';
    paid_current_month?: boolean;
    modality_price?: number;
    session_price?: number; 
    session_quantity?: number;
    total_value?: number;
    total_paid?: number;
    remaining_value?: number;
    is_overdue?: boolean;
    payment_day?: number | null;
  };
  schedules?: { weekday: number; hour: number }[];
}

const weekdays = [
  { value: 0, label: 'Segunda-feira' },
  { value: 1, label: 'Terça-feira' },
  { value: 2, label: 'Quarta-feira' },
  { value: 3, label: 'Quinta-feira' },
  { value: 4, label: 'Sexta-feira' },
  { value: 5, label: 'Sábado' },
  { value: 6, label: 'Domingo' }
];

const hours = Array.from({ length: 16 }, (_, i) => i + 6).map(hour => ({
  value: hour,
  label: `${hour.toString().padStart(2, '0')}:00`
}));

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [weekdayFilter, setWeekdayFilter] = useState<number | ''>('');
  const [hourFilter, setHourFilter] = useState<number | ''>('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const isMobile = window.innerWidth <= 600;  const fetchStudents = useCallback(async () => {
    try {
      let url = '/api/students/';
      const params: any = {};
      
      // Add active filter
      if (showOnlyActive !== undefined) {
        params.active = showOnlyActive;
      }
      
      // Add weekday filter
      if (weekdayFilter !== '') {
        params.weekday = weekdayFilter;
      }
      
      // Add hour filter
      if (hourFilter !== '') {
        params.hour = hourFilter;
      }
      
      const response = await api.get(url, { params });
      setStudents(response.data);    } catch (error) {
      setError('Erro ao carregar alunos');
      const axiosError = error as AxiosError;
      console.error('Error fetching students:', axiosError);
    }
  }, [showOnlyActive, weekdayFilter, hourFilter]);

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
  };  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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
    if (!student.payment_status || !student.modality_details) return null;

    if (student.payment_status.payment_type === 'MONTHLY') {
      if (student.payment_status.paid_current_month) {
        return (
          <Box>
            <Chip
              label="Mês pago"
              color="success"
              size="small"
            />
          </Box>
        );
      } else {
        return (
          <Box>
            <Chip
              label={student.payment_status.is_overdue ? 'Pagamento atrasado' : 'Pagamento pendente'} 
              color={student.payment_status.is_overdue ? 'error' : 'warning'} 
              size="small"
            />
            <Typography variant="caption" display="block" color="text.secondary">
              {student.payment_status.payment_day ? `Vence dia ${student.payment_status.payment_day}` : 'Data não definida'}
            </Typography>
          </Box>
        );
      }
    } else {
      if (!student.payment_status.session_quantity) return null;
      const percentPaid = ((student.payment_status.total_paid || 0) / (student.payment_status.total_value || 1)) * 100;
      return (
        <Box>
          <Typography variant="body2">
            {formatCurrency(student.payment_status.total_paid || 0)} / {formatCurrency(student.payment_status.total_value || 0)}
          </Typography>
          <Chip
            label={`${Math.round(percentPaid)}% pago`}
            color={percentPaid >= 100 ? 'success' : 'warning'}
            size="small"
          />
        </Box>
      );    }
  };

  const filteredStudents = students.filter(student => {
    // Filtro por nome
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de pagamentos pendentes  
    const matchesPending = !showOnlyPending || (
      student.modality_details && 
      student.payment_status &&
      (!student.payment_status.paid_current_month)
    );

    // Filtro por horário e dia da semana
    let matchesSchedule = true;
    if (weekdayFilter !== '' || hourFilter !== '') {
      if (!student.schedules || student.schedules.length === 0) {
        matchesSchedule = false;
      } else {
        matchesSchedule = student.schedules.some(schedule => {
          const matchesWeekday = weekdayFilter === '' || schedule.weekday === Number(weekdayFilter);
          const matchesHour = hourFilter === '' || schedule.hour === Number(hourFilter);
          return matchesWeekday && matchesHour;
        });
      }
    }

    return matchesSearch && matchesPending && matchesSchedule;
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
          <FormControl size={isMobile ? "small" : "medium"} sx={{ minWidth: 200 }}>
            <InputLabel>Dia da Semana</InputLabel>
            <Select
              value={weekdayFilter}
              label="Dia da Semana"
              onChange={(e) => setWeekdayFilter(e.target.value as number | '')}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {weekdays.map((weekday) => (
                <MenuItem key={weekday.value} value={weekday.value}>
                  {weekday.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size={isMobile ? "small" : "medium"} sx={{ minWidth: 150 }}>
            <InputLabel>Horário</InputLabel>
            <Select
              value={hourFilter}
              label="Horário"
              onChange={(e) => setHourFilter(e.target.value as number | '')}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {hours.map((hour) => (
                <MenuItem key={hour.value} value={hour.value}>
                  {hour.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
