'use client';

import { useWorkoutStore } from '@/store/workout-store';
import { useAuthStore } from '@/store/auth-store';
import { INITIAL_WEIGHTS, EXERCISE_DISPLAY_NAMES, WORKOUTS } from '@/lib/constants';
import type { ExerciseKey } from '@/types';

export default function ProgressView() {
  const {
    workoutHistory,
    currentWeights,
  } = useWorkoutStore();
  const { signOut } = useAuthStore();

  const actualWorkouts = workoutHistory.filter((w) => w.type !== 'WEIGHT_OVERRIDE');

  const totalWorkouts = actualWorkouts.length;
  const totalExercises = actualWorkouts.reduce(
    (sum, w) => sum + Object.keys(w.results).length,
    0
  );
  const successfulExercises = actualWorkouts.reduce(
    (sum, w) => sum + Object.values(w.results).filter(Boolean).length,
    0
  );
  const successRate = totalExercises > 0
    ? Math.round((successfulExercises / totalExercises) * 100)
    : 0;
  const weeksCompleted = Math.floor(totalWorkouts / 4);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold">Progress</h2>
        <p className="text-sm text-muted-foreground">Track your strength journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card-clean p-5 text-center space-y-2">
          <div className="text-3xl font-bold">{totalWorkouts}</div>
          <div className="text-xs text-muted-foreground">Total<br/>Workouts</div>
        </div>
        <div className="card-clean p-5 text-center space-y-2">
          <div className="text-3xl font-bold">{successRate}%</div>
          <div className="text-xs text-muted-foreground">Success<br/>Rate</div>
        </div>
        <div className="card-clean p-5 text-center space-y-2">
          <div className="text-3xl font-bold">{weeksCompleted}</div>
          <div className="text-xs text-muted-foreground">Weeks<br/>Completed</div>
        </div>
      </div>

      {/* Recent History */}
      <div className="card-clean p-6 space-y-4">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: 'hsl(var(--primary))' }}
          >
            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h3 className="font-semibold text-xl">Recent History</h3>
        </div>

        {workoutHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No workouts completed yet. Start your first session!
          </div>
        ) : (
          <div className="space-y-3">
            {workoutHistory.slice(-10).reverse().map((workout, idx) => {
              const date = new Date(workout.date).toLocaleDateString();

              if (workout.type === 'WEIGHT_OVERRIDE') {
                const exerciseName = EXERCISE_DISPLAY_NAMES[workout.exercise!];
                const change = (workout.newWeight || 0) - (workout.oldWeight || 0);
                const changeColor = change > 0 ? 'text-primary' : 'text-destructive';

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                  >
                    <div>
                      <div className="font-medium">Weight Override: {exerciseName}</div>
                      <div className="text-sm text-muted-foreground">{date}</div>
                    </div>
                    <div className={`text-sm ${changeColor}`}>
                      {workout.oldWeight} → {workout.newWeight} lbs
                    </div>
                  </div>
                );
              }

              const workoutName = WORKOUTS[workout.type].name;
              const successes = Object.values(workout.results).filter(Boolean).length;
              const total = Object.keys(workout.results).length;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                >
                  <div>
                    <div className="font-medium">{workoutName}</div>
                    <div className="text-sm text-muted-foreground">{date}</div>
                  </div>
                  <div className="text-sm">
                    {successes === total ? (
                      <span className="text-primary">{successes}/{total}</span>
                    ) : (
                      <span className="text-muted-foreground">{successes}/{total}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Current Weights */}
      <div className="card-clean p-6 space-y-4">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: 'hsl(var(--primary))' }}
          >
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="font-semibold text-xl">Current Weights</h3>
        </div>

        <div className="space-y-3">
          {Object.entries(currentWeights).map(([exercise, weight]) => {
            const key = exercise as ExerciseKey;
            const displayName = EXERCISE_DISPLAY_NAMES[key];
            const weightDisplay =
              key === 'pullups'
                ? weight === 0
                  ? 'Bodyweight'
                  : `+${weight} lbs`
                : `${weight} lbs`;

            const startingWeight = INITIAL_WEIGHTS[key];
            const difference = weight - startingWeight;
            let progressColor = 'text-muted-foreground';
            if (difference > 0) progressColor = 'text-primary';
            if (difference < 0) progressColor = 'text-destructive';

            return (
              <div
                key={exercise}
                className="flex items-center justify-between border-b border-border pb-3 last:border-0"
              >
                <div className="font-medium">{displayName}</div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{key === 'pullups' ? (weight === 0 ? weight : `+${weight}`) : weight} lbs</span>
                  <span className={`text-sm px-2 py-1 rounded ${progressColor} ${difference === 0 ? 'bg-muted/30' : 'bg-primary/10'}`}>
                    {difference > 0 ? `+${difference}` : difference} lbs
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
