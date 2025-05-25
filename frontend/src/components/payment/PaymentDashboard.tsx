import { type FC, useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  SelectChangeEvent,
  Checkbox,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { PhysiotherapistService } from '../../services/PhysiotherapistService';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { PaymentService } from '../../services/PaymentService';
import { BaseLayout } from '../shared/BaseLayout';
import { useAuth } from '../../contexts/AuthContext';

export interface PaymentStatusSummary {
  totalStudents: number;
  paidStudents: number;
  pendingStudents: number;  
  totalExpectedValue: number;
  totalReceivedValue: number;
  totalPendingValue: number;
  totalOverdueValue: number;
  overdueStudents: number;
  total_commissions: number;  
  paidList: Array<{
    id: number;
    name: string;
    modality_name: string;
    payment_date: string;
    amount: number;
    payment_type: 'PRE' | 'POS';
    reference_month: string;
    payment_day: number | null;
    is_overdue: boolean;
    schedules: Array<{
      weekday: number;
      hour: number;
    }>;
  }>;  
  pendingList: Array<{
    id: number;
    name: string;
    modality_name: string;
    modality: number;
    expected_amount: number;
    payment_type: 'PRE' | 'POS';
    reference_month: string;
    payment_day: number | null;
    is_overdue: boolean;
    schedules: Array<{
      weekday: number;
      hour: number;
    }>;
  }>;
}

interface Schedule {
  weekday: number;
  hour: number;
}

interface Student {
  id: number;
  name: string;
  modality_name: string;
  payment_date?: string;
  amount?: number;
  expected_amount: number;
  payment_type: 'PRE' | 'POS';
  reference_month: string;
  payment_day: number | null;
  is_overdue: boolean;
  status: 'paid' | 'pending' | 'overdue';
  schedules: Schedule[];
}

export interface Physiotherapist {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  crefito: string;
  phone: string;
  specialization: string;
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

const PaymentDashboard: FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [summary, setSummary] = useState<PaymentStatusSummary | null>(null);
  const [physiotherapists, setPhysiotherapists] = useState<Physiotherapist[]>([]);  const [selectedPhysiotherapist, setSelectedPhysiotherapist] = useState<number | null>(null);  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);const [weekdayFilter, setWeekdayFilter] = useState<string>('');
  const [hourFilter, setHourFilter] = useState<string>('');

  const fetchPhysiotherapists = async () => {
    try {
      const data = await PhysiotherapistService.listPhysiotherapists();
      setPhysiotherapists(data);
    } catch (error) {
      console.error('Error fetching physiotherapists:', error);
    }
  };

  const fetchSummary = async (date: Date) => {
    try {
      setLoading(true);      const response = await PaymentService.getPaymentSummary(
        format(date, 'yyyy-MM'),
        selectedPhysiotherapist || undefined
      );
      setSummary(response);
    } catch (error) {
      console.error('Error fetching payment summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.is_staff) {
      fetchPhysiotherapists();
    }
  }, [user]);

  useEffect(() => {
    fetchSummary(selectedDate);
  }, [selectedDate, selectedPhysiotherapist]);

  if (loading) {
    return (
      <BaseLayout>
        <Box sx={{ p: 3 }}>
          <Box display="flex" justifyContent="center" m={3}>
            <CircularProgress />
          </Box>
        </Box>
      </BaseLayout>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handlePhysiotherapistChange = (event: SelectChangeEvent<string>) => {
    setSelectedPhysiotherapist(event.target.value ? Number(event.target.value) : null);
  };  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value as 'all' | 'paid' | 'pending' | 'overdue');
  };
  const handleWeekdayFilterChange = (event: SelectChangeEvent<string>) => {
    setWeekdayFilter(event.target.value);
  };

  const handleHourFilterChange = (event: SelectChangeEvent<string>) => {
    setHourFilter(event.target.value);
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleRegisterPayments = async () => {
    if (!selectedStudents.length) return;

    try {
      setLoading(true);
      const currentDate = new Date().toISOString().split('T')[0];
      
      for (const studentId of selectedStudents) {
        const student = summary?.pendingList.find(s => s.id === studentId);
        if (!student) {
          console.error('Student not found:', studentId);
          continue;
        }
        
        // Make sure we have both student and modality IDs
        if (!student.modality) {
          console.error('Missing modality ID for student:', student);
          continue;
        }
        
        const paymentData = {
          student: studentId,
          modality: student.modality,
          amount: student.expected_amount,
          payment_date: currentDate,
          reference_month: format(selectedDate, 'yyyy-MM-dd')
        };
        
        // Log the payment data being sent
        console.log('Registering payment:', paymentData);
        
        try {
          await PaymentService.createPayment(paymentData);
        } catch (error) {
          const err = error as any;
          console.error('Error creating payment:', err.response?.data || err);
          // Convert to a format that tells us which student had an error
          throw new Error(`Error registering payment for ${student.name}: ${err.response?.data?.modality?.[0] || 'Unknown error'}`);
        }
      }

      // Refresh the summary after registering all payments
      await fetchSummary(selectedDate);
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error registering payments:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unknown error occurred while registering payments');
      }
    } finally {
      setLoading(false);
    }
  };

  const isMobile = window.innerWidth <= 600;  const allStudents = [
    ...(summary?.paidList || []).map(student => ({
      ...student,
      schedules: student.schedules || [],
      status: 'paid' as const,
      expected_amount: student.amount
    })), 
    ...(summary?.pendingList || []).map(student => ({
      ...student,
      schedules: student.schedules || [],
      status: student.is_overdue ? 'overdue' as const : 'pending' as const,
      payment_date: undefined
    }))
  ];  const filteredStudents = allStudents.filter(student => {
    // Status filter
    if (statusFilter !== 'all' && student.status !== statusFilter) {
      return false;
    }
    
    // Schedule filters are applied only for students with schedules
    if (weekdayFilter !== '' || hourFilter !== '') {
      if (!student.schedules || student.schedules.length === 0) {
        return false;
      }
      
      // Check if student has any schedule matching both weekday and hour filters
      const hasMatchingSchedule = student.schedules.some(schedule => {
        const matchesWeekday = weekdayFilter === '' || schedule.weekday === Number(weekdayFilter);
        const matchesHour = hourFilter === '' || schedule.hour === Number(hourFilter);
        return matchesWeekday && matchesHour;
      });
      
      if (!hasMatchingSchedule) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <BaseLayout>
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', mb: 3, gap: 2 }}>
          <Typography variant={isMobile ? "h5" : "h4"} component="h1">
            Dashboard de Pagamentos
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={user?.is_staff ? 6 : 12}>
            <Paper sx={{ p: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  label="Mês de Referência"
                  value={selectedDate}
                  onChange={(date) => date && setSelectedDate(date)}
                  format="MM/yyyy"
                  views={['month', 'year']}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: isMobile ? "small" : "medium"
                    }
                  }}
                />
              </LocalizationProvider>
            </Paper>
          </Grid>
          {user?.is_staff && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel id="physiotherapist-select-label">Fisioterapeuta</InputLabel>
                  <Select
                    labelId="physiotherapist-select-label"
                    value={selectedPhysiotherapist?.toString() || ''}
                    label="Fisioterapeuta"
                    onChange={handlePhysiotherapistChange}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {physiotherapists.map((physio) => (
                      <MenuItem key={physio.id} value={physio.id}>
                        {`${physio.first_name} ${physio.last_name}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            </Grid>
          )}
        </Grid>

        {summary && (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom color="success.main">
                      Total Recebido
                    </Typography>
                    <Typography variant={isMobile ? "h5" : "h4"} color="success.main">
                      {formatCurrency(summary.totalReceivedValue)}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      {summary.paidStudents} pagamentos realizados
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom color="error.main">
                      Total Atrasado
                    </Typography>
                    <Typography variant={isMobile ? "h5" : "h4"} color="error.main">
                      {formatCurrency(summary.totalOverdueValue || 0)}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      {summary.overdueStudents || 0} pagamentos atrasados
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom color="warning.main">
                      Total Pendente
                    </Typography>
                    <Typography variant={isMobile ? "h5" : "h4"} color="warning.main">
                      {formatCurrency(summary.totalPendingValue)}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      {summary.pendingStudents} pagamentos pendentes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
                      Total Esperado
                    </Typography>
                    <Typography variant={isMobile ? "h5" : "h4"}>
                      {formatCurrency(summary.totalExpectedValue)}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      {summary.totalStudents} alunos no total
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
                Lista de Pagamentos
              </Typography>              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
                <FormControl sx={{ minWidth: 200 }} size={isMobile ? "small" : "medium"}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={handleStatusFilterChange}
                  >                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="paid">Pagos</MenuItem>
                    <MenuItem value="overdue">Atrasados</MenuItem>
                    <MenuItem value="pending">Pendentes</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 200 }} size={isMobile ? "small" : "medium"}>
                  <InputLabel>Dia da Semana</InputLabel>
                  <Select
                    value={weekdayFilter}
                    label="Dia da Semana"
                    onChange={handleWeekdayFilterChange}
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
                <FormControl sx={{ minWidth: 150 }} size={isMobile ? "small" : "medium"}>
                  <InputLabel>Horário</InputLabel>
                  <Select
                    value={hourFilter}
                    label="Horário"
                    onChange={handleHourFilterChange}
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
                {selectedStudents.length > 0 && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleRegisterPayments}
                    startIcon={<CheckCircleOutlineIcon />}
                  >
                    Registrar {selectedStudents.length} Pagamento(s)
                  </Button>
                )}
              </Box>

              <TableContainer>
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow>                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedStudents.length > 0 && 
                            selectedStudents.length === filteredStudents.filter(s => s.status === 'pending' || s.status === 'overdue').length}
                          indeterminate={selectedStudents.length > 0 && 
                            selectedStudents.length < filteredStudents.filter(s => s.status === 'pending' || s.status === 'overdue').length}
                          onChange={(e) => {
                            const unpaidStudents = filteredStudents
                              .filter(s => s.status === 'pending' || s.status === 'overdue')
                              .map(s => s.id);
                            setSelectedStudents(e.target.checked ? unpaidStudents : []);
                          }}
                        />
                      </TableCell><TableCell>Nome</TableCell>
                      {!isMobile && <TableCell>Modalidade</TableCell>}
                      <TableCell>Tipo</TableCell>
                      <TableCell>Mês Ref.</TableCell>
                      <TableCell>Data do Pagamento</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>                        <TableCell padding="checkbox">
                          {(student.status === 'pending' || student.status === 'overdue') && (
                            <Checkbox
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => toggleStudentSelection(student.id)}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {student.name}
                          {isMobile && (                            <Typography variant="caption" display="block" color="text.secondary">
                              {student.modality_name}
                            </Typography>
                          )}
                        </TableCell>
                        {!isMobile && <TableCell>{student.modality_name}</TableCell>}
                        <TableCell>
                          {student.payment_type === 'PRE' ? 'Pré-pago' : 'Pós-pago'}
                        </TableCell>
                        <TableCell>
                          {new Date(student.reference_month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </TableCell>
                        <TableCell>
                          {student.payment_date 
                            ? new Date(student.payment_date).toLocaleDateString('pt-BR')
                            : '-'}
                        </TableCell>
                        <TableCell>{formatCurrency(student.expected_amount)}</TableCell>
                        <TableCell align="center">                          <Box>
                            <Chip 
                              label={
                                student.status === 'paid' ? 'Pago' :
                                student.status === 'overdue' ? 'Atrasado' : 'Pendente'
                              }
                              color={
                                student.status === 'paid' ? 'success' :
                                student.status === 'overdue' ? 'error' : 'warning'
                              }
                              size="small"
                            />
                            {(student.status === 'pending' || student.status === 'overdue') && student.payment_day && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                Vence dia {student.payment_day}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={isMobile ? 5 : 6} align="center">
                          Nenhum aluno encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Box>
    </BaseLayout>
  );
};

export default PaymentDashboard;
