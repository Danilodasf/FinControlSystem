
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { Goal } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import GoalForm from './GoalForm';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const GoalsPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);

  useEffect(() => {
    if (user) {
      // Carregar objetivos do localStorage
      const storedGoals = localStorage.getItem(`goals_${user.id}`);
      if (storedGoals) {
        const parsedGoals = JSON.parse(storedGoals).map((goal: any) => ({
          ...goal,
          target_date: new Date(goal.target_date)
        }));
        setGoals(parsedGoals);
      }
    }
  }, [user]);

  const handleSaveGoal = (data: Partial<Goal>) => {
    if (user) {
      if (currentGoal?.id) {
        // Atualizar objetivo existente
        const updatedGoals = goals.map(goal => 
          goal.id === currentGoal.id ? { ...goal, ...data } as Goal : goal
        );
        setGoals(updatedGoals);
        localStorage.setItem(`goals_${user.id}`, JSON.stringify(updatedGoals));
        toast({
          title: "Objetivo atualizado",
          description: "O objetivo foi atualizado com sucesso."
        });
      } else {
        // Criar novo objetivo
        const newGoal: Goal = {
          id: Date.now().toString(),
          user_id: user.id,
          title: data.title!,
          target_amount: data.target_amount!,
          current_amount: data.current_amount || 0,
          target_date: data.target_date!,
          created_at: new Date().toISOString(),
        };
        
        const updatedGoals = [...goals, newGoal];
        setGoals(updatedGoals);
        localStorage.setItem(`goals_${user.id}`, JSON.stringify(updatedGoals));
        toast({
          title: "Objetivo criado",
          description: "O novo objetivo foi criado com sucesso."
        });
      }
      
      setIsFormOpen(false);
      setCurrentGoal(null);
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setCurrentGoal(goal);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (goal: Goal) => {
    setCurrentGoal(goal);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (user && currentGoal) {
      const updatedGoals = goals.filter(goal => goal.id !== currentGoal.id);
      setGoals(updatedGoals);
      localStorage.setItem(`goals_${user.id}`, JSON.stringify(updatedGoals));
      toast({
        title: "Objetivo excluído",
        description: "O objetivo foi excluído com sucesso."
      });
      setIsDeleteOpen(false);
      setCurrentGoal(null);
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getRemainingTime = (target_date: string | Date) => {
    const now = new Date();
    const targetDate = new Date(target_date);
    const remainingTime = targetDate.getTime() - now.getTime();
    const days = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
    
    if (days < 0) return "Prazo expirado";
    if (days === 0) return "Hoje é o prazo";
    if (days === 1) return "1 dia restante";
    return `${days} dias restantes`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Objetivos Financeiros</h1>
        <Button onClick={() => { setCurrentGoal(null); setIsFormOpen(true); }}>
          <PlusCircle className="mr-2" size={18} />
          Novo Objetivo
        </Button>
      </div>
      
      {goals.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">Você ainda não possui objetivos financeiros cadastrados.</p>
          <Button onClick={() => { setCurrentGoal(null); setIsFormOpen(true); }}>
            <PlusCircle className="mr-2" size={18} />
            Criar primeiro objetivo
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.current_amount, goal.target_amount);
            const remainingTime = getRemainingTime(goal.target_date);
            
            return (
              <Card key={goal.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{goal.title}</h3>
                      <p className="text-xs text-gray-500">
                        Meta até {format(new Date(goal.target_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditGoal(goal)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteClick(goal)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>R$ {goal.current_amount.toFixed(2)}</span>
                      <span>R$ {goal.target_amount.toFixed(2)}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter className="pt-0 pb-4 px-4 flex justify-between">
                  <span className="text-sm font-medium">{progress}% alcançado</span>
                  <span className="text-sm text-gray-500">{remainingTime}</span>
                </CardFooter>
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
              {currentGoal ? 'Editar Objetivo' : 'Novo Objetivo'}
            </DialogTitle>
          </DialogHeader>
          <GoalForm 
            initialData={currentGoal || undefined}
            userId={user?.id || ''}
            onSubmit={handleSaveGoal}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmação de exclusão */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Excluir objetivo"
        description="Tem certeza que deseja excluir este objetivo financeiro? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default GoalsPage;
