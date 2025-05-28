import React from 'react';
import {
  Chip,
  Box,
  Typography,
  Fade
} from '@mui/material';
import {
  CloudOff,
  Wifi
} from '@mui/icons-material';
import { usePWAContext } from '../contexts/PWAContext';

export const NetworkStatus: React.FC = () => {
  const { isOnline } = usePWAContext();

  return (
    <Box position="fixed" top={16} right={16} zIndex={9999}>
      <Fade in={!isOnline}>
        <Chip
          icon={<CloudOff />}
          label="Offline"
          color="warning"
          variant="filled"
          size="small"
          sx={{
            boxShadow: 2,
            backgroundColor: 'warning.main',
            color: 'warning.contrastText',
            '& .MuiChip-icon': {
              color: 'warning.contrastText'
            }
          }}
        />
      </Fade>
      
      <Fade in={isOnline}>
        <Chip
          icon={<Wifi />}
          label="Online"
          color="success"
          variant="filled"
          size="small"
          sx={{
            boxShadow: 2,
            backgroundColor: 'success.main',
            color: 'success.contrastText',
            '& .MuiChip-icon': {
              color: 'success.contrastText'
            }
          }}
        />
      </Fade>
    </Box>
  );
};
