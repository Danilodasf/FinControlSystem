
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TransactionsPage from "@/components/TransactionsPage";
import AccountsPage from "@/components/AccountsPage";
import CategoriesPage from "@/components/CategoriesPage";
import BudgetsPage from "@/components/BudgetsPage";
import GoalsPage from "@/components/GoalsPage";
import ReportsPage from "@/components/ReportsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/transactions" element={
              <Layout>
                <TransactionsPage />
              </Layout>
            } />
            <Route path="/accounts" element={
              <Layout>
                <AccountsPage />
              </Layout>
            } />
            <Route path="/categories" element={
              <Layout>
                <CategoriesPage />
              </Layout>
            } />
            <Route path="/budgets" element={
              <Layout>
                <BudgetsPage />
              </Layout>
            } />
            <Route path="/goals" element={
              <Layout>
                <GoalsPage />
              </Layout>
            } />
            <Route path="/reports" element={
              <Layout>
                <ReportsPage />
              </Layout>
            } />
            <Route path="/settings" element={
              <Layout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold">Configurações</h1>
                  <p className="text-gray-600 mt-2">Em desenvolvimento...</p>
                </div>
              </Layout>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
