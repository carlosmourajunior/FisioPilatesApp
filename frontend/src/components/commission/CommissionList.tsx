import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CommissionDetailsDialog from './CommissionDetailsDialog';
import CommissionForm from './CommissionForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BaseLayout } from '../shared/BaseLayout';
import { CommissionService } from '../../services/CommissionService';
import { ClinicCommissionPayment, CommissionsDue } from '../../types/payment';
import { useAuth } from '../../contexts/AuthContext';

const CommissionList: React.FC = () => {
  const { user } = useAuth();
  const [commissionPayments, setCommissionPayments] = useState<ClinicCommissionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [dueCommissions, setDueCommissions] = useState<CommissionsDue | null>(null);
  const [totalCommissionDue, setTotalCommissionDue] = useState<number>(0);
  const [showNewCommissionForm, setShowNewCommissionForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<ClinicCommissionPayment | null>(null);

  const fetchCommissionPayments = async () => {
    try {
      setLoading(true);
      const response = await CommissionService.getCommissionPayments(
        user?.physiotherapist?.id,
        selectedStatus || undefined
      );
      setCommissionPayments(response);
    } catch (error) {
      setError('Erro ao carregar pagamentos de comissão');
      console.error('Error fetching commission payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDueCommissions = async () => {
    if (!user?.physiotherapist?.id) {
      console.error('No physiotherapist ID found');
      return;
    }
    
    try {
      const [dueResponse, totalResponse] = await Promise.all([
        CommissionService.getDueCommissions(user.physiotherapist.id),
        CommissionService.getTotalCommissionDue(user.physiotherapist.id)
      ]);
      
      console.log('Due commissions response:', dueResponse);
      console.log('Total commission due response:', totalResponse);
      
      setDueCommissions(dueResponse);
      if (totalResponse?.total_commission_due !== undefined) {
        setTotalCommissionDue(totalResponse.total_commission_due);
      } else {
        console.error('Total commission due is undefined in response:', totalResponse);
        setTotalCommissionDue(0);
      }
    } catch (error) {
      console.error('Error fetching due commissions:', error);
      setError('Erro ao carregar comissões devidas');
    }
  };

  useEffect(() => {
    fetchCommissionPayments();
  }, [selectedStatus]);

  useEffect(() => {
    if (!user?.is_staff) {
      fetchDueCommissions();
    }
  }, [user]);

  const handleApprove = async (id: number) => {
    try {
      await CommissionService.approveCommissionPayment(id);
      setSuccessMessage('Pagamento de comissão aprovado com sucesso');
      fetchCommissionPayments();
    } catch (error) {
      setError('Erro ao aprovar pagamento de comissão');
      console.error('Error approving commission payment:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este pagamento de comissão?')) {
      return;
    }
    try {
      await CommissionService.deleteCommissionPayment(id);
      setSuccessMessage('Pagamento de comissão excluído com sucesso');
      fetchCommissionPayments();
    } catch (error) {
      setError('Erro ao excluir pagamento de comissão');
      console.error('Error deleting commission payment:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const handleAddCommissionClick = async () => {
    try {
      setLoading(true);
      await fetchDueCommissions();
      setShowNewCommissionForm(true);
    } catch (error) {
      console.error('Error fetching due commissions:', error);
      setError('Erro ao carregar comissões devidas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <BaseLayout>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>          <Typography variant="h4">
            Pagamentos de Comissão
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pending">Pendente</MenuItem>
                <MenuItem value="awaiting_approval">Aguardando Aprovação</MenuItem>
                <MenuItem value="approved">Aprovado</MenuItem>
              </Select>
            </FormControl>            {!user?.is_staff && (              <Button
                variant="contained"
                color="primary"
                onClick={handleAddCommissionClick}
              >
                Adicionar Comissão
              </Button>
            )}
          </Box>
        </Box>        {user?.is_staff && dueCommissions && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Comissão do Mês Atual
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {formatCurrency(dueCommissions.total_commission)}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Mês: {format(new Date(dueCommissions.month), 'MMMM/yyyy', { locale: ptBR })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total a Receber
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {formatCurrency(totalCommissionDue)}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Total pendente de aprovação ou pagamento
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <TableContainer component={Paper}>
          <Table id="commission-payments">
            <TableHead>
              <TableRow>
                <TableCell>Fisioterapeuta</TableCell>
                <TableCell>Data da Transferência</TableCell>
                <TableCell>Total Devido</TableCell>                <TableCell>Valor Pago</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {commissionPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {payment.physiotherapist_details?.user.first_name} {payment.physiotherapist_details?.user.last_name}
                  </TableCell>
                  <TableCell>{formatDate(payment.transfer_date)}</TableCell>
                  <TableCell>{formatCurrency(payment.total_commission_due)}</TableCell>                  <TableCell>{formatCurrency(payment.amount_paid)}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        payment.status === 'approved'
                          ? 'Aprovado'
                          : payment.status === 'awaiting_approval'
                          ? 'Aguardando Aprovação'
                          : payment.status === 'pending'
                          ? 'Pendente'
                          : 'Status Desconhecido'
                      }
                      color={
                        payment.status === 'approved'
                          ? 'success'
                          : payment.status === 'awaiting_approval'
                          ? 'warning'
                          : 'default'
                      }
                    />
                  </TableCell>                  <TableCell>{payment.description}</TableCell>                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      {user?.is_staff && payment.status === 'awaiting_approval' && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleApprove(payment.id!)}
                          sx={{ minWidth: '100px' }}
                        >
                          Aprovar
                        </Button>
                      )}                      <Button
                        variant="contained"
                        color="info"
                        size="small"
                        onClick={() => setSelectedPayment(payment)}
                        sx={{ minWidth: '100px' }}
                      >
                        Detalhes
                      </Button>
                      {!user?.is_staff && payment.status === 'awaiting_approval' && (
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(payment.id!)}
                          sx={{ minWidth: '100px' }}
                        >
                          Excluir
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {commissionPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={user?.is_staff ? 7 : 6} align="center">
                    Nenhum pagamento de comissão encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {error && (
          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={() => setError(null)}
          >
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Snackbar>
        )}

        {successMessage && (
          <Snackbar
            open={!!successMessage}
            autoHideDuration={6000}
            onClose={() => setSuccessMessage(null)}
          >
            <Alert severity="success" onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          </Snackbar>
        )}

        <CommissionDetailsDialog
          open={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          commission={selectedPayment}
        />

        {!user?.is_staff && (
          <CommissionForm
            open={showNewCommissionForm}
            onClose={() => setShowNewCommissionForm(false)}
            onSuccess={() => {
              setShowNewCommissionForm(false);
              fetchCommissionPayments();
              fetchDueCommissions();
            }}
            physiotherapistId={user?.physiotherapist?.id || 0}
            totalCommissionDue={totalCommissionDue}
          />
        )}
      </Box>
    </BaseLayout>
  );
};

export default CommissionList;
