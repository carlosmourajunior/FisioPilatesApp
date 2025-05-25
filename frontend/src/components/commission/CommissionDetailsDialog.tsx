import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ClinicCommissionPayment } from '../../types/payment';

interface CommissionDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  commission: ClinicCommissionPayment | null;
}

const CommissionDetailsDialog: React.FC<CommissionDetailsDialogProps> = ({
  open,
  onClose,
  commission,
}) => {
  if (!commission) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalhes do Pagamento de Comissão</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Fisioterapeuta:</strong>{' '}
          {commission.physiotherapist_details?.user.first_name}{' '}
          {commission.physiotherapist_details?.user.last_name}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Data da Transferência:</strong> {formatDate(commission.transfer_date)}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Total Devido:</strong> {formatCurrency(commission.total_commission_due)}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Valor Pago:</strong> {formatCurrency(commission.amount_paid)}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Status:</strong>{' '}
          {commission.status === 'approved'
            ? 'Aprovado'
            : commission.status === 'awaiting_approval'
            ? 'Aguardando Aprovação'
            : 'Pendente'}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Descrição:</strong> {commission.description}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommissionDetailsDialog;
