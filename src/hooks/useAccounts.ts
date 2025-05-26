import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Account } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useAccounts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['accounts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Buscando contas para o usuário:', user.id);
      
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar contas:', error);
        throw error;
      }
      
      console.log('Contas encontradas:', data);
      
      // Calcular saldo real baseado nas transações
      const accountsWithRealBalance = await Promise.all(
        data.map(async (account) => {
          const { data: transactions, error: transError } = await supabase
            .from('transactions')
            .select('amount, type')
            .eq('account_id', account.id)
            .eq('user_id', user.id);

          if (transError) {
            console.error('Erro ao buscar transações da conta:', transError);
            return account;
          }

          const calculatedBalance = transactions.reduce((total, transaction) => {
            return transaction.type === 'income' 
              ? total + Number(transaction.amount)
              : total - Number(transaction.amount);
          }, 0);

          console.log(`Conta ${account.name}: Saldo no DB: ${account.balance}, Saldo calculado: ${calculatedBalance}`);

          // Se o saldo calculado for diferente do saldo armazenado, atualizar
          if (Math.abs(calculatedBalance - Number(account.balance)) > 0.01) {
            console.log(`Atualizando saldo da conta ${account.name} de ${account.balance} para ${calculatedBalance}`);
            
            const { error: updateError } = await supabase
              .from('accounts')
              .update({ balance: calculatedBalance })
              .eq('id', account.id)
              .eq('user_id', user.id);

            if (updateError) {
              console.error('Erro ao atualizar saldo:', updateError);
            }

            return { ...account, balance: calculatedBalance };
          }

          return { ...account, balance: calculatedBalance };
        })
      );
      
      return accountsWithRealBalance as Account[];
    },
    enabled: !!user,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const createAccount = useMutation({
    mutationFn: async (newAccount: { name: string; type: string; balance: number }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Criando nova conta:', newAccount);

      const { data, error } = await supabase
        .from('accounts')
        .insert([
          {
            ...newAccount,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar conta:', error);
        throw error;
      }
      
      console.log('Conta criada:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Invalidando queries de contas...');
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
      refetch();
    },
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Account> & { id: string }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Atualizando conta:', id, updates);

      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar conta:', error);
        throw error;
      }
      
      console.log('Conta atualizada:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Invalidando queries de contas após atualização...');
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
      refetch();
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Deletando conta:', id);

      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao deletar conta:', error);
        throw error;
      }
      
      console.log('Conta deletada com sucesso');
    },
    onSuccess: () => {
      console.log('Invalidando queries de contas após deleção...');
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
      refetch();
    },
  });

  return {
    accounts,
    isLoading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    refetch,
  };
};
