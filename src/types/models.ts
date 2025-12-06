// Database models matching PostgreSQL schema

export interface User {
  id: string; // UUID
  username: string;
  email: string;
  password?: string; // Not returned from API
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string; // UUID
  name: string;
  user_id: string;
  deck_count?: number; // Count from JOIN
  created_at: string;
  updated_at: string;
}

export interface Deck {
  id: string; // UUID
  title: string;
  description?: string;
  is_public: boolean;
  owner_id: string;
  folder_id?: string | null; // FK to folders
  owner_name?: string; // Joined from users table
  owner_email?: string;
  flashcard_count?: number; // Count from JOIN
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string; // UUID
  deck_id: string;
  word: string;
  meaning: string;
  example?: string;
  media_url?: string;
  created_at: string;
  updated_at: string;
}

export type SessionType = 'FLASHCARD' | 'QUIZ' | 'MATCH';

export interface Session {
  id: string; // UUID
  user_id: string;
  deck_id: string;
  type: SessionType;
  total: number;
  correct: number;
  details?: any; // JSONB
  created_at: string;
}

export interface Progress {
  id: string; // UUID
  user_id: string;
  flashcard_id: string;
  ease: number;
  interval: number;
  next_review_at?: string;
  times_seen: number;
  created_at: string;
  updated_at: string;
}

// Extended types for UI
export interface FlashcardWithProgress extends Flashcard {
  progress?: Progress;
}

export interface DeckWithStats extends Deck {
  total_flashcards: number;
  learned_count: number;
  last_studied?: string;
}
