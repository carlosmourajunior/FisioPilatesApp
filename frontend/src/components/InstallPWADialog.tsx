import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  GetApp,
  CloudOff,
  Notifications,
  Speed,
  Security,
  PhoneAndroid
} from '@mui/icons-material';
import { usePWAContext } from '../contexts/PWAContext';

interface InstallPWADialogProps {
  open: boolean;
  onClose: () => void;
}

export const InstallPWADialog: React.FC<InstallPWADialogProps> = ({ open, onClose }) => {
  const { installApp } = usePWAContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleInstall = async () => {
    await installApp();
    onClose();
  };

  const features = [
    {
      icon: <CloudOff color="primary" />,
      title: 'Funciona Offline',
      description: 'Acesse informações mesmo sem internet'
    },
    {
      icon: <Speed color="primary" />,
      title: 'Carregamento Rápido',
      description: 'Interface otimizada e responsiva'
    },
    {
      icon: <Notifications color="primary" />,
      title: 'Notificações',
      description: 'Receba lembretes de consultas e tarefas'
    },
    {
      icon: <Security color="primary" />,
      title: 'Seguro',
      description: 'Dados protegidos e criptografados'
    },
    {
      icon: <PhoneAndroid color="primary" />,
      title: 'Como App Nativo',
      description: 'Experiência similar a um app mobile'
    }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <GetApp color="primary" />
          <Typography variant="h6">
            Instalar FisioPilates App
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" color="textSecondary" paragraph>
          Instale o FisioPilates como um aplicativo para ter acesso rápido e uma experiência melhorada.
        </Typography>

        <List>
          {features.map((feature, index) => (
            <ListItem key={index} divider={index < features.length - 1}>
              <ListItemIcon>
                {feature.icon}
              </ListItemIcon>
              <ListItemText
                primary={feature.title}
                secondary={feature.description}
              />
            </ListItem>
          ))}
        </List>

        <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
          <Typography variant="body2" color="textSecondary">
            <strong>Como instalar:</strong>
            <br />
            • Clique em "Instalar Agora"
            <br />
            • Confirme a instalação no pop-up do navegador
            <br />
            • O app aparecerá na sua área de trabalho/menu
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Mais Tarde
        </Button>
        <Button
          onClick={handleInstall}
          variant="contained"
          color="primary"
          startIcon={<GetApp />}
        >
          Instalar Agora
        </Button>
      </DialogActions>
    </Dialog>
  );
};
