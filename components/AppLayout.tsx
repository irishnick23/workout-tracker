'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useWorkoutStore } from '@/store/workout-store';
import { supabase } from '@/lib/supabase';
import { loadWorkoutData, saveWorkoutState, saveWorkoutHistory } from '@/lib/db';
import { haptics } from '@/lib/haptics';
import AuthForm from './AuthForm';
import WorkoutView from './WorkoutView';
import ProgressView from './ProgressView';
import BearLoader from './BearLoader';

type Tab = 'train' | 'progress';

export default function AppLayout() {
  const { user, setUser, setLoading, signOut } = useAuthStore();
  const { initWorkout, loadState, workoutHistory, currentWorkout } = useWorkoutStore();
  const [activeTab, setActiveTab] = useState<Tab>('train');
  const [dataLoaded, setDataLoaded] = useState(false);

  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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
        <BearLoader message="Loading your workouts..." size="lg" />
      </div>
    );
  }

  const getPageTitle = () => {
    if (activeTab === 'train') {
      return currentWorkout?.name || "Today's Workout";
    }
    return 'Progress';
  };

  // Swipe gesture handlers
  const minSwipeDistance = 50; // minimum swipe distance in pixels

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeTab === 'train') {
      // Swipe left: Train → Progress
      haptics.light();
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveTab('progress');
        setIsTransitioning(false);
      }, 150);
    } else if (isRightSwipe && activeTab === 'progress') {
      // Swipe right: Progress → Train
      haptics.light();
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveTab('train');
        setIsTransitioning(false);
      }, 150);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-background" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="mx-auto max-w-2xl px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/workout-bear-icon-180.svg"
                alt="Workout Tracker"
                className="h-10 w-10"
              />
              <h1 className="text-xl font-bold">Workout Tracker</h1>
            </div>

            <button
              onClick={signOut}
              className="px-3 py-2 text-sm font-medium transition-smooth"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main
        ref={contentRef}
        className="mx-auto max-w-2xl px-5 pb-8"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 54px)' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {activeTab === 'train' ? <WorkoutView /> : <ProgressView />}
        </div>
      </main>

      {/* Glass Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-5">
        <div className="glass-nav rounded-2xl p-2 flex gap-2">
          <button
            onClick={() => setActiveTab('train')}
            className={`flex-1 h-11 rounded-xl font-medium text-sm transition-smooth flex items-center justify-center gap-2 ${
              activeTab === 'train'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
            aria-label="Train"
            aria-current={activeTab === 'train' ? 'page' : undefined}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Train
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 h-11 rounded-xl font-medium text-sm transition-smooth flex items-center justify-center gap-2 ${
              activeTab === 'progress'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
            aria-label="Progress"
            aria-current={activeTab === 'progress' ? 'page' : undefined}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Progress
          </button>
        </div>
      </nav>
    </div>
  );
}
