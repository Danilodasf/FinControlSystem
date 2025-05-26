import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/AuthForm';
import Sidebar from '@/components/Sidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const isMobile = useIsMobile();
  const location = useLocation();

  // Fecha a sidebar automaticamente em mobile ao navegar
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-bold text-2xl">FC</span>
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="flex h-screen bg-background relative">
      {/* Botão para alternar sidebar */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-30"
        onClick={() => setSidebarOpen((open) => !open)}
        aria-label={sidebarOpen ? 'Ocultar menu' : 'Mostrar menu'}
      >
        <Menu className="w-6 h-6" />
      </Button>
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 h-full ${
          sidebarOpen ? 'w-64' : 'w-0'
        } flex-shrink-0 overflow-hidden bg-sidebar`}
      >
        {sidebarOpen && <Sidebar onNavigate={() => isMobile && setSidebarOpen(false)} />}
      </div>
      {/* Conteúdo principal */}
      <div className={`flex-1 overflow-auto transition-all duration-300 ${!sidebarOpen ? 'pl-14' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
