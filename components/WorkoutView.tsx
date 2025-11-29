'use client';

import { useState } from 'react';
import { useWorkoutStore } from '@/store/workout-store';
import { EXERCISE_INFO } from '@/lib/constants';
import type { ExerciseKey } from '@/types';
import BottomSheet from './BottomSheet';

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

  const [selectedExercise, setSelectedExercise] = useState<ExerciseKey | null>(null);
  const [editedWeight, setEditedWeight] = useState<string>('');

  if (!currentWorkout) return null;

  const allExercisesCompleted = currentWorkout.exercises.every(
    (ex) => workoutResults[ex.key] !== undefined
  );

  const openExerciseSheet = (exerciseKey: ExerciseKey) => {
    setSelectedExercise(exerciseKey);
    setEditedWeight(currentWeights[exerciseKey].toString());
  };

  const closeSheet = () => {
    setSelectedExercise(null);
    setEditedWeight('');
  };

  const handleHit = async () => {
    if (!selectedExercise) return;

    // If weight was edited, save the override first
    const newWeight = parseInt(editedWeight);
    if (!isNaN(newWeight) && newWeight !== currentWeights[selectedExercise]) {
      await overrideWeight(selectedExercise, newWeight);
    }

    recordResult(selectedExercise, true);
    closeSheet();
  };

  const handleMissed = () => {
    if (!selectedExercise) return;
    recordResult(selectedExercise, false);
    closeSheet();
  };

  const handleComplete = async () => {
    await completeWorkout();
  };

  const selectedExerciseData = selectedExercise
    ? currentWorkout.exercises.find((ex) => ex.key === selectedExercise)
    : null;

  const selectedExerciseInfo = selectedExercise
    ? EXERCISE_INFO[selectedExercise]
    : null;

  const selectedExerciseResult = selectedExercise
    ? workoutResults[selectedExercise]
    : undefined;

  return (
    <>
      <div className="space-y-3">
        {/* Deload Week Banner */}
        {isDeloadWeek && (
          <div className="card border-yellow-200 bg-yellow-50 p-4">
            <h3 className="mb-1 font-semibold text-yellow-900">Deload Week</h3>
            <p className="text-sm text-yellow-700">
              Weights reduced to 75%. Focus on form and recovery.
            </p>
          </div>
        )}

        {/* Exercise Cards */}
        <div className="space-y-2">
          {currentWorkout.exercises.map((exercise) => {
            const weight = currentWeights[exercise.key];
            const result = workoutResults[exercise.key];

            return (
              <button
                key={exercise.key}
                onClick={() => openExerciseSheet(exercise.key)}
                disabled={result !== undefined}
                className="card-interactive flex w-full items-center justify-between p-4 text-left disabled:opacity-60 disabled:active:scale-100"
              >
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold text-gray-900">
                    {exercise.name}
                  </h3>
                  <p className="font-mono text-sm text-gray-600">
                    {exercise.key === 'pullups'
                      ? weight === 0
                        ? 'Bodyweight'
                        : `+${weight} lbs`
                      : `${weight} lbs`}{' '}
                    · {exercise.sets}
                  </p>
                </div>

                {/* Status Indicator */}
                <div className="ml-4">
                  {result === undefined && (
                    <div className="status-todo" aria-label="Not started" />
                  )}
                  {result === true && (
                    <div
                      className="status-done"
                      aria-label="Completed successfully"
                    >
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {result === false && (
                    <div className="status-missed" aria-label="Missed">
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fixed Finish Workout Button */}
      {allExercisesCompleted && (
        <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white p-4">
          <div className="mx-auto max-w-md">
            <button onClick={handleComplete} className="btn-primary">
              Finish Workout
            </button>
          </div>
        </div>
      )}

      {/* Exercise Log Bottom Sheet */}
      <BottomSheet
        isOpen={selectedExercise !== null}
        onClose={closeSheet}
        title={selectedExerciseData?.name}
      >
        {selectedExerciseData && selectedExerciseInfo && (
          <div className="space-y-6">
            {/* Rest Time Info */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Rest: {selectedExerciseInfo.rest}
              </p>
            </div>

            {/* Weight and Reps Input */}
            <div className="grid grid-cols-2 gap-4">
              {/* Weight Input */}
              <div>
                <label
                  htmlFor="weight-input"
                  className="mb-2 block text-sm font-medium text-gray-600"
                >
                  Weight
                </label>
                <div className="relative">
                  <input
                    id="weight-input"
                    type="number"
                    inputMode="numeric"
                    value={editedWeight}
                    onChange={(e) => setEditedWeight(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-4 text-center font-mono text-2xl text-gray-900 focus:border-black focus:outline-none"
                    step="5"
                    min="0"
                    disabled={selectedExerciseResult !== undefined}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    lbs
                  </span>
                </div>
              </div>

              {/* Sets/Reps Display */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  Sets
                </label>
                <div className="flex h-[60px] items-center justify-center rounded-lg border-2 border-gray-200 bg-gray-50 font-mono text-2xl text-gray-900">
                  {selectedExerciseData.sets}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {selectedExerciseResult === undefined ? (
              <div className="space-y-3">
                <button onClick={handleHit} className="btn-success">
                  Hit Target
                </button>
                <button onClick={handleMissed} className="btn-error">
                  Missed
                </button>
              </div>
            ) : (
              <div className="text-center text-sm text-gray-600">
                {selectedExerciseResult
                  ? '✓ Marked as completed'
                  : '✗ Marked as missed'}
              </div>
            )}
          </div>
        )}
      </BottomSheet>
    </>
  );
}
