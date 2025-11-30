-- ============================================================================
-- WORKOUT TRACKER - ROW LEVEL SECURITY (RLS) SETUP
-- ============================================================================
-- Run this SQL in Supabase SQL Editor to enable Row Level Security
-- This ensures users can ONLY access their own workout data
-- ============================================================================

-- ============================================================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE workout_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE current_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_results ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. DROP EXISTING POLICIES (if any) TO AVOID CONFLICTS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own workout state" ON workout_state;
DROP POLICY IF EXISTS "Users can insert own workout state" ON workout_state;
DROP POLICY IF EXISTS "Users can update own workout state" ON workout_state;
DROP POLICY IF EXISTS "Users can delete own workout state" ON workout_state;

DROP POLICY IF EXISTS "Users can view own current weights" ON current_weights;
DROP POLICY IF EXISTS "Users can insert own current weights" ON current_weights;
DROP POLICY IF EXISTS "Users can update own current weights" ON current_weights;
DROP POLICY IF EXISTS "Users can delete own current weights" ON current_weights;

DROP POLICY IF EXISTS "Users can view own exercise stats" ON exercise_stats;
DROP POLICY IF EXISTS "Users can insert own exercise stats" ON exercise_stats;
DROP POLICY IF EXISTS "Users can update own exercise stats" ON exercise_stats;
DROP POLICY IF EXISTS "Users can delete own exercise stats" ON exercise_stats;

DROP POLICY IF EXISTS "Users can view own workout history" ON workout_history;
DROP POLICY IF EXISTS "Users can insert own workout history" ON workout_history;
DROP POLICY IF EXISTS "Users can update own workout history" ON workout_history;
DROP POLICY IF EXISTS "Users can delete own workout history" ON workout_history;

DROP POLICY IF EXISTS "Users can view own workout results" ON workout_results;
DROP POLICY IF EXISTS "Users can insert own workout results" ON workout_results;
DROP POLICY IF EXISTS "Users can update own workout results" ON workout_results;
DROP POLICY IF EXISTS "Users can delete own workout results" ON workout_results;

-- ============================================================================
-- 3. CREATE RLS POLICIES FOR WORKOUT_STATE
-- ============================================================================

CREATE POLICY "Users can view own workout state"
  ON workout_state
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout state"
  ON workout_state
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout state"
  ON workout_state
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout state"
  ON workout_state
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. CREATE RLS POLICIES FOR CURRENT_WEIGHTS
-- ============================================================================

CREATE POLICY "Users can view own current weights"
  ON current_weights
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own current weights"
  ON current_weights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own current weights"
  ON current_weights
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own current weights"
  ON current_weights
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. CREATE RLS POLICIES FOR EXERCISE_STATS
-- ============================================================================

CREATE POLICY "Users can view own exercise stats"
  ON exercise_stats
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise stats"
  ON exercise_stats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise stats"
  ON exercise_stats
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercise stats"
  ON exercise_stats
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. CREATE RLS POLICIES FOR WORKOUT_HISTORY
-- ============================================================================

CREATE POLICY "Users can view own workout history"
  ON workout_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout history"
  ON workout_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout history"
  ON workout_history
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout history"
  ON workout_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 7. CREATE RLS POLICIES FOR WORKOUT_RESULTS
-- ============================================================================
-- workout_results is a join table that references workout_history
-- We need to check that the workout belongs to the current user

CREATE POLICY "Users can view own workout results"
  ON workout_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_history
      WHERE workout_history.id = workout_results.workout_id
      AND workout_history.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own workout results"
  ON workout_results
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_history
      WHERE workout_history.id = workout_results.workout_id
      AND workout_history.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own workout results"
  ON workout_results
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_history
      WHERE workout_history.id = workout_results.workout_id
      AND workout_history.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_history
      WHERE workout_history.id = workout_results.workout_id
      AND workout_history.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own workout results"
  ON workout_results
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_history
      WHERE workout_history.id = workout_results.workout_id
      AND workout_history.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 8. VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify RLS is working correctly

-- Check that RLS is enabled on all tables
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'workout_state',
    'current_weights',
    'exercise_stats',
    'workout_history',
    'workout_results'
  )
ORDER BY tablename;

-- Expected result: rowsecurity = true for all tables

-- Check all policies are created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'workout_state',
    'current_weights',
    'exercise_stats',
    'workout_history',
    'workout_results'
  )
ORDER BY tablename, policyname;

-- Expected result: 4 policies per table (SELECT, INSERT, UPDATE, DELETE)
-- Should see 20 total policies (4 policies × 5 tables)

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================
-- 1. RLS is now enforced at the DATABASE level
-- 2. Even if application code is compromised, users cannot access other users' data
-- 3. auth.uid() returns the authenticated user's ID from Supabase Auth
-- 4. These policies work with your existing application code (no changes needed)
-- 5. Policies apply to ALL queries, including direct database access
-- 6. To test: Create two user accounts and verify each can only see their own data

-- ============================================================================
-- TESTING RLS
-- ============================================================================
-- After running this script, test with these steps:

-- 1. Sign up as User A and create some workout data
-- 2. Sign up as User B and create different workout data
-- 3. User A should only see their own workouts
-- 4. User B should only see their own workouts
-- 5. Try to query another user's data directly in SQL Editor - it should return empty

-- Example test query (run while authenticated as a user):
-- SELECT * FROM workout_state;
-- This should ONLY return the current user's state, not all users

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
-- If this script completes without errors, your RLS is properly configured!
-- Your app now has database-level security that cannot be bypassed.
-- ============================================================================
