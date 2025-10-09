/*
  # Add authority view policy for profiles
  
  This migration allows authorities to view all user profiles.
  This is necessary for displaying reporter information in the incidents list.
  
  1. Changes
    - Add policy for authorities to view all profiles
  
  2. Security
    - Only authenticated users with 'authority' role can view all profiles
    - Regular users can still only view their own profile
*/

-- Add policy for authorities to view all profiles
CREATE POLICY "Authorities can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'authority'
    )
  );
