// App configuration constants

// API Configuration
export const API_URL = __DEV__
<<<<<<< HEAD
  ? 'http://192.168.1.101:3000'  // Development - backend port is 3000
=======
  ? 'http://192.168.2.8:3000'  // Development - backend port is 3000
>>>>>>> f07350a1217d45e9a5246ad030ee6b4e2cd7cbb7
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
