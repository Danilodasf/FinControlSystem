
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User extends SupabaseUser {
  // Extending Supabase User type to maintain compatibility
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'wallet' | 'investment';
  balance: number;
  user_id: string;
  created_at: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  user_id: string;
  created_at: Date;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string;
  account_id: string;
  date: Date;
  description?: string;
  user_id: string;
  created_at: Date;
}

export interface Budget {
  id: string;
  category_id: string;
  amount: number;
  period: 'monthly' | 'yearly';
  user_id: string;
  created_at: Date;
}

export interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: Date;
  user_id: string;
  created_at: Date;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  created_at: Date;
}
