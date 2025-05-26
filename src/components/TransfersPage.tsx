import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccounts } from '@/hooks/useAccounts';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight } from 'lucide-react';

const TransfersPage = () => {
  const { accounts, isLoading, updateAccount } = useAccounts();
  const { toast } = useToast();

  const [sourceAccountId, setSourceAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sourceAccountId || !destinationAccountId || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos corretamente",
        variant: "destructive",
      });
      return;
    }

    if (sourceAccountId === destinationAccountId) {
      toast({
        title: "Erro",
        description: "As contas de origem e destino devem ser diferentes",
        variant: "destructive",
      });
      return;
    }

    const sourceAccount = accounts.find(acc => acc.id === sourceAccountId);
    const destinationAccount = accounts.find(acc => acc.id === destinationAccountId);

    if (!sourceAccount || !destinationAccount) {
      toast({
        title: "Erro",
        description: "Conta não encontrada",
        variant: "destructive",
      });
      return;
    }

    const transferAmount = parseFloat(amount);

    if (transferAmount > sourceAccount.balance) {
      toast({
        title: "Erro",
        description: "Saldo insuficiente na conta de origem",
        variant: "destructive",
      });
      return;
    }

    setIsTransferring(true);

    try {
      // Atualizar conta de origem
      await updateAccount.mutateAsync({
        id: sourceAccountId,
        balance: sourceAccount.balance - transferAmount
      });

      // Atualizar conta de destino
      await updateAccount.mutateAsync({
        id: destinationAccountId,
        balance: destinationAccount.balance + transferAmount
      });

      toast({
        title: "Sucesso",
        description: "Transferência realizada com sucesso",
      });

      // Limpar formulário
      setSourceAccountId('');
      setDestinationAccountId('');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao realizar transferência",
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transferências</h1>
        <p className="text-muted-foreground">Transfira dinheiro entre suas contas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nova Transferência</CardTitle>
          <CardDescription>
            Preencha os dados para realizar uma transferência
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Conta de Origem</label>
                <Select value={sourceAccountId} onValueChange={setSourceAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta de origem" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} - R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Conta de Destino</label>
                <Select value={destinationAccountId} onValueChange={setDestinationAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta de destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem 
                        key={account.id} 
                        value={account.id}
                        disabled={account.id === sourceAccountId}
                      >
                        {account.name} - R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor</label>
                <Input
                  type="number"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Data</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição (opcional)</label>
              <Input
                placeholder="Descrição da transferência"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isTransferring}
            >
              {isTransferring ? (
                'Transferindo...'
              ) : (
                <>
                  Transferir
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransfersPage;