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
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-md border border-gray-200 bg-white p-4 text-center">
          <div className="text-2xl font-semibold">{totalWorkouts}</div>
          <div className="text-sm text-gray-600">Total Workouts</div>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-4 text-center">
          <div className="text-2xl font-semibold">{successRate}%</div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-4 text-center">
          <div className="text-2xl font-semibold">{weeksCompleted}</div>
          <div className="text-sm text-gray-600">Weeks Completed</div>
        </div>
      </div>

      {/* Recent History */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 font-semibold">Recent History</h3>
        <div className="space-y-3">
          {workoutHistory.slice(-10).reverse().map((workout, idx) => {
            const date = new Date(workout.date).toLocaleDateString();

            if (workout.type === 'WEIGHT_OVERRIDE') {
              const exerciseName = EXERCISE_DISPLAY_NAMES[workout.exercise!];
              const change = (workout.newWeight || 0) - (workout.oldWeight || 0);
              const changeColor = change > 0 ? 'text-green-600' : 'text-red-600';

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
                >
                  <div>
                    <div className="font-medium">Weight Override: {exerciseName}</div>
                    <div className="text-sm text-gray-600">{date}</div>
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
            const status = successes === total ? '✅' : '⚠️';

            return (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
              >
                <div>
                  <div className="font-medium">{workoutName}</div>
                  <div className="text-sm text-gray-600">{date}</div>
                </div>
                <div className="text-lg">
                  {status} {successes}/{total}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Weights */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 font-semibold">Current Weights</h3>
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
            let progressColor = 'text-orange-500';
            if (difference > 0) progressColor = 'text-green-600';
            if (difference < 0) progressColor = 'text-red-600';

            return (
              <div
                key={exercise}
                className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
              >
                <div className="font-medium">{displayName}</div>
                <div className="flex items-center gap-2">
                  <span>{weightDisplay}</span>
                  <span className={`text-sm font-medium ${progressColor}`}>
                    {difference > 0 ? `+${difference}` : difference} lbs
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 font-semibold">Account</h3>
        <button
          onClick={() => signOut()}
          className="w-full rounded-md bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
