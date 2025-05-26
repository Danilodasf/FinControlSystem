import React, { useState } from 'react';
import { Plus, Edit, Trash2, Lightbulb } from 'lucide-react';
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
import { useCategories } from '@/hooks/useCategories';

// Exemplos de categorias pré-definidas
const categoryExamples = [
  { name: 'Alimentação', color: '#f59e0b', icon: '🍽️' },
  { name: 'Transporte', color: '#3b82f6', icon: '🚗' },
  { name: 'Saúde', color: '#ef4444', icon: '🏥' },
  { name: 'Educação', color: '#8b5cf6', icon: '📚' },
  { name: 'Lazer', color: '#06b6d4', icon: '🎮' },
  { name: 'Casa', color: '#84cc16', icon: '🏠' },
  { name: 'Roupas', color: '#ec4899', icon: '👕' },
  { name: 'Tecnologia', color: '#6366f1', icon: '💻' },
  { name: 'Pets', color: '#f97316', icon: '🐕' },
  { name: 'Viagem', color: '#14b8a6', icon: '✈️' },
  { name: 'Salário', color: '#22c55e', icon: '💰' },
  { name: 'Freelance', color: '#a855f7', icon: '💼' },
  { name: 'Investimentos', color: '#0ea5e9', icon: '📈' },
  { name: 'Presente', color: '#f43f5e', icon: '🎁' },
  { name: 'Outros', color: '#6b7280', icon: '📂' }
];

const CategoriesPage: React.FC = () => {
  const { user } = useAuth();
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [showExamples, setShowExamples] = useState(false);

  const {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting
  } = useCategories();

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

  const handleAddExample = (example: typeof categoryExamples[0]) => {
    if (!user?.id) return;
    
    createCategory({
      name: example.name,
      color: example.color,
      icon: example.icon,
      user_id: user.id,
      created_at: new Date().toISOString()
    }, {
      onSuccess: () => {
        toast({
          title: "Categoria adicionada",
          description: `Categoria "${example.name}" criada com sucesso.`,
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
  };

  const handleAddSubmit = (formData: Omit<Category, 'id'>) => {
    createCategory(formData, {
      onSuccess: () => {
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
  };

  const handleEditSubmit = (formData: Category) => {
    updateCategory(formData, {
      onSuccess: () => {
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
  };

  const confirmDelete = () => {
    if (currentCategory) {
      deleteCategory(currentCategory.id, {
        onSuccess: () => {
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
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Categorias</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center"
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            {showExamples ? 'Ocultar' : 'Ver'} Exemplos
          </Button>
          <Button onClick={handleAdd} disabled={isCreating}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Categoria
          </Button>
        </div>
      </div>

      {/* Exemplos de categorias */}
      {showExamples && (
        <Card>
          <CardHeader>
            <CardTitle>Exemplos de Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {categoryExamples.map((example, index) => {
                const categoryExists = categories.some(cat => 
                  cat.name.toLowerCase() === example.name.toLowerCase()
                );
                
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-start space-x-2 h-auto p-3"
                    onClick={() => handleAddExample(example)}
                    disabled={categoryExists || isCreating}
                  >
                    <span style={{ color: example.color }}>{example.icon}</span>
                    <span className="text-xs">{example.name}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de categorias existente */}
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
                        disabled={isUpdating}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(category)}
                        disabled={isDeleting}
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
