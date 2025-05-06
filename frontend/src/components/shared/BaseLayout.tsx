import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Toolbar } from '@mui/material';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const drawerWidth = 240;

const Main = styled('main')<{
  open?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  [theme.breakpoints.up('sm')]: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
  },
}));

interface BaseLayoutProps {
  children: React.ReactNode;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = window.innerWidth <= 600;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCloseDrawer = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Header onMenuClick={handleDrawerToggle} />
      <Sidebar 
        open={isMobile ? mobileOpen : true} 
        drawerWidth={drawerWidth} 
        onClose={handleCloseDrawer}
        isMobile={isMobile}
      />
      <Main>
        <Toolbar />
        {children}
      </Main>
    </Box>
  );
};