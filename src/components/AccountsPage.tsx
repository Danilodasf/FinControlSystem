
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Wallet, PiggyBank, CreditCard, TrendingUp } from 'lucide-react';

const AccountsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Dados mockados
  const accounts = [
    { 
      id: 1, 
      name: 'Conta Corrente Banco do Brasil', 
      type: 'checking', 
      balance: 2500.00,
      icon: Wallet,
      color: 'bg-blue-500'
    },
    { 
      id: 2, 
      name: 'Poupança Caixa', 
      type: 'savings', 
      balance: 15000.00,
      icon: PiggyBank,
      color: 'bg-green-500'
    },
    { 
      id: 3, 
      name: 'Cartão de Crédito Nubank', 
      type: 'credit', 
      balance: -850.00,
      icon: CreditCard,
      color: 'bg-purple-500'
    },
    { 
      id: 4, 
      name: 'Investimentos XP', 
      type: 'investment', 
      balance: 8750.00,
      icon: TrendingUp,
      color: 'bg-orange-500'
    },
  ];

  const getAccountTypeLabel = (type: string) => {
    const types = {
      checking: 'Conta Corrente',
      savings: 'Poupança',
      credit: 'Cartão de Crédito',
      investment: 'Investimento'
    };
    return types[type as keyof typeof types] || type;
  };

  const getBalanceColor = (balance: number) => {
    return balance >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const totalBalance = accounts
    .filter(account => account.type !== 'credit')
    .reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contas</h1>
          <p className="text-gray-600">Gerencie suas contas financeiras</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Conta</DialogTitle>
              <DialogDescription>
                Adicione uma nova conta financeira
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nome da conta" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Conta Corrente</SelectItem>
                  <SelectItem value="savings">Poupança</SelectItem>
                  <SelectItem value="credit">Cartão de Crédito</SelectItem>
                  <SelectItem value="investment">Investimento</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Saldo inicial" step="0.01" />
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo das Contas</CardTitle>
          <CardDescription>
            Visão geral do seu patrimônio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Patrimônio Total</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Número de Contas</p>
              <p className="text-2xl font-bold text-blue-600">
                {accounts.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Dívidas em Cartão</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {Math.abs(accounts.find(a => a.type === 'credit')?.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de contas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((account) => {
          const Icon = account.icon;
          return (
            <Card key={account.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full ${account.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <Badge variant="secondary">
                        {getAccountTypeLabel(account.type)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Saldo</span>
                  <span className={`text-xl font-bold ${getBalanceColor(account.balance)}`}>
                    R$ {Math.abs(account.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Extrato
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AccountsPage;
