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
} from '@mui/material';
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
  paidList: Array<{
    id: number;
    name: string;
    modality_name: string;
    payment_date: string;
    amount: number;
  }>;
  pendingList: Array<{
    id: number;
    name: string;
    modality_name: string;
    expected_amount: number;
  }>;
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

const PaymentDashboard: FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [summary, setSummary] = useState<PaymentStatusSummary | null>(null);
  const [physiotherapists, setPhysiotherapists] = useState<Physiotherapist[]>([]);
  const [selectedPhysiotherapist, setSelectedPhysiotherapist] = useState<number | null>(null);

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
  };

  const isMobile = window.innerWidth <= 600;

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
            <Grid container spacing={2} mb={3}>
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
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom color="error.main">
                      Total Pendente
                    </Typography>
                    <Typography variant={isMobile ? "h5" : "h4"} color="error.main">
                      {formatCurrency(summary.totalPendingValue)}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      {summary.pendingStudents} pagamentos pendentes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
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
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom color="success.main">
                    Alunos com Pagamento Realizado
                  </Typography>
                  <TableContainer>
                    <Table size={isMobile ? "small" : "medium"}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Nome</TableCell>
                          {!isMobile && (
                            <>
                              <TableCell>Modalidade</TableCell>
                              <TableCell>Data do Pagamento</TableCell>
                            </>
                          )}
                          <TableCell>Valor</TableCell>
                          <TableCell align="center">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {summary.paidList.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>
                              {student.name}
                              {isMobile && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {new Date(student.payment_date).toLocaleDateString('pt-BR')}
                                </Typography>
                              )}
                            </TableCell>
                            {!isMobile && (
                              <>
                                <TableCell>{student.modality_name}</TableCell>
                                <TableCell>
                                  {new Date(student.payment_date).toLocaleDateString('pt-BR')}
                                </TableCell>
                              </>
                            )}
                            <TableCell>{formatCurrency(student.amount)}</TableCell>
                            <TableCell align="center">
                              <Chip label="Pago" color="success" size="small" />
                            </TableCell>
                          </TableRow>
                        ))}
                        {summary.paidList.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={isMobile ? 3 : 5} align="center">
                              Nenhum aluno com pagamento realizado
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom color="error.main">
                    Alunos com Pagamento Pendente
                  </Typography>
                  <TableContainer>
                    <Table size={isMobile ? "small" : "medium"}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Nome</TableCell>
                          {!isMobile && <TableCell>Modalidade</TableCell>}
                          <TableCell>Valor</TableCell>
                          <TableCell align="center">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {summary.pendingList.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>
                              {student.name}
                              {isMobile && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {student.modality_name}
                                </Typography>
                              )}
                            </TableCell>
                            {!isMobile && <TableCell>{student.modality_name}</TableCell>}
                            <TableCell>{formatCurrency(student.expected_amount)}</TableCell>
                            <TableCell align="center">
                              <Chip label="Pendente" color="error" size="small" />
                            </TableCell>
                          </TableRow>
                        ))}
                        {summary.pendingList.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={isMobile ? 3 : 4} align="center">
                              Nenhum aluno com pagamento pendente
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </BaseLayout>
  );
};

export default PaymentDashboard;
