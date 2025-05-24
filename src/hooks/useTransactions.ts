
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

      // Iniciar uma transação do banco para garantir consistência
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Buscar o saldo atual da conta
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', transactionData.account_id)
        .eq('user_id', user.id)
        .single();

      if (accountError) throw accountError;

      // Calcular novo saldo baseado no tipo de transação
      const currentBalance = parseFloat(account.balance.toString());
      const transactionAmount = parseFloat(transactionData.amount.toString());
      const newBalance = transactionData.type === 'income' 
        ? currentBalance + transactionAmount 
        : currentBalance - transactionAmount;

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
      // Buscar a transação original para calcular a diferença
      const { data: originalTransaction, error: originalError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transaction.id)
        .eq('user_id', transaction.user_id)
        .single();

      if (originalError) throw originalError;

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
        .eq('user_id', transaction.user_id)
        .select()
        .single();

      if (error) throw error;

      // Reverter o efeito da transação original no saldo
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', originalTransaction.account_id)
        .single();

      if (accountError) throw accountError;

      const currentBalance = parseFloat(account.balance.toString());
      const originalAmount = parseFloat(originalTransaction.amount.toString());
      
      // Reverter transação original
      const balanceAfterRevert = originalTransaction.type === 'income' 
        ? currentBalance - originalAmount 
        : currentBalance + originalAmount;

      // Aplicar nova transação
      const newAmount = parseFloat(transaction.amount.toString());
      const finalBalance = transaction.type === 'income' 
        ? balanceAfterRevert + newAmount 
        : balanceAfterRevert - newAmount;

      // Atualizar saldo da conta
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

      // Buscar a transação antes de deletar para reverter o saldo
      const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Deletar a transação
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Buscar saldo atual da conta
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', transaction.account_id)
        .single();

      if (accountError) throw accountError;

      // Reverter o efeito da transação no saldo
      const currentBalance = parseFloat(account.balance.toString());
      const transactionAmount = parseFloat(transaction.amount.toString());
      const newBalance = transaction.type === 'income' 
        ? currentBalance - transactionAmount 
        : currentBalance + transactionAmount;

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
