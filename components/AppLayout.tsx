'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useWorkoutStore } from '@/store/workout-store';
import { supabase } from '@/lib/supabase';
import { loadWorkoutData, saveWorkoutState, saveWorkoutHistory } from '@/lib/db';
import AuthForm from './AuthForm';
import WorkoutView from './WorkoutView';
import ProgressView from './ProgressView';

type Tab = 'train' | 'progress';

export default function AppLayout() {
  const { user, setUser, setLoading, signOut } = useAuthStore();
  const { initWorkout, loadState, workoutHistory, currentWorkout } = useWorkoutStore();
  const [activeTab, setActiveTab] = useState<Tab>('train');
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
          <div className="mb-4 h-12 w-12 mx-auto animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
          <div className="text-gray-600">Loading your workouts...</div>
        </div>
      </div>
    );
  }

  const getPageTitle = () => {
    if (activeTab === 'train') {
      return currentWorkout?.name || "Today's Workout";
    }
    return 'Progress';
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-md px-4 py-4">
          {/* Top Row: Logo and Sign Out */}
          <div className="flex items-center justify-between mb-3">
            <img
              src="/workout-bear-icon-180.svg"
              alt="Workout Tracker"
              className="h-12 w-12"
            />

            {activeTab === 'progress' && (
              <button
                onClick={signOut}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
              >
                Sign Out
              </button>
            )}
          </div>

          {/* Title Row */}
          <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-md px-4 py-6">
        {activeTab === 'train' ? <WorkoutView /> : <ProgressView />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-md">
          <button
            onClick={() => setActiveTab('train')}
            className={`flex flex-1 flex-col items-center gap-1 px-4 py-3 transition ${
              activeTab === 'train'
                ? 'text-black'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-label="Train"
            aria-current={activeTab === 'train' ? 'page' : undefined}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="text-xs font-medium">Train</span>
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`flex flex-1 flex-col items-center gap-1 px-4 py-3 transition ${
              activeTab === 'progress'
                ? 'text-black'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-label="Progress"
            aria-current={activeTab === 'progress' ? 'page' : undefined}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs font-medium">Progress</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
