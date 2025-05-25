
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Budget } from '@/types';
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
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';

const BudgetsPage: React.FC = () => {
  const { toast } = useToast();
  const { budgets, isLoading, createBudget, updateBudget, deleteBudget } = useBudgets();
  const { categories } = useCategories();
  const { transactions } = useTransactions();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);

  // Calculate current expenses by category for this month
  const getCurrentMonthExpenses = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return transactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return (
          transaction.type === 'expense' && 
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((acc: Record<string, number>, transaction) => {
        if (!acc[transaction.category_id]) {
          acc[transaction.category_id] = 0;
        }
        acc[transaction.category_id] += transaction.amount;
        return acc;
      }, {});
  };

  const expenses = getCurrentMonthExpenses();

  const handleSaveBudget = async (data: Partial<Budget>) => {
    try {
      if (currentBudget?.id) {
        await updateBudget.mutateAsync({ id: currentBudget.id, ...data });
        toast({
          title: "Orçamento atualizado",
          description: "O orçamento foi atualizado com sucesso."
        });
      } else {
        await createBudget.mutateAsync(data as Omit<Budget, 'id' | 'created_at'>);
        toast({
          title: "Orçamento criado",
          description: "O novo orçamento foi criado com sucesso."
        });
      }
      
      setIsFormOpen(false);
      setCurrentBudget(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar orçamento",
        variant: "destructive",
      });
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

  const handleDeleteConfirm = async () => {
    if (currentBudget) {
      try {
        await deleteBudget.mutateAsync(currentBudget.id);
        toast({
          title: "Orçamento excluído",
          description: "O orçamento foi excluído com sucesso."
        });
        setIsDeleteOpen(false);
        setCurrentBudget(null);
      } catch (error: any) {
        toast({
          title: "Erro",
          description: error.message || "Erro ao excluir orçamento",
          variant: "destructive",
        });
      }
    }
  };

  const calculateProgress = (category_id: string, amount: number) => {
    const spent = expenses[category_id] || 0;
    return Math.min(Math.round((spent / amount) * 100), 100);
  };

  const getStatusColor = (progress: number) => {
    if (progress >= 100) return "bg-red-500";
    if (progress >= 75) return "bg-orange-400";
    return "bg-green-500";
  };

  const getCategoryName = (category_id: string) => {
    const category = categories.find(cat => cat.id === category_id);
    return category?.name || "Categoria Desconhecida";
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <p>Carregando orçamentos...</p>
        </div>
      </div>
    );
  }

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
            const progress = calculateProgress(budget.category_id, budget.amount);
            const statusColor = getStatusColor(progress);
            const categoryName = getCategoryName(budget.category_id);
            const spent = expenses[budget.category_id] || 0;
            
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
            userId=""
            onSubmit={handleSaveBudget}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
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
