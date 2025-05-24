
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useTransactions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user?.id,
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: Omit<Transaction, 'id' | 'created_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Buscar o saldo atual da conta antes de criar a transação
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', transactionData.account_id)
        .eq('user_id', user.id)
        .single();

      if (accountError) throw new Error('Conta não encontrada');

      const currentBalance = parseFloat(account.balance.toString());
      const transactionAmount = parseFloat(transactionData.amount.toString());

      // Validar se há saldo suficiente para despesas
      if (transactionData.type === 'expense' && transactionAmount > currentBalance) {
        throw new Error(`Saldo insuficiente. Saldo atual: R$ ${currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      }

      // Calcular novo saldo
      const newBalance = transactionData.type === 'income' 
        ? currentBalance + transactionAmount 
        : currentBalance - transactionAmount;

      // Criar a transação
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Atualizar o saldo da conta
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', transactionData.account_id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      return transaction as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async (transaction: Transaction) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Buscar a transação original
      const { data: originalTransaction, error: originalError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transaction.id)
        .eq('user_id', user.id)
        .single();

      if (originalError) throw originalError;

      // Buscar saldo atual da conta original
      const { data: originalAccount, error: originalAccountError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', originalTransaction.account_id)
        .single();

      if (originalAccountError) throw originalAccountError;

      // Reverter o efeito da transação original
      const currentBalance = parseFloat(originalAccount.balance.toString());
      const originalAmount = parseFloat(originalTransaction.amount.toString());
      
      const balanceAfterRevert = originalTransaction.type === 'income' 
        ? currentBalance - originalAmount 
        : currentBalance + originalAmount;

      // Validar novo saldo se for despesa
      const newAmount = parseFloat(transaction.amount.toString());
      if (transaction.type === 'expense' && newAmount > balanceAfterRevert) {
        throw new Error(`Saldo insuficiente. Saldo disponível: R$ ${balanceAfterRevert.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      }

      // Calcular saldo final
      const finalBalance = transaction.type === 'income' 
        ? balanceAfterRevert + newAmount 
        : balanceAfterRevert - newAmount;

      // Atualizar a transação
      const { data, error } = await supabase
        .from('transactions')
        .update({
          title: transaction.title,
          amount: transaction.amount,
          type: transaction.type,
          category_id: transaction.category_id,
          account_id: transaction.account_id,
          date: transaction.date,
          description: transaction.description,
        })
        .eq('id', transaction.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar saldo da conta original (revertendo)
      const { error: revertError } = await supabase
        .from('accounts')
        .update({ balance: balanceAfterRevert })
        .eq('id', originalTransaction.account_id);

      if (revertError) throw revertError;

      // Atualizar saldo da conta nova (aplicando nova transação)
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ balance: finalBalance })
        .eq('id', transaction.account_id);

      if (updateError) throw updateError;

      return data as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Buscar a transação antes de deletar
      const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Buscar saldo atual da conta
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', transaction.account_id)
        .single();

      if (accountError) throw accountError;

      // Calcular novo saldo (revertendo a transação)
      const currentBalance = parseFloat(account.balance.toString());
      const transactionAmount = parseFloat(transaction.amount.toString());
      const newBalance = transaction.type === 'income' 
        ? currentBalance - transactionAmount 
        : currentBalance + transactionAmount;

      // Deletar a transação
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualizar saldo da conta
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', transaction.account_id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
    },
  });

  return {
    transactions: transactionsQuery.data || [],
    isLoading: transactionsQuery.isLoading,
    error: transactionsQuery.error,
    createTransaction: createTransactionMutation.mutate,
    updateTransaction: updateTransactionMutation.mutate,
    deleteTransaction: deleteTransactionMutation.mutate,
    isCreating: createTransactionMutation.isPending,
    isUpdating: updateTransactionMutation.isPending,
    isDeleting: deleteTransactionMutation.isPending,
  };
};
