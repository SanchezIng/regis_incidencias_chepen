/*
  # Fix profiles RLS policies for login

  1. Changes
    - Fix SELECT policy to allow users to read their own profile even if deleted
    - This ensures login works correctly and loads user data
    
  2. Security
    - Users can still only see their own profile
    - Authority can see non-deleted profiles
*/

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Authority can view active profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Authority can view active profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'authority'
    ) AND is_deleted = false
  );

CREATE POLICY "Users can insert their profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
