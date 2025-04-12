/*
  # Create tables for user authentication and saved passwords

  1. New Tables
    - `saved_passwords`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `account_name` (text)
      - `password` (text)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS on `saved_passwords` table
    - Add policies for authenticated users to manage their own passwords
*/

CREATE TABLE IF NOT EXISTS saved_passwords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  account_name text NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_passwords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own passwords"
  ON saved_passwords
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);