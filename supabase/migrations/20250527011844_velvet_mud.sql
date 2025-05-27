/*
  # Add transfers and bills tables

  1. New Tables
    - `transfers`
      - `id` (uuid, primary key)
      - `source_account_id` (uuid, references accounts)
      - `destination_account_id` (uuid, references accounts)
      - `amount` (numeric(12,2))
      - `description` (text, nullable)
      - `date` (date)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamptz)

    - `bills`
      - `id` (uuid, primary key)
      - `type` (text, either 'payable' or 'receivable')
      - `description` (text)
      - `category_id` (uuid, references categories)
      - `amount` (numeric(12,2))
      - `due_date` (date)
      - `status` (text)
      - `is_recurring` (boolean)
      - `attachment_url` (text, nullable)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create transfers table
CREATE TABLE IF NOT EXISTS transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  destination_account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  description text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('payable', 'receivable')),
  description text NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  due_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'paid', 'received', 'late')) DEFAULT 'pending',
  is_recurring boolean NOT NULL DEFAULT false,
  attachment_url text,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Transfers policies
CREATE POLICY "Users can create their own transfers"
  ON transfers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own transfers"
  ON transfers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own transfers"
  ON transfers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transfers"
  ON transfers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Bills policies
CREATE POLICY "Users can create their own bills"
  ON bills
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own bills"
  ON bills
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own bills"
  ON bills
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bills"
  ON bills
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);