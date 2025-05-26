# FinControl

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/seu-usuario/seu-repo/actions) [![Coverage Status](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://github.com/seu-usuario/seu-repo) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Sumário
- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#-stack-tecnológica)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Modelo de Dados Principal](#-modelo-de-dados-principal)
- [Navegação e Rotas](#navegação-e-rotas)
- [Autenticação e Contexto Global](#autenticação-e-contexto-global)
- [Hooks Customizados](#hooks-customizados)
- [Integração com Supabase](#-integração-com-supabase)
- [Estilo e Responsividade](#-estilo-e-responsividade)
- [Instalação e Configuração](#instalação-e-configuração)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Testes](#testes)
- [Contribuição](#contribuição)
- [Contato](#contato)
- [Documentação Adicional](#documentação-adicional)

---

## Visão Geral

O **FinControl** é um sistema de controle financeiro pessoal, projetado com foco em **escalabilidade**, **manutenibilidade** e **experiência do usuário**. Ele oferece uma interface moderna e responsiva, com recursos completos para gerenciamento financeiro.

Tecnologias principais: **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **shadcn-ui** e **Supabase** para autenticação e banco de dados.

---

## 🧱 Stack Tecnológica

- **Frontend:** React + TypeScript  
- **Build Tool:** Vite  
- **Estilização:** Tailwind CSS, shadcn-ui  
- **Gerenciamento de Estado:** React Context, React Query  
- **Backend as a Service:** Supabase (autenticação e banco de dados)  
- **Roteamento:** React Router DOM  

---

## 📁 Estrutura de Pastas

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

## 📦 Modelo de Dados Principal

```ts
// src/types/index.ts
export interface Account { /* ... */ }
export interface Category { /* ... */ }
export interface Transaction { /* ... */ }
export interface Budget { /* ... */ }
export interface Goal { /* ... */ }
export interface Profile { /* ... */ }
```

---

## Navegação e Rotas

As rotas são gerenciadas via React Router DOM, com uma Sidebar para navegação principal:

| Rota           | Página                  |
|----------------|-------------------------|
| `/`            | Dashboard               |
| `/transactions`| Lançamentos             |
| `/accounts`    | Contas bancárias        |
| `/categories`  | Categorias de transações|
| `/budgets`     | Orçamentos              |
| `/goals`       | Objetivos financeiros   |
| `/reports`     | Relatórios              |
| `/settings`    | Configurações           |

Usuários não autenticados são redirecionados para o login/registro.

---

## Autenticação e Contexto Global
A autenticação é gerenciada pelo Supabase e encapsulada via AuthContext, que fornece:
- `user`: dados do usuário autenticado
- `login(email, senha)`
- `register(email, senha, nome)`
- `logout()`
- `isLoading`: status de carregamento

---

## Hooks Customizados
Em `src/hooks/`, os hooks encapsulam acesso a dados e lógica de estado usando React Query:
- `useTransactions`, `useAccounts`, `useCategories`, `useBudgets`, `useGoals`, `useProfile`

---

## 🔌 Integração com Supabase
- Cliente Supabase inicializado em `src/integrations/supabase/client.ts`
- Utilizado para autenticação, persistência de dados e queries escopadas por usuário
- Tipagem forte com integração TypeScript

---

## 📱 Estilo e Responsividade
- Layouts responsivos com Tailwind CSS
- Sidebar fixa, uso extensivo de cards, modais e feedback visual

---

## Instalação e Configuração

1. **Clone o repositório:**
   ```sh
   git clone https://github.com/seu-usuario/seu-repo.git
   cd finflow-personal-balance
   ```
2. **Instale as dependências:**
   ```sh
   npm install
   ```
3. **Configuração de ambiente:**
   - Crie um arquivo `.env` na raiz do projeto com as variáveis necessárias para o Supabase:
     ```env
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - Consulte a [documentação do Supabase](https://supabase.com/docs/guides/with-react) para detalhes.

---

## Scripts Disponíveis

- `npm run dev` – Inicia o ambiente de desenvolvimento
- `npm run build` – Gera a build de produção
- `npm run build:dev` – Build em modo desenvolvimento
- `npm run preview` – Visualiza a build de produção localmente
- `npm run lint` – Executa o linter

---

## Testes

> **Ainda não há testes automatizados implementados.**
>
> Sinta-se à vontade para contribuir adicionando testes!

---
