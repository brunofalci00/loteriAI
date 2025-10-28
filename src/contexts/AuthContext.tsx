import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().trim().min(2, 'Nome muito curto').optional(),
});

interface User {
  email: string;
  name: string;
  isAuthenticated: boolean;
  hasPaid: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const storedUser = localStorage.getItem('lottosort_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Validação
      authSchema.parse({ email, password });
      
      // Simular delay de autenticação
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const userData: User = {
        email,
        name: email.split('@')[0],
        isAuthenticated: true,
        hasPaid: true, // Simula usuário que já pagou
      };
      
      localStorage.setItem('lottosort_user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('Erro ao fazer login');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      // Validação
      authSchema.parse({ email, password, name });
      
      // Simular delay de criação de conta
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const userData: User = {
        email,
        name,
        isAuthenticated: true,
        hasPaid: true, // Simula usuário que já pagou
      };
      
      localStorage.setItem('lottosort_user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success('Conta criada com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('Erro ao criar conta');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('lottosort_user');
    setUser(null);
    toast.success('Você saiu da sua conta');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
