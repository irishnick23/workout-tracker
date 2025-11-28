export type ExerciseKey = 'deadlift' | 'rdl' | 'squat' | 'bench' | 'ohp' | 'row' | 'pullups';

export type WorkoutType = 'A_HEAVY' | 'A_LIGHT' | 'B' | 'WEIGHT_OVERRIDE';

export interface ExerciseInfo {
  rest: string;
  warmupType: 'barbell' | 'bodyweight';
}

export interface Exercise {
  name: string;
  key: ExerciseKey;
  sets: string;
}

export interface Workout {
  name: string;
  exercises: Exercise[];
}

export interface WorkoutResult {
  date: string;
  type: WorkoutType;
  results: Record<ExerciseKey, boolean>;
  weekNumber: number;
  exercise?: ExerciseKey;
  oldWeight?: number;
  newWeight?: number;
}

export interface AppState {
  currentWeights: Record<ExerciseKey, number>;
  workoutHistory: WorkoutResult[];
  currentWorkout: Workout | null;
  workoutResults: Record<ExerciseKey, boolean>;
  sessionCount: number;
  weekNumber: number;
  weeklyResults: Record<ExerciseKey, boolean[]>;
  consecutiveFailures: Record<ExerciseKey, number>;
  isDeloadWeek: boolean;
  lastSuccessfulWeights: Record<ExerciseKey, number>;
}

export interface WorkoutState {
  id?: string;
  user_id: string;
  session_count: number;
  week_number: number;
  is_deload_week: boolean;
}

export interface CurrentWeight {
  id?: string;
  user_id: string;
  exercise: ExerciseKey;
  weight: number;
}

export interface WorkoutHistory {
  id?: string;
  user_id: string;
  date: string;
  type: WorkoutType;
  exercise?: ExerciseKey;
  old_weight?: number;
  new_weight?: number;
  week_number?: number;
}

export interface WorkoutResultDB {
  id?: string;
  workout_id: string;
  exercise: ExerciseKey;
  success: boolean;
}

export interface ExerciseStats {
  id?: string;
  user_id: string;
  exercise: ExerciseKey;
  consecutive_failures: number;
  last_successful_weight?: number;
}
