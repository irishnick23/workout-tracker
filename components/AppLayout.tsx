'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useWorkoutStore } from '@/store/workout-store';
import { supabase } from '@/lib/supabase';
import { loadWorkoutData, saveWorkoutState, saveWorkoutHistory } from '@/lib/db';
import AuthForm from './AuthForm';
import WorkoutView from './WorkoutView';
import ProgressView from './ProgressView';

type Tab = 'workout' | 'progress';

export default function AppLayout() {
  const { user, setUser, setLoading } = useAuthStore();
  const { initWorkout, loadState, workoutHistory } = useWorkoutStore();
  const [activeTab, setActiveTab] = useState<Tab>('workout');
  const [dataLoaded, setDataLoaded] = useState(false);

  // Initialize auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  // Load workout data when user signs in
  useEffect(() => {
    if (user && !dataLoaded) {
      loadWorkoutData(user.id).then((data) => {
        if (data && Object.keys(data).length > 0) {
          loadState(data);
        }
        initWorkout();
        setDataLoaded(true);
      });
    } else if (!user) {
      setDataLoaded(false);
    }
  }, [user, loadState, initWorkout, dataLoaded]);

  // Auto-save on workout completion
  useEffect(() => {
    if (!user || !dataLoaded) return;

    const state = useWorkoutStore.getState();

    // Debounce saves to avoid too many writes
    const timeout = setTimeout(() => {
      saveWorkoutState(user.id, state).catch(console.error);

      // Save last workout if new
      if (workoutHistory.length > 0) {
        const lastWorkout = workoutHistory[workoutHistory.length - 1];
        const lastDate = new Date(lastWorkout.date);
        const now = new Date();

        // If last workout was within last minute, save it
        if (now.getTime() - lastDate.getTime() < 60000) {
          saveWorkoutHistory(user.id, lastWorkout).catch(console.error);
        }
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [user, dataLoaded, workoutHistory]);

  if (!user) {
    return <AuthForm />;
  }

  if (!dataLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">💪</div>
          <div className="text-gray-600">Loading your workouts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-md p-4">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold">💪 Workout Tracker</h1>
        </header>

        {/* Tab Navigation */}
        <nav className="mb-6">
          <div className="flex gap-2 rounded-lg bg-gray-200 p-1">
            <button
              onClick={() => setActiveTab('workout')}
              className={`flex-1 rounded-md px-4 py-2 font-medium transition ${
                activeTab === 'workout'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Workout
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 rounded-md px-4 py-2 font-medium transition ${
                activeTab === 'progress'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Progress
            </button>
          </div>
        </nav>

        {/* Content */}
        <main>
          {activeTab === 'workout' ? <WorkoutView /> : <ProgressView />}
        </main>
      </div>
    </div>
  );
}
