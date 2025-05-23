
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Account } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useAccounts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: ['accounts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Account[];
    },
    enabled: !!user,
  });

  const createAccount = useMutation({
    mutationFn: async (newAccount: { name: string; type: string; balance: number }) => {
      if (!user) throw new Error('User not authenticated');

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

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Account> & { id: string }) => {
      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  return {
    accounts,
    isLoading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
  };
};
