import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSnackbar } from 'notistack';
import { CommissionPaymentService } from '../../services/commissionPayment.service';
import { ClinicCommissionPayment, CommissionsDue } from '../../types/payment';

interface CommissionPaymentFormData {
  physiotherapist: number;
  transfer_date: Date;
  total_commission_due: number;
  amount_paid: string;
  description: string;
}

interface CommissionPaymentFormProps {
  physiotherapistId: number;
  onSuccess?: () => void;
}

export const CommissionPaymentForm: React.FC<CommissionPaymentFormProps> = ({
  physiotherapistId,
  onSuccess,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [commissionsDue, setCommissionsDue] = useState<CommissionsDue | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CommissionPaymentFormData>({
    physiotherapist: physiotherapistId,
    transfer_date: new Date(),
    total_commission_due: 0,
    amount_paid: '',
    description: '',
  });

  useEffect(() => {
    loadCommissionsDue();
  }, [physiotherapistId]);

  const loadCommissionsDue = async () => {
    try {
      const data: CommissionsDue = await CommissionPaymentService.getCommissionsDue(physiotherapistId);
      if (data) {
        setCommissionsDue(data);
        setFormData(prev => ({
          ...prev,
          total_commission_due: data.total_commission_due,
          amount_paid: data.total_commission_due.toFixed(2),
          description: `Pagamento de comissão referente ao mês ${format(new Date(data.month), 'MMMM/yyyy', { locale: ptBR })}`
        }));
      }
    } catch (error) {
      console.error('Error loading commissions due:', error);
      enqueueSnackbar('Erro ao carregar comissões pendentes', { variant: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commissionsDue) {
      enqueueSnackbar('Não há comissões pendentes para registrar', { variant: 'error' });
      return;
    }

    setLoading(true);

    try {      const payload: Omit<ClinicCommissionPayment, 'id' | 'created_at'> = {
        physiotherapist: physiotherapistId,
        transfer_date: format(formData.transfer_date, 'yyyy-MM-dd'),
        total_commission_due: formData.total_commission_due,
        amount_paid: Number(formData.amount_paid),
        description: formData.description,
        status: 'awaiting_approval' as const
      };

      await CommissionPaymentService.create(payload);
      enqueueSnackbar('Pagamento de comissão registrado com sucesso!', { variant: 'success' });
      
      // Reset form
      setFormData({
        physiotherapist: physiotherapistId,
        transfer_date: new Date(),
        total_commission_due: 0,
        amount_paid: '',
        description: '',
      });
      
      // Reload commissions due
      loadCommissionsDue();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating commission payment:', error);
      enqueueSnackbar('Erro ao registrar pagamento de comissão', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Registrar Pagamento de Comissão
      </Typography>
      
      {commissionsDue && (
        <Box mb={3}>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            Total de Comissões Pendentes: R$ {commissionsDue.total_commission_due.toFixed(2)}
          </Typography>
          {commissionsDue.month && (
            <Typography variant="body2" color="text.secondary">
              Mês de Referência: {format(new Date(commissionsDue.month), 'MMMM/yyyy', { locale: ptBR })}
            </Typography>
          )}
        </Box>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Data da Transferência"
              value={formData.transfer_date}
              onChange={(newValue) => {
                if (newValue) {
                  setFormData((prev) => ({
                    ...prev,
                    transfer_date: newValue,
                  }));
                }
              }}
              slotProps={{
                textField: { 
                  fullWidth: true,
                  required: true
                },
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="amount-paid">Valor a Transferir</InputLabel>
              <OutlinedInput
                id="amount-paid"
                value={formData.amount_paid}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  setFormData((prev) => ({
                    ...prev,
                    amount_paid: value,
                  }));
                }}
                startAdornment={<InputAdornment position="start">R$</InputAdornment>}
                label="Valor a Transferir"
                required
              />
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descrição"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }));
              }}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading || !commissionsDue}
            >
              {loading ? 'Registrando...' : 'Registrar Pagamento'}
            </Button>
          </Grid>
        </Grid>
      </form>

      {commissionsDue && commissionsDue.details && commissionsDue.details.length > 0 && (
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Detalhes das Comissões Pendentes:
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Aluno</TableCell>
                  <TableCell>Data Pagamento</TableCell>
                  <TableCell align="right">Valor Pago</TableCell>
                  <TableCell align="right">Taxa Comissão</TableCell>
                  <TableCell align="right">Valor Comissão</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {commissionsDue && commissionsDue.details && commissionsDue.details.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell>{detail.student_name}</TableCell>
                    <TableCell>
                      {format(new Date(detail.payment_date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell align="right">
                      R$ {detail.payment_amount.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {detail.commission_rate}%
                    </TableCell>
                    <TableCell align="right">
                      R$ {detail.commission_amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Paper>
  );
};
