
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

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async (transaction: Transaction) => {
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
      return data as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
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
