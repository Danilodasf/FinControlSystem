
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Category, Transaction } from '@/types';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [period, setPeriod] = useState<'current' | '3months' | '6months' | 'year'>('current');
  
  useEffect(() => {
    if (user) {
      // Carregar transações
      const storedTransactions = localStorage.getItem(`transactions_${user.id}`);
      if (storedTransactions) {
        const parsedTransactions = JSON.parse(storedTransactions).map((transaction: any) => ({
          ...transaction,
          date: new Date(transaction.date)
        }));
        setTransactions(parsedTransactions);
      }

      // Carregar categorias
      const storedCategories = localStorage.getItem(`categories_${user.id}`);
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }
    }
  }, [user]);

  const getFilteredTransactions = () => {
    if (!transactions.length) return [];
    
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '3months':
        startDate = subMonths(now, 3);
        break;
      case '6months':
        startDate = subMonths(now, 6);
        break;
      case 'year':
        startDate = subMonths(now, 12);
        break;
      default:
        // Mês atual
        startDate = startOfMonth(now);
    }
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= now;
    });
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "Sem categoria";
  };

  const prepareIncomeVsExpenseData = () => {
    const filteredTransactions = getFilteredTransactions();
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return [
      { name: 'Receitas', value: income },
      { name: 'Despesas', value: expense },
    ];
  };

  const prepareCategoryExpenseData = () => {
    const filteredTransactions = getFilteredTransactions();
    const expensesByCategory: Record<string, number> = {};
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const categoryName = getCategoryName(transaction.category_id);
        if (!expensesByCategory[categoryName]) {
          expensesByCategory[categoryName] = 0;
        }
        expensesByCategory[categoryName] += transaction.amount;
      });
    
    return Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
  };

  const prepareMonthlyBalanceData = () => {
    const now = new Date();
    const months = Array(6).fill(0).map((_, i) => {
      const date = subMonths(now, 5 - i);
      return {
        month: format(date, 'MMM', { locale: ptBR }),
        income: 0,
        expense: 0,
        balance: 0
      };
    });
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const monthIndex = months.findIndex(m => 
        format(transactionDate, 'MMM', { locale: ptBR }) === m.month
      );
      
      if (monthIndex >= 0) {
        if (transaction.type === 'income') {
          months[monthIndex].income += transaction.amount;
        } else {
          months[monthIndex].expense += transaction.amount;
        }
        months[monthIndex].balance = months[monthIndex].income - months[monthIndex].expense;
      }
    });
    
    return months;
  };

  const calculateTotals = () => {
    const filteredTransactions = getFilteredTransactions();
    
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense;
    
    return { income, expense, balance };
  };

  const exportToCsv = () => {
    const filteredTransactions = getFilteredTransactions();
    if (filteredTransactions.length === 0) return;
    
    const headers = ['Data', 'Título', 'Categoria', 'Valor', 'Tipo'];
    
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        format(new Date(t.date), 'dd/MM/yyyy'),
        `"${t.title}"`,
        `"${getCategoryName(t.category_id)}"`,
        t.amount.toFixed(2).replace('.', ','),
        t.type === 'income' ? 'Receita' : 'Despesa'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_financeiro_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { income, expense, balance } = calculateTotals();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <Select
              value={period}
              onValueChange={(value) => setPeriod(value as any)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Mês atual</SelectItem>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>
                <SelectItem value="6months">Últimos 6 meses</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" onClick={exportToCsv}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {income.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {expense.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {balance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer 
              config={{
                income: { label: "Receitas", color: "#22c55e" },
                expense: { label: "Despesas", color: "#ef4444" }
              }}
            >
              <PieChart>
                <Pie
                  data={prepareIncomeVsExpenseData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {prepareIncomeVsExpenseData().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'Receitas' ? '#22c55e' : '#ef4444'} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer config={{}}>
              <BarChart data={prepareCategoryExpenseData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6">
                  {prepareCategoryExpenseData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Evolução Mensal</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ChartContainer 
            config={{
              income: { label: "Receitas", color: "#22c55e" },
              expense: { label: "Despesas", color: "#ef4444" },
              balance: { label: "Saldo", color: "#3b82f6" }
            }}
          >
            <LineChart data={prepareMonthlyBalanceData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#22c55e" name="Receitas" />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Despesas" />
              <Line type="monotone" dataKey="balance" stroke="#3b82f6" name="Saldo" />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </div>
    </div>
  );
};

export default ReportsPage;
