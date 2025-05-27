import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Bill {
  id: string;
  type: 'payable' | 'receivable';
  description: string;
  category_id: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'received' | 'late';
  is_recurring: boolean;
  attachment_url?: string;
  user_id: string;
  created_at: string;
}

export const useBills = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['bills', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;

      // Update status of late bills
      const today = new Date();
      const updatedBills = data.map(bill => {
        if (bill.status === 'pending' && new Date(bill.due_date) < today) {
          return { ...bill, status: 'late' };
        }
        return bill;
      });

      // Update late status in database
      const lateBills = updatedBills.filter(bill => 
        bill.status === 'late' && data.find(d => d.id === bill.id)?.status === 'pending'
      );

      if (lateBills.length > 0) {
        await Promise.all(lateBills.map(bill =>
          supabase
            .from('bills')
            .update({ status: 'late' })
            .eq('id', bill.id)
        ));
      }

      return updatedBills as Bill[];
    },
    enabled: !!user,
  });

  const createBill = useMutation({
    mutationFn: async (bill: Omit<Bill, 'id' | 'created_at' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bills')
        .insert([{ ...bill, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });

  const updateBill = useMutation({
    mutationFn: async (bill: Partial<Bill> & { id: string }) => {
      const { data, error } = await supabase
        .from('bills')
        .update(bill)
        .eq('id', bill.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });

  const deleteBill = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });

  const uploadAttachment = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('bill-attachments')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('bill-attachments')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  return {
    bills,
    isLoading,
    createBill,
    updateBill,
    deleteBill,
    uploadAttachment,
  };
};