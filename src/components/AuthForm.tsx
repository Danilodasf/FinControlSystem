import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();
  const { theme, forceTheme } = useTheme();
  const [prevTheme, setPrevTheme] = useState(theme);

  useEffect(() => {
    setPrevTheme(theme);
    forceTheme('light');
    return () => {
      forceTheme(null); // Restaura o tema anterior
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        await login(email, password);
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao FinControl",
        });
      } else {
        await register(email, password, name);
        toast({
          title: "Conta criada com sucesso!",
          description: "Bem-vindo ao FinControl",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Verifique suas credenciais e tente novamente",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e3ecfc] via-[#dbeafe] to-[#b6d0f7] p-4 overflow-hidden">
      {/* Shapes decorativos mais visíveis */}
      <div className="absolute -top-48 -left-48 w-[45rem] h-[45rem] bg-gradient-to-br from-blue-500 to-indigo-500 opacity-40 rounded-full blur-[140px] z-0" />
      <div className="absolute -bottom-56 right-0 w-[38rem] h-[38rem] bg-gradient-to-tr from-indigo-400 to-blue-300 opacity-35 rounded-full blur-[120px] z-0" />
      <div className="absolute top-1/2 left-1/2 w-[32rem] h-[32rem] bg-gradient-to-br from-blue-300 to-indigo-200 opacity-25 rounded-full blur-[120px] z-0" style={{ transform: 'translate(-50%, -50%)' }} />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400 to-indigo-300 opacity-20 rounded-full blur-[90px] z-0" />
      {/* Card de autenticação */}
      <Card className="w-full max-w-md shadow-2xl rounded-2xl border-0 z-10">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="text-white font-bold text-3xl tracking-tight">FC</span>
          </div>
          <CardTitle className="text-3xl font-extrabold text-blue-900 mb-1 font-sans tracking-tight">
            {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
          </CardTitle>
          <CardDescription className="text-base text-gray-600 mb-2 font-sans">
            {isLogin 
              ? 'Acesse sua conta para gerenciar suas finanças com facilidade.' 
              : 'Preencha os dados abaixo para começar a usar o FinControl.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <Input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 text-base px-4 bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 text-base px-4 bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 text-base px-4 bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <Button type="submit" className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md rounded-lg" disabled={isLoading}>
              {isLoading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-700 hover:text-indigo-700 font-semibold text-base underline underline-offset-4 transition-colors"
            >
              {isLogin ? 'Não tem uma conta? Registre-se' : 'Já tem uma conta? Entrar'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;
