// Progress & Sessions API
import { Progress, Session } from '../types';
import { generateUUID } from '../utils/uuid';
import API from './index';

export const progressAPI = {
  // Get user progress for a deck
  async getProgress(userId: string, deckId: string): Promise<Progress[]> {
    try {
      const response = await API.get(`/progress/${userId}/${deckId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch progress');
    }
  },

  // Update progress for a flashcard
  async updateProgress(data: {
    user_id: string;
    flashcard_id: string;
    ease?: number;
    interval?: number;
    next_review_at?: string;
    times_seen: number;
  }): Promise<Progress> {
    try {
      const progressId = generateUUID();

      const response = await API.post('/progress', {
        id: progressId,
        ...data,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update progress');
    }
  },

  // Save learning session (unified method)
  async saveSession(data: {
    user_id: string;
    deck_id: string;
    session_type: 'FLASHCARD' | 'QUIZ' | 'MATCH';
    score: number;
    total_cards: number;
  }): Promise<Session> {
    try {
      const sessionId = generateUUID();

      const payload = {
        id: sessionId,
        user_id: data.user_id,
        deck_id: data.deck_id,
        session_type: data.session_type,
        score: data.score,
        total_cards: data.total_cards,
      };

      console.log('Sending session data:', payload);

      const response = await API.post('/sessions', payload);
      return response.data;
    } catch (error: any) {
      console.error('Save session error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to save session');
    }
  },
};

export const sessionsAPI = {
  // Get user's learning sessions
  async getSessions(userId: string): Promise<Session[]> {
    try {
      const response = await API.get(`/sessions/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch sessions');
    }
  },

  // Create new learning session
  async createSession(data: {
    user_id: string;
    deck_id: string;
    type: 'FLASHCARD' | 'QUIZ' | 'MATCH';
    total: number;
    correct: number;
    details?: any;
  }): Promise<Session> {
    try {
      const sessionId = generateUUID();

      const response = await API.post('/sessions', {
        id: sessionId,
        ...data,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create session');
    }
  },
};
