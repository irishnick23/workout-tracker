import { create } from 'zustand';
import type { AppState, ExerciseKey, WorkoutResult, WorkoutType } from '@/types';
import { INITIAL_WEIGHTS, WORKOUTS } from '@/lib/constants';

interface WorkoutStore extends AppState {
  initWorkout: () => void;
  recordResult: (exercise: ExerciseKey, success: boolean) => void;
  completeWorkout: () => Promise<void>;
  getCurrentWorkoutType: () => WorkoutType;
  getCurrentWeek: () => number;
  processWeeklyResults: () => void;
  calculateWarmupSets: (exercise: ExerciseKey, weight: number) => string[];
  overrideWeight: (exercise: ExerciseKey, newWeight: number) => Promise<void>;
  loadState: (state: Partial<AppState>) => void;
  reset: () => void;
}

const getInitialState = (): AppState => ({
  currentWeights: { ...INITIAL_WEIGHTS },
  workoutHistory: [],
  currentWorkout: null,
  workoutResults: {} as Record<ExerciseKey, boolean>,
  sessionCount: 0,
  weekNumber: 1,
  weeklyResults: {
    deadlift: [],
    rdl: [],
    squat: [],
    bench: [],
    ohp: [],
    row: [],
    pullups: [],
  },
  consecutiveFailures: {
    deadlift: 0,
    rdl: 0,
    squat: 0,
    bench: 0,
    ohp: 0,
    row: 0,
    pullups: 0,
  },
  isDeloadWeek: false,
  lastSuccessfulWeights: { ...INITIAL_WEIGHTS },
});

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  ...getInitialState(),

  getCurrentWorkoutType: (): WorkoutType => {
    const { sessionCount, isDeloadWeek } = get();
    const position = sessionCount % 4;

    if (isDeloadWeek && position === 0) {
      return 'A_LIGHT'; // Use RDL instead of deadlift during deload
    }

    switch (position) {
      case 0:
        return 'A_HEAVY';
      case 1:
        return 'B';
      case 2:
        return 'A_LIGHT';
      case 3:
        return 'B';
      default:
        return 'A_HEAVY';
    }
  },

  getCurrentWeek: () => {
    const { sessionCount } = get();
    return Math.floor(sessionCount / 4) + 1;
  },

  initWorkout: () => {
    const workoutType = get().getCurrentWorkoutType();
    const workout = WORKOUTS[workoutType];

    set({
      currentWorkout: workout,
      workoutResults: {} as Record<ExerciseKey, boolean>,
    });
  },

  recordResult: (exercise, success) => {
    set((state) => ({
      workoutResults: {
        ...state.workoutResults,
        [exercise]: success,
      },
    }));

    // Track in weekly results
    set((state) => ({
      weeklyResults: {
        ...state.weeklyResults,
        [exercise]: [...(state.weeklyResults[exercise] || []), success],
      },
    }));
  },

  completeWorkout: async () => {
    const state = get();
    const workout: WorkoutResult = {
      date: new Date().toISOString(),
      type: state.getCurrentWorkoutType(),
      results: { ...state.workoutResults },
      weekNumber: state.getCurrentWeek(),
    };

    set((s) => ({
      workoutHistory: [...s.workoutHistory, workout],
      sessionCount: s.sessionCount + 1,
    }));

    // Check if week is complete and process results
    const newSessionCount = state.sessionCount + 1;
    if (newSessionCount % 4 === 0 && newSessionCount > 0) {
      get().processWeeklyResults();
      set((s) => ({
        weekNumber: s.weekNumber + 1,
        weeklyResults: {
          deadlift: [],
          rdl: [],
          squat: [],
          bench: [],
          ohp: [],
          row: [],
          pullups: [],
        },
      }));
    }

    get().initWorkout();
  },

  processWeeklyResults: () => {
    const { weeklyResults, currentWeights, consecutiveFailures, lastSuccessfulWeights } = get();

    let needsDeload = false;
    const newConsecutiveFailures = { ...consecutiveFailures };
    const newLastSuccessful = { ...lastSuccessfulWeights };

    // Check for deload trigger
    Object.keys(currentWeights).forEach((exercise) => {
      const key = exercise as ExerciseKey;
      if (key === 'pullups') return;

      const results = weeklyResults[key] || [];
      const allFailed = results.length > 0 && results.every((r) => !r);

      if (allFailed) {
        newConsecutiveFailures[key] = (newConsecutiveFailures[key] || 0) + 1;

        // Link RDL and deadlift
        if (key === 'deadlift') {
          newConsecutiveFailures.rdl = newConsecutiveFailures[key];
        } else if (key === 'rdl') {
          newConsecutiveFailures.deadlift = newConsecutiveFailures[key];
        }

        if (newConsecutiveFailures[key] >= 2) {
          needsDeload = true;
        }
      } else if (results.some((r) => r)) {
        newConsecutiveFailures[key] = 0;

        // Link RDL and deadlift
        if (key === 'deadlift') {
          newConsecutiveFailures.rdl = 0;
        } else if (key === 'rdl') {
          newConsecutiveFailures.deadlift = 0;
        }

        newLastSuccessful[key] = currentWeights[key];
      }
    });

    set({ consecutiveFailures: newConsecutiveFailures, lastSuccessfulWeights: newLastSuccessful });

    if (needsDeload) {
      // Initiate deload
      const newWeights = { ...currentWeights };
      Object.keys(currentWeights).forEach((exercise) => {
        const key = exercise as ExerciseKey;
        const deloadWeight = Math.floor((currentWeights[key] * 0.75) / 5) * 5;
        newWeights[key] = Math.max(45, deloadWeight);
      });

      set({
        currentWeights: newWeights,
        isDeloadWeek: true,
        consecutiveFailures: {
          deadlift: 0,
          rdl: 0,
          squat: 0,
          bench: 0,
          ohp: 0,
          row: 0,
          pullups: 0,
        },
      });
    } else if (get().isDeloadWeek) {
      // Complete deload - return to last successful - 5
      const newWeights = { ...currentWeights };
      Object.keys(currentWeights).forEach((exercise) => {
        const key = exercise as ExerciseKey;
        const returnWeight = (lastSuccessfulWeights[key] || INITIAL_WEIGHTS[key]) - 5;
        newWeights[key] = Math.max(45, returnWeight);
      });

      set({
        currentWeights: newWeights,
        isDeloadWeek: false,
      });
    } else {
      // Normal progression
      const newWeights = { ...currentWeights };
      Object.keys(currentWeights).forEach((exercise) => {
        const key = exercise as ExerciseKey;
        const results = weeklyResults[key] || [];
        const allSuccessful = results.length > 0 && results.every((r) => r);

        if (allSuccessful) {
          if (key === 'rdl') {
            // RDL only progresses if deadlift also progressed
            const deadliftResults = weeklyResults.deadlift || [];
            const deadliftAllSuccessful = deadliftResults.length > 0 && deadliftResults.every((r) => r);
            if (deadliftAllSuccessful) {
              newWeights[key] += 5;
              newLastSuccessful[key] = newWeights[key];
            }
          } else {
            newWeights[key] += 5;
            newLastSuccessful[key] = newWeights[key];
          }
        }
      });

      set({ currentWeights: newWeights, lastSuccessfulWeights: newLastSuccessful });
    }
  },

  calculateWarmupSets: (exercise, weight) => {
    if (exercise === 'pullups') return [];

    const roundToFive = (w: number) => Math.floor(w / 5) * 5;
    const set1 = Math.max(45, roundToFive(weight * 0.45));
    const set2 = Math.max(45, roundToFive(weight * 0.65));
    const set3 = Math.max(45, roundToFive(weight * 0.8));

    return [
      `${set1} lbs × 5 reps`,
      `${set2} lbs × 3 reps`,
      `${set3} lbs × 2 reps`,
    ];
  },

  overrideWeight: async (exercise, newWeight) => {
    const roundedWeight = exercise === 'pullups' && newWeight === 0
      ? 0
      : Math.round(newWeight / 5) * 5;

    const oldWeight = get().currentWeights[exercise];

    set((state) => ({
      currentWeights: {
        ...state.currentWeights,
        [exercise]: roundedWeight,
      },
      consecutiveFailures: {
        ...state.consecutiveFailures,
        [exercise]: 0,
      },
      lastSuccessfulWeights: {
        ...state.lastSuccessfulWeights,
        [exercise]: roundedWeight,
      },
      weeklyResults: {
        ...state.weeklyResults,
        [exercise]: [],
      },
      workoutHistory: [
        ...state.workoutHistory,
        {
          date: new Date().toISOString(),
          type: 'WEIGHT_OVERRIDE',
          exercise,
          oldWeight,
          newWeight: roundedWeight,
          results: {} as Record<ExerciseKey, boolean>,
          weekNumber: state.getCurrentWeek(),
        },
      ],
    }));
  },

  loadState: (state) => {
    set((current) => ({
      ...current,
      ...state,
    }));
  },

  reset: () => {
    set(getInitialState());
  },
}));
