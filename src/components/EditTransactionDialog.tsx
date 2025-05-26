
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { Transaction } from '@/types';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useAccounts } from '@/hooks/useAccounts';
import { toast } from '@/hooks/use-toast';

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditTransactionDialog: React.FC<EditTransactionDialogProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState('');

  const { updateTransaction, isUpdating } = useTransactions();
  const { categories } = useCategories();
  const { accounts } = useAccounts();

  useEffect(() => {
    if (transaction) {
      setTitle(transaction.title);
      setAmount(transaction.amount.toString());
      setType(transaction.type);
      setCategoryId(transaction.category_id);
      setAccountId(transaction.account_id);
      setDate(transaction.date);
    }
  }, [transaction]);

  const getSelectedAccountBalance = () => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? Number(account.balance) : 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transaction || !title || !amount || !categoryId || !accountId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const updatedTransaction: Transaction = {
      ...transaction,
      title,
      amount: parseFloat(amount),
      type,
      category_id: categoryId,
      account_id: accountId,
      date,
    };

    updateTransaction(updatedTransaction, {
      onSuccess: () => {
        onClose();
        toast({
          title: "Sucesso",
          description: "Lançamento atualizado com sucesso.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Erro",
          description: error.message || "Não foi possível atualizar o lançamento.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Lançamento</DialogTitle>
          <DialogDescription>
            Altere os dados do lançamento
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            placeholder="Título do lançamento"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input 
            type="number" 
            placeholder="Valor"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            required
          />
          <Select value={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="expense">Despesa</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="Conta" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} - R$ {Number(account.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {type === 'expense' && accountId && (
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Saldo disponível: R$ {getSelectedAccountBalance().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <Input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <div className="flex space-x-2">
            <Button variant="outline" type="button" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isUpdating}>
              {isUpdating ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionDialog;
