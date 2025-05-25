import React, { useState } from 'react';
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
  Snackbar,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { CommissionService } from '../../services/CommissionService';

interface CommissionFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  physiotherapistId: number;
  totalCommissionDue: number;
}

const CommissionForm: React.FC<CommissionFormProps> = ({
  open,
  onClose,
  onSuccess,
  physiotherapistId,
  totalCommissionDue
}) => {
  const [formData, setFormData] = useState({
    physiotherapist: physiotherapistId,
    transfer_date: new Date(),
    total_commission_due: totalCommissionDue,
    amount_paid: totalCommissionDue,
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      await CommissionService.createCommissionPayment({
        ...formData,
        transfer_date: format(formData.transfer_date, 'yyyy-MM-dd')
      });

      setSuccessMessage('Pagamento de comissão registrado com sucesso');
      onSuccess();
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Erro ao registrar pagamento de comissão');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'amount_paid' ? Number(value) : value
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Registrar Pagamento de Comissão</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <DatePicker
                label="Data da Transferência"
                value={formData.transfer_date}
                onChange={(date) => handleChange('transfer_date')(date)}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />
            </LocalizationProvider>

            <TextField
              label="Total de Comissão Devido"
              type="number"
              required
              fullWidth
              value={formData.total_commission_due}
              onChange={(e) => handleChange('total_commission_due')(e.target.value)}
              inputProps={{ step: "0.01", min: "0" }}
              disabled
            />

            <TextField
              label="Valor Transferido"
              type="number"
              required
              fullWidth
              value={formData.amount_paid}
              onChange={(e) => handleChange('amount_paid')(e.target.value)}
              inputProps={{ step: "0.01", min: "0" }}
            />

            <TextField
              label="Descrição"
              multiline
              rows={4}
              required
              fullWidth
              value={formData.description}
              onChange={(e) => handleChange('description')(e.target.value)}
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

export default CommissionForm;
