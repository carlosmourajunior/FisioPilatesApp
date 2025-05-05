import React, { useEffect, useState } from 'react';
import { Typography, Card, CardContent, Grid, Box, CircularProgress } from '@mui/material';
import type { Theme } from '@mui/material';
import type { SxProps } from '@mui/system';
import { 
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material';
import { getDashboardSummary } from '../services/dashboardService';
import type { DashboardSummary, MonthSummary } from '../services/dashboardService';
import { BaseLayout } from './shared/BaseLayout';

import { useAuth } from '../contexts/AuthContext';

interface GridComponentProps {
  children: React.ReactNode;
  item?: boolean;
  container?: boolean;
  xs?: number;
  sm?: number;
  md?: number;
  spacing?: number;
  sx?: SxProps<Theme>;
}

const GridComponent: React.FC<GridComponentProps> = (props) => (
  <Grid component="div" {...props} />
);

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardSummary();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString('pt-BR', { month: 'long' });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
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
      <Typography variant="h4" gutterBottom>
        Bem-vindo ao Sistema de Fisioterapia e Pilates
      </Typography>
      
      {/* Summary Statistics */}      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Resumo Geral
      </Typography>
      <GridComponent container spacing={3} sx={{ mb: 4 }}>
        <GridComponent item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box textAlign="center">
                <WalletIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h6">Recebido no Mês</Typography>
                <Typography variant="h4" color="success.main">
                  {formatCurrency(dashboardData?.current_month_summary?.total_received || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </GridComponent>

        <GridComponent item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box textAlign="center">
                <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h6">A Receber no Mês</Typography>
                <Typography variant="h4" color="info.main">
                  {formatCurrency(dashboardData?.current_month_summary?.total_pending || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </GridComponent>

        <GridComponent item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box textAlign="center">
                <WalletIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                <Typography variant="h6">Total Atrasado</Typography>
                <Typography variant="h4" color="error.main">
                  {formatCurrency(dashboardData?.current_month_summary?.total_overdue || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </GridComponent>
      </GridComponent>

      {/* Monthly Statistics */}
      {user?.is_staff && dashboardData?.physiotherapist_summary && (
        <>
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Resumo por Fisioterapeuta
          </Typography>
          <GridComponent container spacing={3} sx={{ mb: 4 }}>
            {dashboardData.physiotherapist_summary.map((physio) => (
              <GridComponent item xs={12} sm={6} md={4} key={physio.id}>
                <Card>
                  <CardContent>                    <Typography variant="h6" gutterBottom>
                      {physio.name}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total de Alunos
                      </Typography>
                      <Typography variant="h6">
                        {physio.total_students}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Faturamento do Mês
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {formatCurrency(physio.total_month_revenue)}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Comissão a Pagar
                      </Typography>
                      <Typography variant="h6" color="purple.main">
                        {formatCurrency(physio.commission_to_pay)}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Alunos Pagantes (Mês Atual)
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {physio.paid_students}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Alunos Pendentes (Mês Atual)
                      </Typography>
                      <Typography variant="h6" color="error.main">
                        {physio.pending_students}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </GridComponent>
            ))}
          </GridComponent>
        </>
      )}

      {/* Monthly Statistics */}      <Typography variant="h5" gutterBottom>
        Resumo dos Últimos Meses
      </Typography>
      <GridComponent container spacing={3}>
        {dashboardData?.monthly_summary
          .filter(month => month.total_expected > 0 || month.is_future)
          .map((month: MonthSummary) => (
          <GridComponent item xs={12} sm={6} md={3} key={`${month.year}-${month.month}`}>
            <Card sx={month.is_current ? { 
              backgroundColor: 'primary.light',
              '& .MuiTypography-root': { 
                color: 'primary.contrastText' 
              }
            } : month.is_future ? {
              backgroundColor: 'info.light',
              '& .MuiTypography-root': { 
                color: 'info.contrastText' 
              }
            } : {}}>
              <CardContent>                <Typography variant="h6" gutterBottom>
                  {month.is_current ? '📅 ' : month.is_future ? '🔮 ' : ''}{getMonthName(month.month)} {month.year}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color={month.is_current ? 'primary.contrastText' : month.is_future ? 'info.contrastText' : 'text.secondary'}>
                    {month.is_future ? 'Previsão de Alunos' : 'Alunos Pagantes'}
                  </Typography>
                  <Typography variant="h6" color={month.is_current ? 'primary.contrastText' : month.is_future ? 'info.contrastText' : 'success.main'}>
                    {month.is_future ? month.total_students : `${month.paid_students} / ${month.total_students}`}
                  </Typography>
                </Box>                {!month.is_future && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color={month.is_current ? 'primary.contrastText' : 'text.secondary'}>
                      Alunos Pendentes
                    </Typography>
                    <Typography variant="h6" color={month.is_current ? 'error.light' : 'error.main'}>
                      {month.pending_students}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color={month.is_current ? 'primary.contrastText' : month.is_future ? 'info.contrastText' : 'text.secondary'}>
                    {month.is_future ? 'Valor Previsto' : 'Valor Recebido'}
                  </Typography>
                  <Typography variant="h6" color={month.is_current ? 'primary.contrastText' : month.is_future ? 'info.contrastText' : 'success.main'}>
                    {formatCurrency(month.is_future ? month.total_expected : month.total_received)}
                  </Typography>
                </Box>                
                
                {!month.is_future && (
                  <Box>
                    <Typography variant="body2" color={month.is_current ? 'primary.contrastText' : 'text.secondary'}>
                      Valor Pendente
                    </Typography>
                    <Typography variant="h6" color={month.is_current ? 'error.light' : 'error.main'}>
                      {formatCurrency(month.total_pending)}
                    </Typography>
                  </Box>
                )}

                {user?.is_staff && month.physiotherapist_breakdown.length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                      Detalhes por Fisioterapeuta
                    </Typography>
                    {month.physiotherapist_breakdown.map((physio) => (
                      <Box key={physio.id} sx={{ mb: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle2">
                          {physio.name}
                        </Typography>
                        <Grid container spacing={1} sx={{ mt: 1 }}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Pagos: {physio.paid_students}/{physio.total_students}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Pendentes: {physio.pending_students}
                            </Typography>
                          </Grid>
                          {physio.total_received !== undefined && (
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary">
                                Recebido: {formatCurrency(physio.total_received)}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </GridComponent>
        ))}
      </GridComponent>
    </BaseLayout>
  );
};