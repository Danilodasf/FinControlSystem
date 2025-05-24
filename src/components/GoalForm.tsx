
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Goal } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, { message: 'O título é obrigatório' }),
  target_amount: z.coerce.number().positive({ message: 'O valor alvo deve ser positivo' }),
  current_amount: z.coerce.number().min(0, { message: 'O valor atual não pode ser negativo' }).default(0),
  target_date: z.date({
    required_error: "A data alvo é obrigatória.",
    invalid_type_error: "Data em formato inválido.",
  }).min(new Date(), { message: "A data deve ser futura." }),
  user_id: z.string(),
});

interface GoalFormProps {
  userId: string;
  initialData?: Goal;
  onSubmit: (data: Partial<Goal>) => void;
  onCancel: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ 
  userId, 
  initialData, 
  onSubmit, 
  onCancel 
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      target_date: new Date(initialData.target_date)
    } : {
      title: '',
      target_amount: 0,
      current_amount: 0,
      target_date: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      user_id: userId,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const submitData = {
      ...values,
      target_date: values.target_date.toISOString().split('T')[0], // Convert to string format
    };
    onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do objetivo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Viagem para a praia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="target_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor alvo (R$)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00" 
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value === '' ? '0' : e.target.value;
                    field.onChange(parseFloat(value));
                  }}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="current_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor atual (R$)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00" 
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value === '' ? '0' : e.target.value;
                    field.onChange(parseFloat(value));
                  }}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="target_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data alvo</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={`w-full pl-3 text-left font-normal ${
                        !field.value && "text-muted-foreground"
                      }`}
                    >
                      {field.value ? (
                        format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {initialData ? 'Atualizar' : 'Criar'} Objetivo
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GoalForm;
