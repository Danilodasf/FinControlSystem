
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
      return data as Account[];
    },
    enabled: !!user,
    // Forçar refetch a cada 30 segundos para garantir dados atualizados
    refetchInterval: 30000,
    // Refetch quando a janela volta ao foco
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
      // Também force um refetch imediato
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
    refetch, // Exportar refetch para uso manual se necessário
  };
};
