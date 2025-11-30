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
    weekNumber,
    sessionCount,
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

  const sessionWithinWeek = (sessionCount % 4) + 1;

  return (
    <>
      <div className="space-y-8">
        {/* Workout Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold">
              {currentWorkout.name.split(' ').slice(0, 2).join(' ')}{' '}
              <span className="text-muted-foreground">
                {currentWorkout.name.split(' ').slice(2).join(' ')}
              </span>
            </h2>
            {!allExercisesCompleted && (
              <span className="badge-success">Active</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Week {weekNumber} • Session {sessionWithinWeek}
          </p>
        </div>

        {/* Deload Week Banner */}
        {isDeloadWeek && (
          <div className="card-clean p-5 border-yellow-200 bg-yellow-50">
            <h3 className="mb-1 font-semibold text-yellow-900">Deload Week</h3>
            <p className="text-sm text-yellow-700">
              Weights reduced to 75%. Focus on form and recovery.
            </p>
          </div>
        )}

        {/* Exercise Cards */}
        <div className="space-y-3">
          {currentWorkout.exercises.map((exercise) => {
            const weight = currentWeights[exercise.key];
            const result = workoutResults[exercise.key];
            const exerciseInfo = EXERCISE_INFO[exercise.key];

            return (
              <button
                key={exercise.key}
                onClick={() => openExerciseSheet(exercise.key)}
                disabled={result !== undefined}
                className="card-clean card-hover w-full p-5 text-left disabled:opacity-60 disabled:hover:shadow-[var(--shadow-soft)] transition-smooth group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-base">
                      {exercise.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="font-mono font-medium text-foreground">
                        {exercise.key === 'pullups'
                          ? weight === 0
                            ? 'Bodyweight'
                            : `+${weight} lbs`
                          : `${weight} lbs`}
                      </span>
                      <span style={{ color: 'hsl(var(--border))' }}>•</span>
                      <span className="font-mono">{exercise.sets}</span>
                      <span style={{ color: 'hsl(var(--border))' }}>•</span>
                      <span>{exerciseInfo.rest}</span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="ml-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      result === undefined
                        ? 'border-2 border-border'
                        : result === true
                        ? 'bg-primary'
                        : 'bg-destructive'
                    }`}>
                      {result === true && (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          viewBox="0 0 24 24"
                          stroke="white"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {result === false && (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          viewBox="0 0 24 24"
                          stroke="white"
                        >
                          <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    {result === undefined && (
                      <svg
                        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-smooth"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        style={{ color: 'hsl(var(--muted-foreground))' }}
                      >
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Complete Workout Button */}
        {allExercisesCompleted && (
          <button onClick={handleComplete} className="btn-primary">
            Complete Workout
          </button>
        )}
      </div>

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
              <p className="text-sm text-muted-foreground">
                Rest: {selectedExerciseInfo.rest}
              </p>
            </div>

            {/* Weight and Sets Display */}
            <div className="grid grid-cols-2 gap-4">
              {/* Weight Input */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Weight
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={editedWeight}
                    onChange={(e) => setEditedWeight(e.target.value)}
                    className="h-[68px] w-full rounded-lg border border-input bg-muted/30 px-4 text-center font-mono text-2xl font-bold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    lbs
                  </span>
                </div>
              </div>

              {/* Sets Display */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Sets
                </label>
                <div className="flex h-[68px] items-center justify-center rounded-lg border border-input bg-muted/30 font-mono text-2xl font-bold">
                  {selectedExerciseData.sets}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {selectedExerciseResult === undefined ? (
              <div className="space-y-3">
                <button onClick={handleHit} className="btn-primary flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Hit Target
                </button>
                <button onClick={handleMissed} className="btn-outline destructive flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Missed
                </button>
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground">
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
