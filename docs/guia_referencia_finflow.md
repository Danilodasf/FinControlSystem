# Guia de Referência – FinControl

## Visão Geral

O **FinControl** é um sistema de controle financeiro pessoal, desenvolvido com foco em escalabilidade, manutenibilidade e experiência do usuário. O projeto utiliza React, TypeScript, Vite, Tailwind CSS e shadcn-ui, além de integração com Supabase para autenticação e persistência de dados.

---

## Stack Tecnológica

- **Frontend:** React + TypeScript
- **Build:** Vite
- **Estilização:** Tailwind CSS, shadcn-ui
- **Gerenciamento de estado:** React Context, React Query
- **Backend as a Service:** Supabase (auth, banco de dados)
- **Roteamento:** React Router DOM

---

## Estrutura de Pastas

```
├── src/
│   ├── components/         # Componentes de página e UI
│   │   └── ui/             # Componentes reutilizáveis (botão, input, etc.)
│   ├── contexts/           # Contextos globais (ex: autenticação)
│   ├── hooks/              # Hooks customizados (ex: useTransactions)
│   ├── integrations/       # Integrações externas (ex: Supabase)
│   ├── lib/                # Funções utilitárias
│   ├── pages/              # Páginas principais (Index, NotFound)
│   ├── types/              # Tipos globais e modelos de dados
│   └── index.css           # Estilos globais
├── public/                 # Assets públicos
├── docs/                   # Documentação
├── package.json            # Dependências e scripts
├── tailwind.config.ts      # Configuração do Tailwind
├── vite.config.ts          # Configuração do Vite
└── README.md               # Guia rápido do projeto
```

---

## Modelo de Dados Principal

```ts
// src/types/index.ts
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
```

---

## Navegação e Rotas

A navegação é feita via **Sidebar** e React Router DOM. As principais rotas são:

- `/` – Dashboard
- `/transactions` – Lançamentos (receitas e despesas)
- `/accounts` – Contas bancárias
- `/categories` – Categorias de transações
- `/budgets` – Orçamentos
- `/goals` – Objetivos financeiros
- `/reports` – Relatórios
- `/settings` – Configurações

O layout principal exige autenticação. Usuários não autenticados veem o formulário de login/registro.

---

## Autenticação e Contexto Global

A autenticação é feita via Supabase, com um contexto global (`AuthContext`) que expõe:
- `user`: usuário autenticado
- `login(email, senha)`
- `register(email, senha, nome)`
- `logout()`
- `isLoading`: status de carregamento

O contexto é consumido em todo o app para proteger rotas e exibir informações do usuário.

---

## Design System e UI

O projeto utiliza **shadcn-ui** e **Tailwind CSS** para garantir consistência visual e responsividade. Os principais componentes de UI estão em `src/components/ui/`:

- **Button**: Botão com variantes (`default`, `outline`, `destructive`, etc.)
- **Input, Select, Card, Dialog, Badge, Avatar, Table, Tabs, Toast, etc.**
- **Sidebar**: Navegação lateral fixa, com destaque para rota ativa e informações do usuário
- **Toaster**: Sistema de notificações

### Paleta de Cores

Definida via CSS custom properties no `index.css`, com suporte a tema claro/escuro.

---

## Padrão das Páginas

Cada página principal (ex: Lançamentos, Contas, Categorias) segue o padrão:
- Header com título e descrição
- Listagem dos itens (com filtros, busca, paginação)
- Formulário/modal para criação/edição
- Ações rápidas (editar, excluir, visualizar)
- Uso intensivo de componentes reutilizáveis de UI

---

## Hooks Customizados

Os hooks em `src/hooks/` encapsulam a lógica de acesso a dados e manipulação de estado:
- `useTransactions`, `useAccounts`, `useCategories`, `useBudgets`, `useGoals`, `useProfile`
- Utilizam React Query para cache, refetch e controle de loading

---

## Integração com Supabase

A integração é feita via `@supabase/supabase-js`:
- `src/integrations/supabase/client.ts` inicializa o client
- Autenticação, CRUD de dados e escopo por usuário
- Tipos customizados para integração forte com TypeScript

---

## Estilo e Responsividade

- Utilização extensiva de Tailwind CSS para responsividade e design moderno
- Layouts flexíveis, sidebar fixa, cards, modais e feedback visual
- Suporte a dark mode via classes utilitárias

---

## Instruções de Uso

### Instalação

```sh
npm install
```

### Desenvolvimento

```sh
npm run dev
```

### Deploy

- Via Lovable: acesse o painel e clique em Share > Publish
- Ou configure um deploy estático (ex: Vercel, Netlify)

---

## Boas Práticas e Padrões

- Componentização máxima e reutilização de UI
- Separação clara de responsabilidades (hooks, contextos, componentes)
- Tipagem forte com TypeScript
- Código limpo, organizado e fácil de manter
- Evite duplicação de lógica e componentes
- Arquivos grandes devem ser refatorados e divididos

---

## Contato e Suporte

Dúvidas ou sugestões? Consulte o README.md ou abra uma issue no repositório.
