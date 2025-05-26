
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  ChartPie, 
  FileText, 
  PiggyBank, 
  Settings, 
  Users, 
  Wallet,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

const navigation = [
  { name: 'Dashboard', href: '/', icon: ChartPie },
  { name: 'Lançamentos', href: '/transactions', icon: FileText },
  { name: 'Contas', href: '/accounts', icon: Wallet },
  { name: 'Categorias', href: '/categories', icon: Users },
  { name: 'Orçamentos', href: '/budgets', icon: PiggyBank },
  { name: 'Objetivos', href: '/goals', icon: ArrowUp },
  { name: 'Relatórios', href: '/reports', icon: ChartPie },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { profile } = useProfile();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FC</span>
          </div>
          <span className="text-xl font-bold text-gray-900">FinControl</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url} alt={profile?.name} />
            <AvatarFallback>
              {profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {profile?.name || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {profile?.email || user?.email}
            </p>
          </div>
        </div>
        <Button
          onClick={logout}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Sair
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
