import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { SnackbarProvider } from 'notistack';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Dashboard } from './components/Dashboard';
import { AccountDetails } from './components/auth/AccountDetails';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import PhysiotherapistList from './components/physiotherapist/PhysiotherapistList';
import PhysiotherapistForm from './components/physiotherapist/PhysiotherapistForm';
import StudentList from './components/student/StudentList';
import StudentForm from './components/student/StudentForm';
import ModalityList from './components/modality/ModalityList';
import ModalityForm from './components/modality/ModalityForm';
import StudentCalendar from './components/student/StudentCalendar';
import PaymentDashboard from './components/payment/PaymentDashboard';
import CommissionList from './components/commission/CommissionList';
import StudentDetails from './components/student/StudentDetails';
import StudentImport from './components/student/StudentImport';
import './App.css';

const theme = createTheme({
  palette: {    primary: {
      main: '#2E8B57', // Verde esmeralda
      light: '#3CB371',
      dark: '#006400',
    },
    purple: {
      main: '#8B008B', // DarkMagenta
      light: '#BA55D3', // MediumOrchid
      dark: '#4B0082', // Indigo
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#4682B4', // Azul aço
      light: '#87CEEB',
      dark: '#004B8D',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
  },
});

function App() {
  return (    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <SnackbarProvider maxSnack={3}>
          <AuthProvider>
            <Router>
              <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute>
                        <AccountDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/physiotherapists"
                    element={
                      <AdminRoute>
                        <PhysiotherapistList />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/physiotherapists/new"
                    element={
                      <AdminRoute>
                        <PhysiotherapistForm />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/physiotherapists/edit/:id"
                    element={
                      <AdminRoute>
                        <PhysiotherapistForm />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/students"
                    element={
                      <ProtectedRoute>
                        <StudentList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/students/new"
                    element={
                      <ProtectedRoute>
                        <StudentForm />
                      </ProtectedRoute>
                    }
                  />              <Route
                    path="/students/edit/:id"
                    element={
                      <ProtectedRoute>
                        <StudentForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/students/details/:id"
                    element={
                      <ProtectedRoute>
                        <StudentDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/modalities"
                    element={
                      <ProtectedRoute>
                        <ModalityList />
                      </ProtectedRoute>
                    }
                  />              <Route
                    path="/modalities/new"
                    element={
                      <ProtectedRoute>
                        <ModalityForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/students/import"
                    element={
                      <ProtectedRoute>
                        <StudentImport />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/modalities/edit/:id"
                    element={
                      <ProtectedRoute>
                        <ModalityForm />
                      </ProtectedRoute>
                    }
                  />              <Route
                    path="/calendar"
                    element={
                      <ProtectedRoute>
                        <StudentCalendar />
                      </ProtectedRoute>
                    }
                  />              <Route
                    path="/payments"
                    element={
                      <ProtectedRoute>
                        <PaymentDashboard />
                      </ProtectedRoute>
                    }
                  />                  <Route
                    path="/payments/commission"
                    element={
                      <ProtectedRoute>
                        <CommissionList />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Router>
            </AuthProvider>
        </SnackbarProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
