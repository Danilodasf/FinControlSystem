
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Transaction } from '@/types';
import { useTransactions } from '@/hooks/useTransactions';
import { toast } from '@/hooks/use-toast';

interface DeleteTransactionDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

const DeleteTransactionDialog: React.FC<DeleteTransactionDialogProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const { deleteTransaction, isDeleting } = useTransactions();

  const handleDelete = () => {
    if (!transaction) return;

    deleteTransaction(transaction.id, {
      onSuccess: () => {
        onClose();
        toast({
          title: "Sucesso",
          description: "Lançamento excluído com sucesso.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Erro",
          description: error.message || "Não foi possível excluir o lançamento.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Confirmar Exclusão</span>
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        
        {transaction && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900">{transaction.title}</h4>
            <p className="text-sm text-gray-600">
              {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(transaction.date).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}

        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            className="flex-1" 
            disabled={isDeleting}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTransactionDialog;
