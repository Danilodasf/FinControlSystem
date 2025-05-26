import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Wallet, PiggyBank, CreditCard, TrendingUp, Edit, FileText } from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { useToast } from '@/hooks/use-toast';
import EditAccountDialog from './EditAccountDialog';
import AccountStatementDialog from './AccountStatementDialog';
import { Account } from '@/types';

const AccountsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [statementAccount, setStatementAccount] = useState<Account | null>(null);
  
  const { accounts, isLoading, createAccount } = useAccounts();
  const { toast } = useToast();

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking': return Wallet;
      case 'savings': return PiggyBank;
      case 'wallet': return Wallet;
      case 'investment': return TrendingUp;
      default: return CreditCard;
    }
  };

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'checking': return 'bg-blue-500';
      case 'savings': return 'bg-green-500';
      case 'wallet': return 'bg-yellow-500';
      case 'investment': return 'bg-orange-500';
      default: return 'bg-purple-500';
    }
  };

  const getAccountTypeLabel = (type: string) => {
    const types = {
      checking: 'Conta Corrente',
      savings: 'Poupança',
      wallet: 'Carteira',
      investment: 'Investimento'
    };
    return types[type as keyof typeof types] || type;
  };

  const getBalanceColor = (balance: number) => {
    return balance >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);

  const handleCreateAccount = async () => {
    if (!newAccountName || !newAccountType || !newAccountBalance) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAccount.mutateAsync({
        name: newAccountName,
        type: newAccountType,
        balance: parseFloat(newAccountBalance),
      });

      toast({
        title: "Conta criada",
        description: "A conta foi criada com sucesso!",
      });

      setIsDialogOpen(false);
      setNewAccountName('');
      setNewAccountType('');
      setNewAccountBalance('');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar conta",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">Carregando contas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contas</h1>
          <p className="text-muted-foreground">Gerencie suas contas financeiras</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
              <Input 
                placeholder="Nome da conta" 
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
              />
              <Select value={newAccountType} onValueChange={setNewAccountType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Conta Corrente</SelectItem>
                  <SelectItem value="savings">Poupança</SelectItem>
                  <SelectItem value="wallet">Carteira</SelectItem>
                  <SelectItem value="investment">Investimento</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                type="number" 
                placeholder="Saldo inicial" 
                step="0.01"
                value={newAccountBalance}
                onChange={(e) => setNewAccountBalance(e.target.value)}
              />
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleCreateAccount}
                  disabled={createAccount.isPending}
                >
                  {createAccount.isPending ? 'Salvando...' : 'Salvar'}
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
              <p className="text-sm text-gray-500">Contas Ativas</p>
              <p className="text-2xl font-bold text-green-600">
                {accounts.filter(a => Number(a.balance) > 0).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de contas */}
      {accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma conta encontrada</h3>
            <p className="text-gray-600 mb-4">Comece criando sua primeira conta financeira</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar primeira conta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.map((account) => {
            const Icon = getAccountIcon(account.type);
            return (
              <Card key={account.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-full ${getAccountColor(account.type)} text-white`}>
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
                    <span className={`text-xl font-bold ${getBalanceColor(Number(account.balance))}`}>
                      R$ {Math.abs(Number(account.balance)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setEditingAccount(account)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setStatementAccount(account)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Extrato
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      {editingAccount && (
        <EditAccountDialog
          account={editingAccount}
          isOpen={!!editingAccount}
          onClose={() => setEditingAccount(null)}
        />
      )}
      
      {statementAccount && (
        <AccountStatementDialog
          account={statementAccount}
          isOpen={!!statementAccount}
          onClose={() => setStatementAccount(null)}
        />
      )}
    </div>
  );
};

export default AccountsPage;
