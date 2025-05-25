import React, { useEffect, useState } from 'react';
import { Typography, Card, CardContent, Grid, Box, CircularProgress, Tooltip } from '@mui/material';
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
  const isMobile = window.innerWidth <= 600;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      <Typography variant={windowWidth <= 600 ? "h5" : "h4"} gutterBottom>
        Bem-vindo ao Sistema
      </Typography>
      
      {/* Summary Statistics */}      
      <Typography variant={windowWidth <= 600 ? "h6" : "h5"} gutterBottom sx={{ mt: 4 }}>
        Resumo Geral
      </Typography>
      <GridComponent container spacing={2} sx={{ mb: 4 }}>
        <GridComponent item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ py: windowWidth <= 600 ? 1 : 2 }}>
              <Box textAlign="center">
                <WalletIcon sx={{ fontSize: windowWidth <= 600 ? 32 : 40, color: 'success.main', mb: 1 }} />
                <Typography variant={windowWidth <= 600 ? "subtitle1" : "h6"}>Recebido</Typography>
                <Typography variant={windowWidth <= 600 ? "h6" : "h4"} color="success.main">
                  {formatCurrency(dashboardData?.current_month_summary?.total_received || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </GridComponent>

        <GridComponent item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ py: windowWidth <= 600 ? 1 : 2 }}>
              <Box textAlign="center">
                <TrendingUpIcon sx={{ fontSize: windowWidth <= 600 ? 32 : 40, color: 'info.main', mb: 1 }} />
                <Typography variant={windowWidth <= 600 ? "subtitle1" : "h6"}>A Receber</Typography>
                <Typography variant={windowWidth <= 600 ? "h6" : "h4"} color="info.main">
                  {formatCurrency(dashboardData?.current_month_summary?.total_pending || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </GridComponent>

        <GridComponent item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ py: windowWidth <= 600 ? 1 : 2 }}>
              <Box textAlign="center">
                <WalletIcon sx={{ fontSize: windowWidth <= 600 ? 32 : 40, color: 'error.main', mb: 1 }} />
                <Typography variant={windowWidth <= 600 ? "subtitle1" : "h6"}>Atrasado</Typography>
                <Typography variant={windowWidth <= 600 ? "h6" : "h4"} color="error.main">
                  {formatCurrency(dashboardData?.current_month_summary?.total_overdue || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </GridComponent>        
        <GridComponent item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ py: windowWidth <= 600 ? 1 : 2 }}>
              <Box textAlign="center">                
                <MonetizationOnIcon sx={{ fontSize: windowWidth <= 600 ? 32 : 40, color: 'success.main', mb: 1 }} />
                <Tooltip title="Total já pago para a clínica no mês atual em comissões">
                  <Box>
                    <Typography variant={windowWidth <= 600 ? "subtitle1" : "h6"}>Total Pago para Clínica</Typography>
                    <Typography variant={windowWidth <= 600 ? "h6" : "h4"} color="success.main">
                      {formatCurrency(dashboardData?.current_month_summary?.total_paid_commissions || 0)}
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        </GridComponent>

        <GridComponent item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ py: windowWidth <= 600 ? 1 : 2 }}>
              <Box textAlign="center">                
                <MonetizationOnIcon sx={{ fontSize: windowWidth <= 600 ? 32 : 40, color: 'purple', mb: 1 }} />
                <Tooltip title="Valor que ainda deve ser repassado para a clínica dos pagamentos já recebidos no mês atual">
                  <Box>
                    <Typography variant={windowWidth <= 600 ? "subtitle1" : "h6"}>A Pagar para Clínica</Typography>
                    <Typography variant={windowWidth <= 600 ? "h6" : "h4"} color="purple">
                      {formatCurrency((dashboardData?.current_month_summary?.total_commissions || 0) - (dashboardData?.current_month_summary?.total_paid_commissions || 0))}
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        </GridComponent>

        <GridComponent item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ py: windowWidth <= 600 ? 1 : 2 }}>
              <Box textAlign="center">                
                <MonetizationOnIcon sx={{ fontSize: windowWidth <= 600 ? 32 : 40, color: 'info.main', mb: 1 }} />
                <Tooltip title="Valor total a ser repassado para a clínica quando todos os pagamentos pendentes forem recebidos">
                  <Box>
                    <Typography variant={windowWidth <= 600 ? "subtitle1" : "h6"}>Previsão para Clínica</Typography>
                    <Typography variant={windowWidth <= 600 ? "h6" : "h4"} color="info.main">
                      {formatCurrency(dashboardData?.current_month_summary?.total_expected_commissions || 0)}
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        </GridComponent>
      </GridComponent>

      {/* Physiotherapist Summary - Mobile optimized */}
      {user?.is_staff && dashboardData?.physiotherapist_summary && (
        <>
          <Typography variant={windowWidth <= 600 ? "h6" : "h5"} gutterBottom sx={{ mt: 4 }}>
            Resumo por Fisioterapeuta
          </Typography>
          <GridComponent container spacing={2} sx={{ mb: 4 }}>
            {dashboardData.physiotherapist_summary.map((physio) => (
              <GridComponent item xs={12} key={physio.id}>
                <Card>
                  <CardContent sx={{ py: windowWidth <= 600 ? 1 : 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontSize: windowWidth <= 600 ? '1.1rem' : '1.25rem' }}>
                        {physio.name}
                      </Typography>
                      <Typography variant="h6" color="success.main" sx={{ fontSize: windowWidth <= 600 ? '1.1rem' : '1.25rem' }}>
                        {formatCurrency(physio.total_month_revenue)}
                      </Typography>
                    </Box>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total Alunos: {physio.total_students}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Pagantes: {physio.paid_students}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="purple">
                          Comissão: {formatCurrency(physio.commission_to_pay)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </GridComponent>
            ))}
          </GridComponent>
        </>
      )}

      {/* Monthly Summary - Mobile optimized */}
      <Typography variant={windowWidth <= 600 ? "h6" : "h5"} gutterBottom>
        Resumo dos Últimos Meses
      </Typography>
      <GridComponent container spacing={2}>
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
              <CardContent sx={{ py: windowWidth <= 600 ? 1 : 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant={windowWidth <= 600 ? "subtitle1" : "h6"}>
                    {month.is_current ? '📅 ' : month.is_future ? '🔮 ' : ''}{getMonthName(month.month)}
                  </Typography>
                  <Typography variant="caption">
                    {month.year}
                  </Typography>
                </Box>

                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color={month.is_current ? 'primary.contrastText' : month.is_future ? 'info.contrastText' : 'text.secondary'}>
                      {month.is_future ? 'Previsão' : 'Recebido'}
                    </Typography>
                    <Typography variant={windowWidth <= 600 ? "subtitle1" : "h6"} color={month.is_current ? 'primary.contrastText' : month.is_future ? 'info.contrastText' : 'success.main'}>
                      {formatCurrency(month.is_future ? month.total_expected : month.total_received)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color={month.is_current ? 'primary.contrastText' : 'text.secondary'}>
                      Alunos
                    </Typography>
                    <Typography variant={windowWidth <= 600 ? "subtitle1" : "h6"} color={month.is_current ? 'primary.contrastText' : month.is_future ? 'info.contrastText' : 'success.main'}>
                      {month.is_future ? month.total_students : `${month.paid_students}/${month.total_students}`}
                    </Typography>
                  </Grid>

                  {!month.is_future && month.total_pending > 0 && (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="body2" color={month.is_current ? 'warning.light' : 'warning.main'} sx={{ mt: 1 }}>
                          Pendente: {formatCurrency(month.total_pending)}
                        </Typography>
                      </Grid>
                      {month.total_overdue > 0 && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color={month.is_current ? 'error.light' : 'error.main'}>
                            Atrasado: {formatCurrency(month.total_overdue)}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}                  {user?.is_staff && month.physiotherapist_breakdown.length > 0 && windowWidth > 600 && (
                    <>
                      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                        Detalhes por Fisioterapeuta
                      </Typography>
                      {month.physiotherapist_breakdown.map((physio) => (
                        <Box key={physio.id} sx={{ mb: 1, pl: 1, borderLeft: '2px solid', borderColor: 'divider' }}>
                          <Typography variant="caption">
                            {physio.name}: {physio.paid_students}/{physio.total_students} alunos
                          </Typography>
                        </Box>
                      ))}
                    </>
                  )}
                  </Grid>
              </CardContent>
            </Card>
          </GridComponent>
        ))}
      </GridComponent>
    </BaseLayout>
  );
};