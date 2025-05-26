# FinControl

## Visão Geral

O **FinControl** é um sistema de controle financeiro pessoal, projetado com foco em **escalabilidade**, **manutenibilidade** e **experiência do usuário**. Ele oferece uma interface moderna e responsiva, com recursos completos para gerenciamento financeiro.

Tecnologias principais: **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **shadcn-ui** e **Supabase** para autenticação e banco de dados.

-----------------------------------------------------------------------

## 🧱 Stack Tecnológica

- **Frontend:** React + TypeScript  
- **Build Tool:** Vite  
- **Estilização:** Tailwind CSS, shadcn-ui  
- **Gerenciamento de Estado:** React Context, React Query  
- **Backend as a Service:** Supabase (autenticação e banco de dados)  
- **Roteamento:** React Router DOM  

-----------------------------------------------------------------------

## 📁 Estrutura de Pastas

├── src/
│ ├── components/ # Componentes de página e UI
│ │ └── ui/ # Componentes reutilizáveis (botão, input, etc.)
│ ├── contexts/ # Contextos globais (ex: autenticação)
│ ├── hooks/ # Hooks customizados (ex: useTransactions)
│ ├── integrations/ # Integrações externas (ex: Supabase)
│ ├── lib/ # Funções utilitárias
│ ├── pages/ # Páginas principais (Index, NotFound)
│ ├── types/ # Tipos globais e modelos de dados
│ └── index.css # Estilos globais
├── public/ # Assets públicos
├── docs/ # Documentação
├── package.json # Dependências e scripts
├── tailwind.config.ts # Configuração do Tailwind
├── vite.config.ts # Configuração do Vite
└── README.md # Guia rápido do projeto

-----------------------------------------------------------------------

## 📦 Modelo de Dados Principal

```ts
export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'wallet' | 'investment';
  balance: number;
  user_id: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  user_id: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string;
  account_id: string;
  date: string;
  description?: string;
  user_id: string;
  created_at: string;
}

export interface Budget {
  id: string;
  category_id: string;
  amount: number;
  period: 'monthly' | 'yearly';
  user_id: string;
  created_at: string;
}

export interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  user_id: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  created_at: string;
}
-----------------------------------------------------------------------
🌐 Navegação e Rotas

As rotas são gerenciadas via React Router DOM, com uma Sidebar para navegação principal.

Rota	         Página
/Dashboard
/transactions	Lançamentos
/accounts	    Contas bancárias
/categories	    Categorias de transações
/budgets	    Orçamentos
/goals	        Objetivos financeiros
/reports	    Relatórios
/settings	    Configurações
Usuários não autenticados são redirecionados para o login/registro.

-----------------------------------------------------------------------

🔐 Autenticação e Contexto Global
A autenticação é gerenciada pelo Supabase e encapsulada via AuthContext, que fornece:

user: dados do usuário autenticado

login(email, senha)

register(email, senha, nome)

logout()

isLoading: status de carregamento
-----------------------------------------------------------------------
⚓ Hooks Customizados
Em src/hooks/, os hooks encapsulam acesso a dados e lógica de estado usando React Query:

useTransactions, useAccounts, useCategories, useBudgets, useGoals, useProfile
-----------------------------------------------------------------------
🔌 Integração com Supabase
Cliente Supabase inicializado em src/integrations/supabase/client.ts

Utilizado para autenticação, persistência de dados e queries escopadas por usuário

Tipagem forte com integração TypeScript
-----------------------------------------------------------------------
📱 Estilo e Responsividade
Layouts responsivos com Tailwind CSS

Sidebar fixa, uso extensivo de cards, modais e feedback visual
-----------------------------------------------------------------------
Instalação:
use: npm install

Desenvolvimento:
use: npm run dev

Deploy:
Vercel