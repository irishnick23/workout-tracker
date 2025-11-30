// Haptic feedback utilities for iOS and Android

export const haptics = {
  // Light impact - for small UI interactions
  light: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  // Medium impact - for button presses
  medium: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },

  // Heavy impact - for important actions
  heavy: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
  },

  // Success pattern - for successful completions
  success: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
  },

  // Error pattern - for failures or missed actions
  error: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([30, 50, 30]);
    }
  },

  // Celebration pattern - for workout completion
  celebration: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([10, 30, 10, 30, 10, 30, 50]);
    }
  },
};
