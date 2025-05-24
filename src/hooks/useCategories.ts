
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useCategories = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user?.id,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: Omit<Category, 'id' | 'created_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          ...categoryData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.id] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (category: Category) => {
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          color: category.color,
          icon: category.icon,
        })
        .eq('id', category.id)
        .eq('user_id', category.user_id)
        .select()
        .single();

      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.id] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.id] });
    },
  });

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    createCategory: createCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    deleteCategory: deleteCategoryMutation.mutate,
    isCreating: createCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
  };
};
