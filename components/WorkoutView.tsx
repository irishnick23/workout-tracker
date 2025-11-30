'use client';

import { useState } from 'react';
import { useWorkoutStore } from '@/store/workout-store';
import { EXERCISE_INFO } from '@/lib/constants';
import { haptics } from '@/lib/haptics';
import type { ExerciseKey } from '@/types';
import BottomSheet from './BottomSheet';
import SuccessAnimation from './SuccessAnimation';

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
  const [showSuccess, setShowSuccess] = useState(false);

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

    // Haptic feedback for success
    haptics.success();

    // If weight was edited, update it (mid-workout adjustment)
    const newWeight = parseInt(editedWeight);
    if (!isNaN(newWeight) && newWeight !== currentWeights[selectedExercise]) {
      await overrideWeight(selectedExercise, newWeight, true);
    }

    recordResult(selectedExercise, true);
    closeSheet();
  };

  const handleMissed = () => {
    if (!selectedExercise) return;

    // Haptic feedback for error
    haptics.error();

    recordResult(selectedExercise, false);
    closeSheet();
  };

  const handleComplete = async () => {
    // Celebration haptic feedback
    haptics.celebration();

    // Show success animation
    setShowSuccess(true);

    // Complete workout after animation (500ms)
    setTimeout(async () => {
      await completeWorkout();
    }, 500);
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
      <SuccessAnimation show={showSuccess} onComplete={() => setShowSuccess(false)} />

      <div className="space-y-8">
        {/* Workout Header */}
        <div className="space-y-1">
          <h2 className="text-3xl font-bold">
            {currentWorkout.name.split(' ').slice(0, 2).join(' ')}{' '}
            <span className="text-muted-foreground">
              {currentWorkout.name.split(' ').slice(2).join(' ')}
            </span>
          </h2>
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
                aria-label={`${exercise.name}, ${weight} lbs, ${exercise.sets}, ${exerciseInfo.rest}${result !== undefined ? (result ? ' - Completed' : ' - Missed') : ''}`}
              >
                <div className="flex items-center">
                  {/* Exercise info */}
                  <div className="flex-[2] space-y-1">
                    <h3 className="font-semibold text-lg">
                      {exercise.name}
                    </h3>
                    <div className="text-3xl font-bold text-foreground leading-none">
                      {exercise.key === 'pullups'
                        ? weight === 0
                          ? 'Bodyweight'
                          : `+${weight} lbs`
                        : `${weight} lbs`}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{exercise.sets}</span>
                      <span>•</span>
                      <span>{exerciseInfo.rest}</span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      result === undefined
                        ? 'border-2 border-border'
                        : result === true
                        ? 'bg-primary'
                        : 'bg-destructive'
                    }`}>
                      {result === true && (
                        <svg
                          className="h-4 w-4"
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
                          className="h-4 w-4"
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
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Complete Workout Button */}
        <button
          onClick={handleComplete}
          disabled={!allExercisesCompleted}
          className="btn-primary"
        >
          Complete Workout
        </button>
      </div>

      {/* Exercise Log Bottom Sheet */}
      <BottomSheet
        isOpen={selectedExercise !== null}
        onClose={closeSheet}
        title={selectedExerciseData?.name}
      >
        {selectedExerciseData && selectedExerciseInfo && (
          <div className="space-y-6">
            {/* Weight and Sets Display */}
            <div className="grid grid-cols-2 gap-4">
              {/* Weight Input */}
              <div>
                <label htmlFor="weight-input" className="mb-2 block text-xs text-muted-foreground uppercase tracking-wide">
                  Weight
                </label>
                <div className="relative">
                  <input
                    id="weight-input"
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={editedWeight}
                    onChange={(e) => setEditedWeight(e.target.value)}
                    className="h-20 w-full rounded-lg border border-input bg-muted/30 text-center font-bold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    style={{ fontSize: '2rem', lineHeight: '80px' }}
                    placeholder=""
                    aria-label="Weight in pounds"
                    aria-describedby="weight-unit"
                  />
                  <span id="weight-unit" className="absolute right-3 bottom-2 text-xs text-muted-foreground pointer-events-none">
                    lbs
                  </span>
                </div>
              </div>

              {/* Sets Display */}
              <div>
                <label className="mb-2 block text-xs text-muted-foreground uppercase tracking-wide">
                  Sets • {selectedExerciseInfo.rest}
                </label>
                <div className="flex h-20 items-center justify-center rounded-lg border border-input bg-muted/30 font-bold" style={{ fontSize: '2rem' }} role="text" aria-label={`${selectedExerciseData.sets} sets with ${selectedExerciseInfo.rest} rest`}>
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
