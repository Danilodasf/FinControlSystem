
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Category } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import CategoryForm from '@/components/CategoryForm';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';

// Mock API functions
const getCategories = async (userId: string): Promise<Category[]> => {
  // In a real implementation, this would be an API call
  const savedCategories = localStorage.getItem(`fincontrol_categories_${userId}`);
  return savedCategories ? JSON.parse(savedCategories) : [];
};

const saveCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  const newCategory = {
    ...category,
    id: `cat_${Date.now()}`,
  };

  const user_id = category.user_id;
  const savedCategories = localStorage.getItem(`fincontrol_categories_${user_id}`);
  const categories = savedCategories ? JSON.parse(savedCategories) : [];
  
  categories.push(newCategory);
  localStorage.setItem(`fincontrol_categories_${user_id}`, JSON.stringify(categories));
  
  return newCategory;
};

const updateCategory = async (category: Category): Promise<Category> => {
  const user_id = category.user_id;
  const savedCategories = localStorage.getItem(`fincontrol_categories_${user_id}`);
  const categories = savedCategories ? JSON.parse(savedCategories) : [];
  
  const updatedCategories = categories.map((cat: Category) => 
    cat.id === category.id ? category : cat
  );
  
  localStorage.setItem(`fincontrol_categories_${user_id}`, JSON.stringify(updatedCategories));
  
  return category;
};

const deleteCategory = async (category: Category): Promise<void> => {
  const user_id = category.user_id;
  const savedCategories = localStorage.getItem(`fincontrol_categories_${user_id}`);
  const categories = savedCategories ? JSON.parse(savedCategories) : [];
  
  const filteredCategories = categories.filter((cat: Category) => cat.id !== category.id);
  
  localStorage.setItem(`fincontrol_categories_${user_id}`, JSON.stringify(filteredCategories));
};

const CategoriesPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: () => getCategories(user?.id || ''),
    enabled: !!user?.id,
  });

  const addCategoryMutation = useMutation({
    mutationFn: saveCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.id] });
      setIsAddSheetOpen(false);
      toast({
        title: "Categoria adicionada",
        description: "Categoria criada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a categoria.",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.id] });
      setIsEditSheetOpen(false);
      toast({
        title: "Categoria atualizada",
        description: "Categoria atualizada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a categoria.",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.id] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Categoria excluída",
        description: "Categoria excluída com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria.",
        variant: "destructive",
      });
    },
  });

  const handleAdd = () => {
    setIsAddSheetOpen(true);
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setIsEditSheetOpen(true);
  };

  const handleDelete = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleAddSubmit = (formData: Omit<Category, 'id'>) => {
    addCategoryMutation.mutate(formData);
  };

  const handleEditSubmit = (formData: Category) => {
    updateCategoryMutation.mutate(formData);
  };

  const confirmDelete = () => {
    if (currentCategory) {
      deleteCategoryMutation.mutate(currentCategory);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Categorias</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Categoria
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Nenhuma categoria cadastrada.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Ícone</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <div 
                        className="w-6 h-6 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                    </TableCell>
                    <TableCell>{category.icon}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Category Sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Adicionar Categoria</SheetTitle>
          </SheetHeader>
          <div className="py-6">
            <CategoryForm 
              userId={user?.id || ''}
              onSubmit={handleAddSubmit}
              onCancel={() => setIsAddSheetOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Category Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Editar Categoria</SheetTitle>
          </SheetHeader>
          <div className="py-6">
            {currentCategory && (
              <CategoryForm 
                userId={user?.id || ''}
                initialData={currentCategory}
                onSubmit={handleEditSubmit}
                onCancel={() => setIsEditSheetOpen(false)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Categoria"
        description="Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default CategoriesPage;
