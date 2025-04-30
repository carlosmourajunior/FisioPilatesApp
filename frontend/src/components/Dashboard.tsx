import React, { useEffect, useState } from 'react';
import { Typography, Card, CardContent, CardActions, Button, Grid, Box, CircularProgress } from '@mui/material';
import type { Theme } from '@mui/material';
import type { SxProps } from '@mui/system';
import { 
  PersonAdd as PersonAddIcon, 
  School as SchoolIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { getDashboardSummary } from '../services/dashboardService';
import type { DashboardSummary, MonthSummary } from '../services/dashboardService';
import { BaseLayout } from './shared/BaseLayout';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
      
      {/* Management Cards */}
      <GridComponent container spacing={3} sx={{ mt: 2, mb: 4 }}>
        {user?.is_staff && (
          <GridComponent item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  Gerenciar Fisioterapeutas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Adicione, edite ou remova fisioterapeutas do sistema.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<PersonAddIcon />}
                  onClick={() => navigate('/physiotherapists')}
                >
                  Acessar
                </Button>
              </CardActions>
            </Card>
          </GridComponent>
        )}
        <GridComponent item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom>
                Gerenciar Alunos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Adicione, edite ou gerencie alunos do sistema.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                startIcon={<SchoolIcon />}
                onClick={() => navigate('/students')}
              >
                Acessar
              </Button>
            </CardActions>
          </Card>
        </GridComponent>
      </GridComponent>

      {/* Summary Statistics */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Resumo Geral
      </Typography>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <GridComponent container spacing={3}>
            <GridComponent item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">Total de Alunos</Typography>
                <Typography variant="h4" color="primary">
                  {dashboardData?.total_students || 0}
                </Typography>
              </Box>
            </GridComponent>
          </GridComponent>
        </CardContent>
      </Card>

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
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
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
        {dashboardData?.monthly_summary.map((month: MonthSummary, index: number) => (
          <GridComponent item xs={12} sm={6} md={3} key={`${month.year}-${month.month}`}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {getMonthName(month.month)} {month.year}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Alunos Pagantes
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {month.paid_students} / {month.total_students}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Alunos Pendentes
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {month.pending_students}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Valor Recebido
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(month.total_received)}
                  </Typography>
                </Box>                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Valor Pendente
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {formatCurrency(month.total_pending)}
                  </Typography>
                </Box>

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