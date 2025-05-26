import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { format, subMonths, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download, Filter, FileText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'current' | '3months' | '6months' | 'year'>('current');
  const [reportType, setReportType] = useState<'all' | 'income' | 'expense'>('all');
  
  const { transactions, isLoading } = useTransactions();
  const { categories } = useCategories();

  // Debug log para verificar as transações carregadas
  console.log('Todas as transações carregadas:', transactions);
  console.log('Total de transações:', transactions.length);
  console.log('Receitas:', transactions.filter(t => t.type === 'income'));
  console.log('Despesas:', transactions.filter(t => t.type === 'expense'));

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
        startDate = startOfMonth(now);
    }
    
    let filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= now;
    });

    console.log('Transações filtradas por período:', filtered);

    // Filtrar por tipo de relatório
    if (reportType === 'income') {
      filtered = filtered.filter(t => t.type === 'income');
      console.log('Transações filtradas (apenas receitas):', filtered);
    } else if (reportType === 'expense') {
      filtered = filtered.filter(t => t.type === 'expense');
      console.log('Transações filtradas (apenas despesas):', filtered);
    }
    
    return filtered;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "Sem categoria";
  };

  const prepareIncomeVsExpenseData = () => {
    const filteredTransactions = getFilteredTransactions();
    
    console.log('Preparando dados de receitas vs despesas com:', filteredTransactions);
    
    if (reportType === 'income') {
      const income = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      console.log('Total de receitas:', income);
      return [{ name: 'Receitas', value: income }];
    } else if (reportType === 'expense') {
      const expense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      console.log('Total de despesas:', expense);
      return [{ name: 'Despesas', value: expense }];
    } else {
      const income = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const expense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      console.log('Total de receitas:', income, 'Total de despesas:', expense);
      
      return [
        { name: 'Receitas', value: income },
        { name: 'Despesas', value: expense },
      ];
    }
  };

  const prepareCategoryExpenseData = () => {
    const filteredTransactions = getFilteredTransactions();
    const transactionsByCategory: Record<string, number> = {};
    
    filteredTransactions.forEach(transaction => {
      const categoryName = getCategoryName(transaction.category_id);
      if (!transactionsByCategory[categoryName]) {
        transactionsByCategory[categoryName] = 0;
      }
      transactionsByCategory[categoryName] += Number(transaction.amount);
    });
    
    return Object.entries(transactionsByCategory).map(([name, value]) => ({ name, value }));
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
      const monthName = format(transactionDate, 'MMM', { locale: ptBR });
      const monthIndex = months.findIndex(m => m.month === monthName);
      
      if (monthIndex >= 0) {
        const amount = Number(transaction.amount);
        if (transaction.type === 'income') {
          months[monthIndex].income += amount;
        } else {
          months[monthIndex].expense += amount;
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
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const balance = income - expense;
    
    console.log('Totais calculados - Receitas:', income, 'Despesas:', expense, 'Saldo:', balance);
    
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
        Number(t.amount).toFixed(2).replace('.', ','),
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

  const exportToPdf = () => {
    const filteredTransactions = getFilteredTransactions();
    if (filteredTransactions.length === 0) return;
    
    const { income, expense, balance } = calculateTotals();
    const periodText = {
      'current': 'Mês Atual',
      '3months': 'Últimos 3 Meses',
      '6months': 'Últimos 6 Meses',
      'year': 'Último Ano'
    }[period];

    const reportTypeText = {
      'all': 'Receitas e Despesas',
      'income': 'Apenas Receitas',
      'expense': 'Apenas Despesas'
    }[reportType];

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório Financeiro</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin-bottom: 30px; }
          .summary-item { display: inline-block; margin: 10px 20px; padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
          .income { color: #22c55e; }
          .expense { color: #ef4444; }
          .balance { color: ${balance >= 0 ? '#22c55e' : '#ef4444'}; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .text-center { text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório Financeiro</h1>
          <h2>Período: ${periodText}</h2>
          <h3>Tipo: ${reportTypeText}</h3>
          <p>Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
        </div>
        
        <div class="summary">
          <h3>Resumo</h3>
          ${reportType !== 'expense' ? `
          <div class="summary-item income">
            <strong>Receitas</strong><br>
            R$ ${income.toFixed(2)}
          </div>
          ` : ''}
          ${reportType !== 'income' ? `
          <div class="summary-item expense">
            <strong>Despesas</strong><br>
            R$ ${expense.toFixed(2)}
          </div>
          ` : ''}
          ${reportType === 'all' ? `
          <div class="summary-item balance">
            <strong>Saldo</strong><br>
            R$ ${balance.toFixed(2)}
          </div>
          ` : ''}
        </div>

        <h3>Transações</h3>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Título</th>
              <th>Categoria</th>
              <th>Valor</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTransactions.map(t => `
              <tr>
                <td>${format(new Date(t.date), 'dd/MM/yyyy')}</td>
                <td>${t.title}</td>
                <td>${getCategoryName(t.category_id)}</td>
                <td class="${t.type === 'income' ? 'income' : 'expense'}">R$ ${Number(t.amount).toFixed(2)}</td>
                <td>${t.type === 'income' ? 'Receita' : 'Despesa'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Carregando relatórios...</div>
      </div>
    );
  }

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

          <div className="flex items-center">
            <Select
              value={reportType}
              onValueChange={(value) => setReportType(value as any)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo de relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Receitas e Despesas</SelectItem>
                <SelectItem value="income">Apenas Receitas</SelectItem>
                <SelectItem value="expense">Apenas Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportToCsv}>
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPdf}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        {reportType !== 'expense' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        )}
        {reportType !== 'income' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        )}
        {reportType === 'all' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saldo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {reportType === 'all' ? 'Receitas vs Despesas' : 
               reportType === 'income' ? 'Receitas por Categoria' : 
               'Despesas por Categoria'}
            </CardTitle>
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
                  data={reportType === 'all' ? prepareIncomeVsExpenseData() : prepareCategoryExpenseData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {(reportType === 'all' ? prepareIncomeVsExpenseData() : prepareCategoryExpenseData()).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={reportType === 'all' ? 
                        (entry.name === 'Receitas' ? '#22c55e' : '#ef4444') : 
                        COLORS[index % COLORS.length]
                      } 
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
            <CardTitle>
              {reportType === 'income' ? 'Receitas por Categoria' : 
               reportType === 'expense' ? 'Despesas por Categoria' : 
               'Gastos por Categoria'}
            </CardTitle>
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
      
      {reportType === 'all' && (
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
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;
