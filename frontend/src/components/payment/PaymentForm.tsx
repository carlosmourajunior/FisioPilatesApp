import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Typography,
  Snackbar,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { PaymentService } from '../../services/PaymentService';
import { PaymentFormData, PaymentStatus } from '../../types/payment';
import PaymentHistory from './PaymentHistory';

interface PaymentFormProps {
  open: boolean;
  onClose: () => void;
  studentId: number;
  modalityId: number;
  onSuccess: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  open,
  onClose,
  studentId,
  modalityId,
  onSuccess
}) => {  const [formData, setFormData] = useState<PaymentFormData>({
    student: studentId,
    modality: modalityId,
    amount: 0,
    payment_date: new Date(),
    reference_month: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoadingPayments(true);
      const response = await PaymentService.listPayments({ student: studentId });
      setPayments(response);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este pagamento?')) {
      return;
    }

    try {
      await PaymentService.deletePayment(paymentId);
      await fetchPayments();
      await fetchPaymentStatus();
      setSuccessMessage('Pagamento excluído com sucesso');
    } catch (error) {
      setError('Erro ao excluir pagamento');
      console.error('Error deleting payment:', error);
    }
  };

  const fetchPaymentStatus = async () => {
    try {
      const status = await PaymentService.getPaymentStatus(studentId);
      setPaymentStatus(status);
      
      if (status.modality_price) {
        setFormData(prev => ({ ...prev, amount: status.modality_price }));
      }
    } catch (error) {
      console.error('Error fetching payment status:', error);
    }
  };
  useEffect(() => {
    if (open) {
      fetchPaymentStatus();
      fetchPayments();
      // Reset the form data when opening the dialog
      setFormData({
        student: studentId,
        modality: modalityId,
        amount: 0,
        payment_date: new Date(),
        reference_month: new Date(),
      });
    }
  }, [studentId, modalityId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const payload = {
        ...formData,
        payment_date: format(formData.payment_date, 'yyyy-MM-dd'),
        reference_month: formData.reference_month 
          ? format(formData.reference_month, 'yyyy-MM-dd')
          : null
      };

      await PaymentService.createPayment(payload);
      await fetchPayments();
      await fetchPaymentStatus();
      setSuccessMessage('Pagamento registrado com sucesso');
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao registrar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof PaymentFormData) => (value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Registrar Pagamento</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {paymentStatus && (
            <Box sx={{ mb: 2 }}>
              {paymentStatus.payment_type === 'MONTHLY' ? (
                <Alert severity={paymentStatus.paid_current_month ? "info" : "warning"}>
                  {paymentStatus.paid_current_month 
                    ? 'Pagamento do mês atual já realizado'
                    : 'Pagamento do mês atual pendente'}
                </Alert>
              ) : (
                <Alert severity="info">
                  {`Valor da sessão: ${new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(paymentStatus.session_price || 0)}`}
                  {paymentStatus.session_quantity && (
                    <><br />
                    {`Total devido: ${new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(paymentStatus.total_value || 0)}`}
                    <br />
                    {`Total pago: ${new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(paymentStatus.total_paid || 0)}`}
                    <br />
                    {`Valor restante: ${new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(paymentStatus.remaining_value || 0)}`}
                    </>
                  )}
                </Alert>
              )}
            </Box>
          )}          <Box sx={{ mb: 3 }}>
            <PaymentHistory
              payments={payments}
              loading={loadingPayments}
              onDelete={handleDeletePayment}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <DatePicker
                label="Data do Pagamento"
                value={formData.payment_date}
                onChange={(date) => handleChange('payment_date')(date)}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />

              {paymentStatus?.payment_type === 'MONTHLY' && (
                <DatePicker
                  label="Mês de Referência"
                  value={formData.reference_month}
                  onChange={(date) => handleChange('reference_month')(date)}
                  format="MM/yyyy"
                  views={['month', 'year']}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              )}
            </LocalizationProvider>

            <TextField
              label="Valor"
              type="number"
              required
              fullWidth
              value={formData.amount}
              onChange={(e) => handleChange('amount')(Number(e.target.value))}
              inputProps={{ step: "0.01", min: "0" }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </form>

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
    </Dialog>
  );
};

export default PaymentForm;
