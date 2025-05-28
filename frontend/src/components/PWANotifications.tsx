import React from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  Snackbar,
  IconButton,
  Box
} from '@mui/material';
import {
  GetApp,
  Close,
  CloudOff,
  Update,
  Notifications
} from '@mui/icons-material';
import { usePWA } from '../hooks/usePWA';

export const PWANotifications: React.FC = () => {
  const {
    canInstall,
    isOnline,
    serviceWorkerUpdate,
    installApp,
    requestNotificationPermission
  } = usePWA();

  const [showInstallPrompt, setShowInstallPrompt] = React.useState(true);
  const [showOfflineAlert, setShowOfflineAlert] = React.useState(false);
  const [showUpdateAlert, setShowUpdateAlert] = React.useState(false);

  React.useEffect(() => {
    if (!isOnline) {
      setShowOfflineAlert(true);
    }
  }, [isOnline]);

  React.useEffect(() => {
    if (serviceWorkerUpdate.waiting) {
      setShowUpdateAlert(true);
    }
  }, [serviceWorkerUpdate.waiting]);

  const handleInstall = async () => {
    await installApp();
    setShowInstallPrompt(false);
  };

  const handleUpdate = () => {
    serviceWorkerUpdate.update();
    setShowUpdateAlert(false);
  };

  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      console.log('Notificações habilitadas!');
    }
  };

  return (
    <>
      {/* Install App Prompt */}
      <Snackbar
        open={canInstall && showInstallPrompt}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={null}
      >
        <Alert
          severity="info"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                startIcon={<GetApp />}
                onClick={handleInstall}
              >
                Instalar
              </Button>
              <IconButton
                size="small"
                color="inherit"
                onClick={() => setShowInstallPrompt(false)}
              >
                <Close />
              </IconButton>
            </Box>
          }
        >
          <AlertTitle>Instalar FisioPilates</AlertTitle>
          Instale o app para uma melhor experiência!
        </Alert>
      </Snackbar>

      {/* Offline Alert */}
      <Snackbar
        open={!isOnline && showOfflineAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={null}
      >
        <Alert
          severity="warning"
          icon={<CloudOff />}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setShowOfflineAlert(false)}
            >
              <Close />
            </IconButton>
          }
        >
          <AlertTitle>Modo Offline</AlertTitle>
          Você está trabalhando offline. Algumas funcionalidades podem estar limitadas.
        </Alert>
      </Snackbar>

      {/* Update Available Alert */}
      <Snackbar
        open={showUpdateAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={null}
      >
        <Alert
          severity="success"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                startIcon={<Update />}
                onClick={handleUpdate}
              >
                Atualizar
              </Button>
              <IconButton
                size="small"
                color="inherit"
                onClick={() => setShowUpdateAlert(false)}
              >
                <Close />
              </IconButton>
            </Box>
          }
        >
          <AlertTitle>Atualização Disponível</AlertTitle>
          Uma nova versão está disponível!
        </Alert>
      </Snackbar>

      {/* Enable Notifications Button */}
      {Notification.permission === 'default' && (
        <Snackbar
          open={true}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          autoHideDuration={8000}
        >
          <Alert
            severity="info"
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<Notifications />}
                onClick={handleEnableNotifications}
              >
                Ativar
              </Button>
            }
          >
            Ative as notificações para receber lembretes importantes!
          </Alert>
        </Snackbar>
      )}
    </>
  );
};
