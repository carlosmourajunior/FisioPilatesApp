import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

interface Payment {
  id: number;
  amount: number;
  payment_date: string;
  reference_month: string | null;
}

interface PaymentHistoryProps {
  payments: Payment[];
  loading: boolean;
  onDelete?: (paymentId: number) => void;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  payments,
  loading,
  onDelete
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Histórico de Pagamentos
      </Typography>
      {loading ? (
        <CircularProgress size={24} />
      ) : payments.length > 0 ? (
        <List>
          {payments.map((payment) => (
            <React.Fragment key={payment.id}>
              <ListItem>
                <ListItemText
                  primary={`${new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(payment.amount)}`}
                  secondary={`Data: ${new Date(payment.payment_date).toLocaleDateString('pt-BR')}${
                    payment.reference_month
                      ? ` | Referência: ${new Date(payment.reference_month).toLocaleDateString('pt-BR', {
                          month: 'long',
                          year: 'numeric'
                        })}`
                      : ''
                  }`}
                />
                {onDelete && (
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => onDelete(payment.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography color="textSecondary">
          Nenhum pagamento registrado
        </Typography>
      )}
    </Box>
  );
};

export default PaymentHistory;
