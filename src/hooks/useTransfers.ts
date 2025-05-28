import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Transfer {
  id: string;
  source_account_id: string;
  destination_account_id: string;
  amount: number;
  description?: string;
  date: string;
  user_id: string;
  created_at: string;
}

export const useTransfers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ['transfers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Transfer[];
    },
    enabled: !!user,
  });

  const createTransfer = useMutation({
    mutationFn: async (transfer: Omit<Transfer, 'id' | 'created_at' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');

      // Get source account balance
      const { data: sourceAccount, error: sourceError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', transfer.source_account_id)
        .single();

      if (sourceError) throw sourceError;
      if (sourceAccount.balance < transfer.amount) {
        throw new Error('Saldo insuficiente na conta de origem');
      }

      // Get destination account
      const { data: destAccount, error: destError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', transfer.destination_account_id)
        .single();

      if (destError) throw destError;

      // Create transfer record
      const { data: newTransfer, error: transferError } = await supabase
        .from('transfers')
        .insert([{ ...transfer, user_id: user.id }])
        .select()
        .single();

      if (transferError) throw transferError;

      // Update source account balance
      const { error: sourceUpdateError } = await supabase
        .from('accounts')
        .update({ balance: sourceAccount.balance - transfer.amount })
        .eq('id', transfer.source_account_id);

      if (sourceUpdateError) throw sourceUpdateError;

      // Update destination account balance
      const { error: destUpdateError } = await supabase
        .from('accounts')
        .update({ balance: destAccount.balance + transfer.amount })
        .eq('id', transfer.destination_account_id);

      if (destUpdateError) throw destUpdateError;

      return newTransfer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  return {
    transfers,
    isLoading,
    createTransfer,
  };
};