
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccounts } from '@/hooks/useAccounts';
import { useToast } from '@/hooks/use-toast';
import { Account } from '@/types';

interface EditAccountDialogProps {
  account: Account;
  isOpen: boolean;
  onClose: () => void;
}

const EditAccountDialog = ({ account, isOpen, onClose }: EditAccountDialogProps) => {
  const [name, setName] = useState(account.name);
  const [type, setType] = useState(account.type);
  const [balance, setBalance] = useState(account.balance.toString());
  
  const { updateAccount } = useAccounts();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !type || !balance) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateAccount.mutateAsync({
        id: account.id,
        name,
        type: type as Account['type'],
        balance: parseFloat(balance),
      });

      toast({
        title: "Conta atualizada",
        description: "As informações da conta foram atualizadas com sucesso!",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar conta",
        variant: "destructive",
      });
    }
  };

  const handleTypeChange = (value: string) => {
    setType(value as Account['type']);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Conta</DialogTitle>
          <DialogDescription>
            Atualize as informações da sua conta
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            placeholder="Nome da conta" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="checking">Conta Corrente</SelectItem>
              <SelectItem value="savings">Poupança</SelectItem>
              <SelectItem value="wallet">Carteira</SelectItem>
              <SelectItem value="investment">Investimento</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            type="number" 
            placeholder="Saldo" 
            step="0.01"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            required
          />
          <div className="flex space-x-2">
            <Button variant="outline" type="button" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={updateAccount.isPending}>
              {updateAccount.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAccountDialog;
