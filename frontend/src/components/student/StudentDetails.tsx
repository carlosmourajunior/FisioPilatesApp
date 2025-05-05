import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Chip,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import { BaseLayout } from '../shared/BaseLayout';
import api from '../../utils/axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Student } from '../../types/student';
import { Payment } from '../../types/payment';

const StudentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentResponse, paymentsResponse] = await Promise.all([
          api.get(`/api/students/${id}/`),
          api.get(`/api/payments/?student=${id}`)
        ]);
        
        setStudent(studentResponse.data);
        setPayments(paymentsResponse.data);
      } catch (error) {
        console.error('Error fetching student details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading || !student) {
    return (
      <BaseLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Detalhes do Aluno
        </Typography>

        {/* Seção 1: Detalhes Básicos */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Informações Básicas
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Nome
                </Typography>
                <Typography variant="body1">{student.name}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{student.email || '-'}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Telefone
                </Typography>
                <Typography variant="body1">{student.phone || '-'}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Data de Nascimento
                </Typography>
                <Typography variant="body1">
                  {student.date_of_birth ? formatDate(student.date_of_birth) : '-'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Modalidade
                </Typography>
                <Typography variant="body1">
                  {student.modality_details?.name || '-'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Tipo de Pagamento
                </Typography>
                <Chip 
                  label={student.payment_type === 'PRE' ? 'Pré-pago' : 'Pós-pago'} 
                  color="primary" 
                  size="small" 
                />
              </Box>
            </Grid>
            {student.modality_details?.payment_type === 'SESSION' && (
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Quantidade de Sessões
                  </Typography>
                  <Typography variant="body1">
                    {student.session_quantity || 0}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Seção 2: Detalhes de Pagamento */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Histórico de Pagamentos
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data do Pagamento</TableCell>
                  <TableCell>Mês de Referência</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    <TableCell>
                      {payment.reference_month 
                        ? format(new Date(payment.reference_month), 'MMMM/yyyy', { locale: ptBR })
                        : '-'}
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <Chip 
                        label="Pago" 
                        color="success" 
                        size="small" 
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {payments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Nenhum pagamento registrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </BaseLayout>
  );
};

export default StudentDetails;
