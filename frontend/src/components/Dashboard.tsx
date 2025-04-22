import React from 'react';
import { Typography, Card, CardContent, CardActions, Button, Grid } from '@mui/material';
import type { Theme } from '@mui/material';
import type { SxProps } from '@mui/system';
import { PersonAdd as PersonAddIcon, School as SchoolIcon } from '@mui/icons-material';
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

  return (
    <BaseLayout>
      <Typography variant="h4" gutterBottom>
        Bem-vindo ao Sistema de Fisioterapia e Pilates
      </Typography>
      <GridComponent container spacing={3} sx={{ mt: 2 }}>
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
    </BaseLayout>
  );
};