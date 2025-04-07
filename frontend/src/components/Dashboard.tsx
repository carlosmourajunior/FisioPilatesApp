import React from 'react';
import { Typography } from '@mui/material';
import { BaseLayout } from './shared/BaseLayout';

export const Dashboard: React.FC = () => {
  return (
    <BaseLayout>
      <Typography paragraph>
        Bem-vindo ao GenericApp
      </Typography>
    </BaseLayout>
  );
};