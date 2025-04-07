import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../utils/axios';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await api.get('/api/auth/login/');
        await checkAuth();
      } catch (error) {
        console.error('Falha na inicialização da autenticação:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/api/auth/user/');
      setUser(response.data);
    } catch (error) {
      console.error('Falha na verificação de autenticação:', error);
      setUser(null);
      throw error;
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login/', { username, password });
      setUser(response.data);
    } catch (error) {
      console.error('Falha no login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout/');
      setUser(null);
    } catch (error) {
      console.error('Falha ao desconectar:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await api.post('/api/auth/register/', userData);
      setUser(response.data);
    } catch (error) {
      console.error('Falha no registro:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};