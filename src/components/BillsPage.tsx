import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Check, X, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface Bill {
  id: string;
  type: 'payable' | 'receivable';
  description: string;
  category_id: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'received' | 'late';
  is_recurring: boolean;
  attachment_url?: string;
}

const BillsPage = () => {
  const { categories } = useCategories();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'payable' | 'receivable'>('payable');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);

  // Form states
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [status, setStatus] = useState<Bill['status']>('pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !categoryId || !amount || !dueDate) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const newBill: Bill = {
      id: currentBill?.id || Math.random().toString(36).substr(2, 9),
      type: activeTab,
      description,
      category_id: categoryId,
      amount: parseFloat(amount),
      due_date: dueDate,
      status,
      is_recurring: isRecurring,
    };

    if (currentBill) {
      setBills(bills.map(bill => bill.id === currentBill.id ? newBill : bill));
      toast({
        title: "Sucesso",
        description: "Conta atualizada com sucesso",
      });
    } else {
      setBills([...bills, newBill]);
      toast({
        title: "Sucesso",
        description: "Conta cadastrada com sucesso",
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setDescription('');
    setCategoryId('');
    setAmount('');
    setDueDate('');
    setIsRecurring(false);
    setStatus('pending');
    setCurrentBill(null);
  };

  const handleEdit = (bill: Bill) => {
    setCurrentBill(bill);
    setDescription(bill.description);
    setCategoryId(bill.category_id);
    setAmount(bill.amount.toString());
    setDueDate(bill.due_date);
    setIsRecurring(bill.is_recurring);
    setStatus(bill.status);
    setIsDialogOpen(true);
  };

  const handleDelete = (billId: string) => {
    setBills(bills.filter(bill => bill.id !== billId));
    toast({
      title: "Sucesso",
      description: "Conta excluída com sucesso",
    });
  };

  const handleStatusChange = (billId: string, newStatus: Bill['status']) => {
    setBills(bills.map(bill => {
      if (bill.id === billId) {
        return { ...bill, status: newStatus };
      }
      return bill;
    }));

    toast({
      title: "Sucesso",
      description: "Status atualizado com sucesso",
    });
  };

  const getStatusColor = (status: Bill['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'paid':
      case 'received':
        return 'bg-green-500';
      case 'late':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredBills = bills.filter(bill => bill.type === activeTab);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contas</h1>
          <p className="text-muted-foreground">
            Gerencie suas contas a pagar e receber
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value: 'payable' | 'receivable') => setActiveTab(value)}>
        <TabsList>
          <TabsTrigger value="payable">A Pagar</TabsTrigger>
          <TabsTrigger value="receivable">A Receber</TabsTrigger>
        </TabsList>

        <TabsContent value="payable">
          <Card>
            <CardHeader>
              <CardTitle>Contas a Pagar</CardTitle>
              <CardDescription>
                Gerencie suas contas e pagamentos pendentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBills.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  Nenhuma conta a pagar cadastrada
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBills.map((bill) => (
                    <Card key={bill.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{bill.description}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>
                                {categories.find(cat => cat.id === bill.category_id)?.name}
                              </span>
                              <span>•</span>
                              <span>
                                Vencimento: {new Date(bill.due_date).toLocaleDateString('pt-BR')}
                              </span>
                              {bill.is_recurring && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Recorrente
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-semibold">
                                R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                              <Badge variant="secondary" className={getStatusColor(bill.status)}>
                                {bill.status === 'pending' && 'Pendente'}
                                {bill.status === 'paid' && 'Pago'}
                                {bill.status === 'late' && 'Atrasado'}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              {bill.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleStatusChange(bill.id, 'paid')}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEdit(bill)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(bill.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receivable">
          <Card>
            <CardHeader>
              <CardTitle>Contas a Receber</CardTitle>
              <CardDescription>
                Gerencie seus recebimentos pendentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBills.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  Nenhuma conta a receber cadastrada
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBills.map((bill) => (
                    <Card key={bill.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{bill.description}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>
                                {categories.find(cat => cat.id === bill.category_id)?.name}
                              </span>
                              <span>•</span>
                              <span>
                                Vencimento: {new Date(bill.due_date).toLocaleDateString('pt-BR')}
                              </span>
                              {bill.is_recurring && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Recorrente
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-semibold">
                                R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                              <Badge variant="secondary" className={getStatusColor(bill.status)}>
                                {bill.status === 'pending' && 'Pendente'}
                                {bill.status === 'received' && 'Recebido'}
                                {bill.status === 'late' && 'Atrasado'}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              {bill.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleStatusChange(bill.id, 'received')}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEdit(bill)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(bill.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentBill ? 'Editar Conta' : 'Nova Conta'}
            </DialogTitle>
            <DialogDescription>
              {currentBill 
                ? 'Edite os dados da conta' 
                : `Cadastre uma nova conta ${activeTab === 'payable' ? 'a pagar' : 'a receber'}`
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Input
                placeholder="Descrição da conta"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <label className="text-sm font-medium">Data de Vencimento</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
              <label htmlFor="recurring" className="text-sm font-medium">
                Conta Recorrente
              </label>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {currentBill ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillsPage;