// App configuration constants

// API Configuration
export const API_URL = __DEV__
  ? 'http://192.168.2.8:3000'  // Development - backend port is 3000
  : 'https://api.flashcardlearning.com'; // Production

export const API_TIMEOUT = 10000; // 10 seconds

// AsyncStorage Keys
export const STORAGE_KEYS = {
  USER: '@flashcard_user',
  TOKEN: '@flashcard_token',
  THEME: '@flashcard_theme',
} as const;

// App Settings
export const APP_NAME = 'FlashcardLearning';
export const APP_VERSION = '1.0.0';
