# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Build static export to out/ directory
npm run lint     # Run ESLint
```

**Deployment:**
- This app uses `output: 'export'` for static generation
- Build produces `out/` directory deployable to any static host
- Vercel auto-deploys from GitHub when pushed to `main` branch
- Environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) must be set in Vercel dashboard

## Architecture Overview

### Core State Management Pattern

The app uses **Zustand stores** as the single source of truth, with Supabase as the persistence layer. This is NOT a traditional "backend-driven" app - the workout progression logic lives entirely in the frontend store.

**Critical architectural decision:** All workout logic (weight progression, deload triggers, weekly result processing) is handled in `workout-store.ts`. Supabase is only used for:
1. Authentication
2. Saving/loading state snapshots
3. Multi-device sync

### Workout Progression Logic (workout-store.ts)

The progression system follows a 4-workout weekly cycle:
- Session 0, 4, 8... → Workout A (Heavy) - Deadlift
- Session 1, 5, 9... → Workout B - Squat
- Session 2, 6, 10... → Workout A (Light) - RDL
- Session 3, 7, 11... → Workout B - Squat

**Key state machine transitions:**
1. User completes workout → `completeWorkout()` increments `sessionCount`
2. Every 4 sessions → `processWeeklyResults()` evaluates weekly performance
3. Weight progression rules:
   - All sets successful in week → +5 lbs next week
   - Any failures → retry same weight
   - 2 consecutive weeks of failure → automatic deload (75% weight)
4. Deload week → RDL replaces Deadlift (see `getCurrentWorkoutType()`)
5. Post-deload → return to `lastSuccessfulWeights - 5 lbs`

**RDL/Deadlift coupling:** These exercises share `consecutiveFailures` counters and weight progression (lines 158-175 in workout-store.ts). When one progresses, both progress. This prevents the RDL from diverging too far from the Deadlift.

### Data Persistence Flow

**On app load (AppLayout.tsx:38-50):**
```
User signs in → loadWorkoutData(userId) → loadState() → initWorkout()
```

**During session (AppLayout.tsx:52-76):**
```
State change → 1-second debounce → saveWorkoutState() + saveWorkoutHistory()
```

**Database schema (Supabase):**
- `workout_state` - Single row per user (sessionCount, weekNumber, isDeloadWeek)
- `current_weights` - 7 rows per user (one per exercise)
- `exercise_stats` - 7 rows per user (consecutiveFailures, lastSuccessfulWeights)
- `workout_history` - Append-only log of completed workouts
- `workout_results` - Join table linking workouts to exercise results

### UI Architecture

**Component hierarchy:**
```
AppLayout (auth + data loading + auto-save)
├── WorkoutView (active workout interface)
│   └── BottomSheet (exercise logging modal)
└── ProgressView (stats, history, current weights)
```

**Bottom navigation pattern:** Two tabs (Train/Progress) managed by local state in AppLayout. The "Sign Out" button only appears on Progress tab.

**Key interaction flow:**
1. User taps exercise card → `openExerciseSheet(exerciseKey)`
2. Bottom sheet slides up with weight input (editable) and sets display
3. User can modify weight before marking success/failure
4. If weight changed → `overrideWeight()` saves to history as `WEIGHT_OVERRIDE` type
5. "Hit Target" → `recordResult(exercise, true)` + updates weekly results
6. All exercises complete → "Finish Workout" button appears (fixed to bottom)

### Styling System

**Design philosophy:** Industrial Minimalist - clean, professional, no emojis, SF Pro font stack

**Key CSS patterns:**
- Status indicators: `.status-todo`, `.status-done`, `.status-missed` (see globals.css:81-91)
- Button styles: `.btn-primary`, `.btn-success`, `.btn-error` (all 48px min-height for iOS touch targets)
- Card system: `.card`, `.card-interactive` with active scaling
- iOS-specific: Safe area insets, prevent bounce scrolling, 16px inputs (prevent auto-zoom)

**Logo handling:**
- SVG logo in header must have transparent background (grey background path was removed in workout-bear-icon-180.svg:3)
- 48×48px display size (h-12 w-12)

### Critical Gotchas

**Weight Override vs Normal Progression:**
- `overrideWeight()` creates a `WEIGHT_OVERRIDE` entry in workout history (no exercise results)
- Resets `consecutiveFailures` and `weeklyResults` for that exercise
- Used after breaks or injury recovery to manually set starting weight

**Deload Week Behavior:**
- During deload, session 0 uses RDL instead of Deadlift (see getCurrentWorkoutType:54-56)
- Weights drop to 75%, rounded to nearest 5 lbs
- After deload completes, return to `lastSuccessfulWeights - 5` (not current weights)

**Static Export Constraints:**
- `next.config.ts` has `output: 'export'` - NO server-side rendering
- Image optimization disabled (`unoptimized: true`)
- Cannot use Next.js Image API routes (use SVG/PNG directly)
- Build errors about env vars are expected locally (Vercel has them)

**Authentication:**
- Supports email/password, magic links, and phone OTP (Twilio integration)
- Session persists for 1 year (configured in Supabase dashboard)
- `supabase.auth.onAuthStateChange` in AppLayout handles session restoration

### Testing the App

**Typical workflow:**
1. Sign in → Data loads from Supabase
2. Tap exercise → Bottom sheet opens
3. Optionally edit weight
4. Mark Hit/Missed → Sheet closes, status indicator updates
5. Complete all exercises → Tap "Finish Workout"
6. Progress tab → View history and current weights

**To test progression logic manually:**
1. Complete 4 workouts (full week)
2. Mark all exercises as successful → Weights should increase +5 lbs
3. Mark all as failures for 2 consecutive weeks → Deload should trigger
4. Check that RDL appears instead of Deadlift on session 0 during deload

### Common Tasks

**Adding a new exercise:**
1. Add to `ExerciseKey` type in types/index.ts
2. Add to `INITIAL_WEIGHTS`, `EXERCISE_INFO`, `EXERCISE_DISPLAY_NAMES` in lib/constants.ts
3. Add to appropriate workout in `WORKOUTS` constant
4. Initialize in `getInitialState()` in workout-store.ts (weeklyResults, consecutiveFailures)

**Modifying progression rules:**
- All logic is in `processWeeklyResults()` in workout-store.ts (lines 139-244)
- Weight increments: line 236 (`newWeights[key] += 5`)
- Deload threshold: line 164 (`>= 2`)
- Deload percentage: line 188 (`* 0.75`)

**Changing workout cycle:**
- Modify `getCurrentWorkoutType()` in workout-store.ts
- Update `sessionCount % 4` logic to match new cycle length
- Adjust week completion check in `completeWorkout()` line 120
