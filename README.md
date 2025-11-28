# Workout Tracker

A modern, progressive workout tracking application built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🏋️ **Progressive Overload Tracking** - Automatic weight progression based on performance
- 📊 **Smart Deload System** - Automatically triggers deload weeks after consecutive failures
- 💾 **Cloud Sync** - All data synced to Supabase for access across devices
- 🔐 **Authentication** - Secure sign up/sign in with email or magic link
- ⚖️ **Weight Override** - Manually adjust weights when needed (e.g., after a break)
- 📈 **Progress Tracking** - View workout history, success rates, and weight progression
- 📱 **Mobile-First Design** - Optimized for use at the gym

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Supabase** - Backend as a service (auth + database)
- **Zustand** - State management

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (already configured)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

This generates a static export in the `out/` directory that can be deployed anywhere.

## Deployment Options

Since this uses `output: 'export'`, you can deploy to:

- **Netlify** - Drag and drop the `out/` folder
- **Vercel** - Connect your repo (even on Hobby plan, separate from your main project)
- **GitHub Pages** - Free static hosting
- **Railway** - Deploy with their CLI
- **Any static host** - Upload the `out/` folder

## Supabase Configuration

The app is already connected to your Supabase project with:
- Database tables for workout data
- Row Level Security policies
- Authentication configured

Environment variables are in `.env.local` (not committed to git).

## Project Structure

```
workout-tracker-app/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── AppLayout.tsx     # Main app layout
│   ├── AuthForm.tsx      # Authentication form
│   ├── WorkoutView.tsx   # Workout tracking interface
│   └── ProgressView.tsx  # Progress and stats
├── lib/                   # Utilities and services
│   ├── supabase.ts       # Supabase client
│   ├── db.ts             # Database functions
│   └── constants.ts      # App constants
├── store/                 # Zustand stores
│   ├── auth-store.ts     # Auth state management
│   └── workout-store.ts  # Workout state + logic
├── types/                 # TypeScript types
│   └── index.ts
└── next.config.ts         # Next.js configuration
```

## How It Works

### Workout Progression

The app follows a 4-workout weekly cycle:
1. **Workout A (Heavy)** - Deadlift, OHP, Row
2. **Workout B** - Squat, Bench, Pull-ups
3. **Workout A (Light)** - RDL, OHP, Row
4. **Workout B** - Squat, Bench, Pull-ups

**Progression Rules:**
- If all sets successful in a week → +5 lbs next week
- If all sets fail → retry same weight
- If fail 2 weeks in a row → automatic deload (75% weight)

### Weight Override Feature

After returning from a break (like your 3-week travel), you can:
1. Go to Progress tab
2. Click "Edit" next to any exercise
3. Set new target weight (e.g., drop bench from 130 to 120)
4. Progression resets from new weight (120 → 125 → 130...)

## License

ISC
