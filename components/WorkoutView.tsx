'use client';

import { useState } from 'react';
import { useWorkoutStore } from '@/store/workout-store';
import { EXERCISE_INFO } from '@/lib/constants';
import type { ExerciseKey } from '@/types';

export default function WorkoutView() {
  const {
    currentWorkout,
    currentWeights,
    workoutResults,
    recordResult,
    completeWorkout,
    isDeloadWeek,
    overrideWeight,
  } = useWorkoutStore();

  const [showCompleteButton, setShowCompleteButton] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseKey | null>(null);
  const [editValue, setEditValue] = useState('');

  if (!currentWorkout) return null;

  const allExercisesCompleted = currentWorkout.exercises.every(
    (ex) => workoutResults[ex.key] !== undefined
  );

  const startEdit = (exercise: ExerciseKey) => {
    setEditingExercise(exercise);
    setEditValue(currentWeights[exercise].toString());
  };

  const saveEdit = async (exercise: ExerciseKey) => {
    const newWeight = parseInt(editValue);
    if (!isNaN(newWeight) && newWeight >= 0) {
      await overrideWeight(exercise, newWeight);
    }
    setEditingExercise(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingExercise(null);
    setEditValue('');
  };

  const handleComplete = async () => {
    await completeWorkout();
    setShowCompleteButton(false);
  };

  return (
    <div className="space-y-4">
      {isDeloadWeek && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-2 font-semibold">⚠️ Deload Week</h3>
          <p className="text-sm text-gray-600">
            Weights reduced to 75%. Focus on form and recovery.
          </p>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-6 text-xl font-semibold">{currentWorkout.name}</h2>

        <div className="space-y-6">
          {currentWorkout.exercises.map((exercise) => {
            const weight = currentWeights[exercise.key];
            const result = workoutResults[exercise.key];

            return (
              <div
                key={exercise.key}
                className="rounded-md border border-gray-200 p-4"
              >
                <div className="mb-2">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold">{exercise.name}</h3>
                    <span className="text-sm text-gray-600">
                      Rest: {EXERCISE_INFO[exercise.key].rest}
                    </span>
                  </div>

                  {editingExercise === exercise.key ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 rounded border-2 border-black px-2 py-1 text-center text-sm"
                        step="5"
                        min="0"
                        autoFocus
                      />
                      <span className="text-sm text-gray-600">lbs</span>
                      <span className="text-sm text-gray-600">{exercise.sets}</span>
                      <button
                        onClick={() => saveEdit(exercise.key)}
                        className="ml-auto rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded bg-gray-600 px-3 py-1 text-xs text-white hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>
                        {exercise.key === 'pullups'
                          ? weight === 0
                            ? 'Bodyweight'
                            : `+${weight} lbs`
                          : `${weight} lbs`}{' '}
                        {exercise.sets}
                      </span>
                      <button
                        onClick={() => startEdit(exercise.key)}
                        className="ml-auto rounded border border-gray-300 bg-gray-50 px-2 py-1 text-xs hover:bg-gray-100"
                      >
                        Edit Weight
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      recordResult(exercise.key, true);
                      setShowCompleteButton(true);
                    }}
                    disabled={result !== undefined}
                    className={`flex-1 rounded-md border-2 px-4 py-3 font-medium transition ${
                      result === true
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-green-600 bg-gradient-to-br from-green-50 to-green-100 text-green-700 hover:bg-green-50'
                    } disabled:opacity-50`}
                  >
                    ✓ Hit Target
                  </button>

                  <button
                    onClick={() => {
                      recordResult(exercise.key, false);
                      setShowCompleteButton(true);
                    }}
                    disabled={result !== undefined}
                    className={`flex-1 rounded-md border-2 px-4 py-3 font-medium transition ${
                      result === false
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-red-600 bg-gradient-to-br from-red-50 to-red-100 text-red-700 hover:bg-red-50'
                    } disabled:opacity-50`}
                  >
                    ✗ Missed
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {(allExercisesCompleted || showCompleteButton) && (
          <button
            onClick={handleComplete}
            className="mt-6 w-full rounded-md bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800"
          >
            Complete Workout
          </button>
        )}
      </div>
    </div>
  );
}
