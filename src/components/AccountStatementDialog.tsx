
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { Account } from '@/types';

interface AccountStatementDialogProps {
  account: Account;
  isOpen: boolean;
  onClose: () => void;
}

const AccountStatementDialog = ({ account, isOpen, onClose }: AccountStatementDialogProps) => {
  const { transactions, isLoading } = useTransactions();
  const { categories } = useCategories();

  // Filtrar transações da conta específica
  const accountTransactions = transactions.filter(
    transaction => transaction.account_id === account.id
  );

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "Sem categoria";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Extrato - {account.name}
          </DialogTitle>
          <DialogDescription>
            Histórico de transações da conta
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Saldo atual */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Saldo Atual</p>
                <p className={`text-2xl font-bold ${Number(account.balance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {Math.abs(Number(account.balance)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Lista de transações */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-4">Carregando transações...</div>
            ) : accountTransactions.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Nenhuma transação encontrada para esta conta.
              </div>
            ) : (
              accountTransactions.map((transaction) => (
                <Card key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <ArrowUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{transaction.title}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{getCategoryName(transaction.category_id)}</span>
                            <span>•</span>
                            <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                          {transaction.description && (
                            <p className="text-sm text-gray-600 mt-1">{transaction.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'} className="mt-1">
                          {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountStatementDialog;
