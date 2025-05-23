
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { Budget, Category } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BudgetForm from './BudgetForm';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const BudgetsPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [expenses, setExpenses] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user) {
      // Carregar orçamentos do localStorage
      const storedBudgets = localStorage.getItem(`budgets_${user.id}`);
      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets));
      }
      
      // Carregar categorias
      const storedCategories = localStorage.getItem(`categories_${user.id}`);
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }

      // Carregar transações para calcular gastos atuais
      const storedTransactions = localStorage.getItem(`transactions_${user.id}`);
      if (storedTransactions) {
        const transactions = JSON.parse(storedTransactions);
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Filtrar transações do mês atual
        const monthlyExpenses = transactions
          .filter((transaction: any) => {
            const transactionDate = new Date(transaction.date);
            return (
              transaction.type === 'expense' && 
              transactionDate.getMonth() === currentMonth &&
              transactionDate.getFullYear() === currentYear
            );
          })
          .reduce((acc: Record<string, number>, transaction: any) => {
            if (!acc[transaction.categoryId]) {
              acc[transaction.categoryId] = 0;
            }
            acc[transaction.categoryId] += transaction.amount;
            return acc;
          }, {});
        
        setExpenses(monthlyExpenses);
      }
    }
  }, [user]);

  const handleSaveBudget = (data: Partial<Budget>) => {
    if (user) {
      if (currentBudget?.id) {
        // Atualizar orçamento existente
        const updatedBudgets = budgets.map(budget => 
          budget.id === currentBudget.id ? { ...budget, ...data } as Budget : budget
        );
        setBudgets(updatedBudgets);
        localStorage.setItem(`budgets_${user.id}`, JSON.stringify(updatedBudgets));
        toast({
          title: "Orçamento atualizado",
          description: "O orçamento foi atualizado com sucesso."
        });
      } else {
        // Criar novo orçamento
        const newBudget: Budget = {
          id: Date.now().toString(),
          userId: user.id,
          categoryId: data.categoryId!,
          amount: data.amount!,
          period: data.period || 'monthly',
        };
        
        const updatedBudgets = [...budgets, newBudget];
        setBudgets(updatedBudgets);
        localStorage.setItem(`budgets_${user.id}`, JSON.stringify(updatedBudgets));
        toast({
          title: "Orçamento criado",
          description: "O novo orçamento foi criado com sucesso."
        });
      }
      
      setIsFormOpen(false);
      setCurrentBudget(null);
    }
  };

  const handleEditBudget = (budget: Budget) => {
    setCurrentBudget(budget);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (budget: Budget) => {
    setCurrentBudget(budget);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (user && currentBudget) {
      const updatedBudgets = budgets.filter(budget => budget.id !== currentBudget.id);
      setBudgets(updatedBudgets);
      localStorage.setItem(`budgets_${user.id}`, JSON.stringify(updatedBudgets));
      toast({
        title: "Orçamento excluído",
        description: "O orçamento foi excluído com sucesso."
      });
      setIsDeleteOpen(false);
      setCurrentBudget(null);
    }
  };

  const calculateProgress = (categoryId: string, amount: number) => {
    const spent = expenses[categoryId] || 0;
    return Math.min(Math.round((spent / amount) * 100), 100);
  };

  const getStatusColor = (progress: number) => {
    if (progress >= 100) return "bg-red-500";
    if (progress >= 75) return "bg-orange-400";
    return "bg-green-500";
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "Categoria Desconhecida";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orçamentos</h1>
        <Button onClick={() => { setCurrentBudget(null); setIsFormOpen(true); }}>
          <PlusCircle className="mr-2" size={18} />
          Novo Orçamento
        </Button>
      </div>
      
      {budgets.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">Você ainda não possui orçamentos cadastrados.</p>
          <Button onClick={() => { setCurrentBudget(null); setIsFormOpen(true); }}>
            <PlusCircle className="mr-2" size={18} />
            Criar primeiro orçamento
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const progress = calculateProgress(budget.categoryId, budget.amount);
            const statusColor = getStatusColor(progress);
            const categoryName = getCategoryName(budget.categoryId);
            const spent = expenses[budget.categoryId] || 0;
            
            return (
              <Card key={budget.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{categoryName}</h3>
                      <p className="text-xs text-gray-500">
                        {budget.period === 'monthly' ? 'Mensal' : 'Anual'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditBudget(budget)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteClick(budget)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>R$ {spent.toFixed(2)}</span>
                      <span>R$ {budget.amount.toFixed(2)}</span>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-2" 
                      indicatorClassName={statusColor}
                    />
                    <div className="flex justify-between text-xs">
                      <span>Gasto: {progress}%</span>
                      {progress >= 100 && <span className="text-red-500 font-semibold">Limite excedido!</span>}
                      {progress >= 75 && progress < 100 && <span className="text-orange-500 font-semibold">Quase no limite!</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Modal de formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
            </DialogTitle>
          </DialogHeader>
          <BudgetForm 
            initialData={currentBudget || undefined}
            categories={categories}
            userId={user?.id || ''}
            onSubmit={handleSaveBudget}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmação de exclusão */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Excluir orçamento"
        description="Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default BudgetsPage;
