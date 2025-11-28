import { supabase } from './supabase';
import type { AppState, ExerciseKey, WorkoutResult } from '@/types';
import { INITIAL_WEIGHTS } from './constants';

export async function loadWorkoutData(userId: string): Promise<Partial<AppState>> {
  try {
    // Load workout state
    const { data: stateData } = await supabase
      .from('workout_state')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Load current weights
    const { data: weightsData } = await supabase
      .from('current_weights')
      .select('*')
      .eq('user_id', userId);

    // Load exercise stats
    const { data: statsData } = await supabase
      .from('exercise_stats')
      .select('*')
      .eq('user_id', userId);

    // Load workout history
    const { data: historyData } = await supabase
      .from('workout_history')
      .select(`
        *,
        workout_results (
          exercise,
          success
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: true });

    const currentWeights: Record<ExerciseKey, number> = { ...INITIAL_WEIGHTS };
    if (weightsData) {
      weightsData.forEach((row) => {
        currentWeights[row.exercise as ExerciseKey] = row.weight;
      });
    }

    const consecutiveFailures: Record<ExerciseKey, number> = {};
    const lastSuccessfulWeights: Record<ExerciseKey, number> = { ...INITIAL_WEIGHTS };
    if (statsData) {
      statsData.forEach((row) => {
        consecutiveFailures[row.exercise as ExerciseKey] = row.consecutive_failures;
        if (row.last_successful_weight) {
          lastSuccessfulWeights[row.exercise as ExerciseKey] = row.last_successful_weight;
        }
      });
    }

    const workoutHistory: WorkoutResult[] = [];
    if (historyData) {
      historyData.forEach((workout) => {
        const results: Record<ExerciseKey, boolean> = {} as Record<ExerciseKey, boolean>;
        if (workout.workout_results) {
          (workout.workout_results as any[]).forEach((result) => {
            results[result.exercise as ExerciseKey] = result.success;
          });
        }

        workoutHistory.push({
          date: workout.date,
          type: workout.type,
          exercise: workout.exercise as ExerciseKey | undefined,
          oldWeight: workout.old_weight,
          newWeight: workout.new_weight,
          results,
          weekNumber: workout.week_number || 1,
        });
      });
    }

    return {
      sessionCount: stateData?.session_count || 0,
      weekNumber: stateData?.week_number || 1,
      isDeloadWeek: stateData?.is_deload_week || false,
      currentWeights,
      consecutiveFailures,
      lastSuccessfulWeights,
      workoutHistory,
    };
  } catch (error) {
    console.error('Error loading workout data:', error);
    return {};
  }
}

export async function saveWorkoutState(userId: string, state: AppState): Promise<void> {
  try {
    // Save workout state
    await supabase
      .from('workout_state')
      .upsert({
        user_id: userId,
        session_count: state.sessionCount,
        week_number: state.weekNumber,
        is_deload_week: state.isDeloadWeek,
      }, { onConflict: 'user_id' });

    // Save current weights
    for (const [exercise, weight] of Object.entries(state.currentWeights)) {
      await supabase
        .from('current_weights')
        .upsert({
          user_id: userId,
          exercise,
          weight,
        }, { onConflict: 'user_id,exercise' });
    }

    // Save exercise stats
    for (const exercise of Object.keys(state.currentWeights)) {
      await supabase
        .from('exercise_stats')
        .upsert({
          user_id: userId,
          exercise,
          consecutive_failures: state.consecutiveFailures[exercise as ExerciseKey] || 0,
          last_successful_weight: state.lastSuccessfulWeights[exercise as ExerciseKey] || INITIAL_WEIGHTS[exercise as ExerciseKey],
        }, { onConflict: 'user_id,exercise' });
    }
  } catch (error) {
    console.error('Error saving workout state:', error);
    throw error;
  }
}

export async function saveWorkoutHistory(userId: string, workout: WorkoutResult): Promise<void> {
  try {
    const { data: workoutData, error: workoutError } = await supabase
      .from('workout_history')
      .insert({
        user_id: userId,
        date: workout.date,
        type: workout.type,
        exercise: workout.exercise,
        old_weight: workout.oldWeight,
        new_weight: workout.newWeight,
        week_number: workout.weekNumber,
      })
      .select()
      .single();

    if (workoutError) throw workoutError;

    // Insert workout results if not a weight override
    if (workout.type !== 'WEIGHT_OVERRIDE' && Object.keys(workout.results).length > 0) {
      const results = Object.entries(workout.results).map(([exercise, success]) => ({
        workout_id: workoutData.id,
        exercise,
        success,
      }));

      const { error: resultsError } = await supabase
        .from('workout_results')
        .insert(results);

      if (resultsError) throw resultsError;
    }
  } catch (error) {
    console.error('Error saving workout history:', error);
    throw error;
  }
}
