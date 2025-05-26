
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
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
import SettingsPage from "@/components/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
              <SettingsPage />
            </Layout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
