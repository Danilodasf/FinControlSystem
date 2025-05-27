/*
  # Update profiles table to include avatar_url

  1. Changes
    - Add `avatar_url` column to profiles table
*/

-- Add avatar_url column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url text;