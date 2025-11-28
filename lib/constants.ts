import type { ExerciseInfo, ExerciseKey, Workout } from '@/types';

export const INITIAL_WEIGHTS: Record<ExerciseKey, number> = {
  deadlift: 175,
  rdl: 155,
  squat: 135,
  bench: 120,
  ohp: 75,
  row: 65,
  pullups: 0,
};

export const EXERCISE_INFO: Record<ExerciseKey, ExerciseInfo> = {
  deadlift: { rest: '3-4 min', warmupType: 'barbell' },
  rdl: { rest: '3-4 min', warmupType: 'barbell' },
  squat: { rest: '3-4 min', warmupType: 'barbell' },
  bench: { rest: '2-3 min', warmupType: 'barbell' },
  ohp: { rest: '2-3 min', warmupType: 'barbell' },
  row: { rest: '2-3 min', warmupType: 'barbell' },
  pullups: { rest: '2-3 min', warmupType: 'bodyweight' },
};

export const WORKOUTS: Record<string, Workout> = {
  A_HEAVY: {
    name: 'Workout A (Heavy Hinge)',
    exercises: [
      { name: 'Deadlift', key: 'deadlift', sets: '3×8' },
      { name: 'Overhead Press', key: 'ohp', sets: '3×8' },
      { name: 'Barbell Row', key: 'row', sets: '3×8' },
    ],
  },
  A_LIGHT: {
    name: 'Workout A (Light Hinge)',
    exercises: [
      { name: 'Romanian Deadlift', key: 'rdl', sets: '3×8' },
      { name: 'Overhead Press', key: 'ohp', sets: '3×8' },
      { name: 'Barbell Row', key: 'row', sets: '3×8' },
    ],
  },
  B: {
    name: 'Workout B',
    exercises: [
      { name: 'Back Squat', key: 'squat', sets: '3×8' },
      { name: 'Bench Press', key: 'bench', sets: '3×8' },
      { name: 'Pull-Ups', key: 'pullups', sets: '3×8' },
    ],
  },
};

export const EXERCISE_DISPLAY_NAMES: Record<ExerciseKey, string> = {
  deadlift: 'Deadlift',
  rdl: 'Romanian Deadlift',
  squat: 'Back Squat',
  bench: 'Bench Press',
  ohp: 'Overhead Press',
  row: 'Barbell Row',
  pullups: 'Pull-Ups',
};
