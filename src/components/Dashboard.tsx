
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Wallet, PiggyBank } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useAccounts } from '@/hooks/useAccounts';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const { transactions, isLoading } = useTransactions();
  const { categories } = useCategories();
  const { accounts } = useAccounts();

  // Calcular dados do mês atual
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const now = new Date();
    return transactionDate.getMonth() === now.getMonth() && 
           transactionDate.getFullYear() === now.getFullYear();
  });

  const totalReceitas = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDespesas = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const saldoAtual = totalReceitas - totalDespesas;

  // Preparar dados para gráficos
  const prepareMonthlyData = () => {
    const now = new Date();
    const months = Array(6).fill(0).map((_, i) => {
      const date = subMonths(now, 5 - i);
      return {
        month: format(date, 'MMM', { locale: ptBR }),
        receitas: 0,
        despesas: 0
      };
    });

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const monthName = format(transactionDate, 'MMM', { locale: ptBR });
      const monthIndex = months.findIndex(m => m.month === monthName);
      
      if (monthIndex >= 0) {
        if (transaction.type === 'income') {
          months[monthIndex].receitas += transaction.amount;
        } else {
          months[monthIndex].despesas += transaction.amount;
        }
      }
    });

    return months;
  };

  const prepareCategoryData = () => {
    const expensesByCategory: Record<string, number> = {};
    
    currentMonthTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const category = categories.find(cat => cat.id === transaction.category_id);
        const categoryName = category?.name || "Outros";
        if (!expensesByCategory[categoryName]) {
          expensesByCategory[categoryName] = 0;
        }
        expensesByCategory[categoryName] += transaction.amount;
      });

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];
    return Object.entries(expensesByCategory).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "Sem categoria";
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account?.name || "Conta não encontrada";
  };

  const monthlyData = prepareMonthlyData();
  const categoryData = prepareCategoryData();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral das suas finanças</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {saldoAtual.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Saldo do mês atual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalReceitas.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de receitas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalDespesas.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de despesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonthTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Lançamentos no mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
            <CardDescription>
              Receitas e despesas dos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                />
                <Line 
                  type="monotone" 
                  dataKey="receitas" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  name="Receitas"
                />
                <Line 
                  type="monotone" 
                  dataKey="despesas" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  name="Despesas"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>
              Distribuição das despesas do mês atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {categoryData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']} />
                </PieChart>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Nenhuma despesa encontrada
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Últimas transações */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Transações</CardTitle>
          <CardDescription>
            Suas transações mais recentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Nenhuma transação encontrada
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.title}</p>
                    <p className="text-sm text-gray-500">
                      {getCategoryName(transaction.category_id)} • {getAccountName(transaction.account_id)} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
