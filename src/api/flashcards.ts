// Flashcards API
import { Flashcard } from '../types';
import { generateUUID } from '../utils/uuid';
import API from './index';

export const flashcardsAPI = {
  // Get all flashcards for a deck
  async getFlashcards(deckId: string): Promise<Flashcard[]> {
    try {
      const response = await API.get(`/flashcards/${deckId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch flashcards');
    }
  },

  // Create new flashcard
  async createFlashcard(data: {
    deck_id: string;
    word: string;
    meaning: string;
    example?: string;
    media_url?: string;
  }): Promise<Flashcard> {
    try {
      const flashcardId = generateUUID();
      
      const response = await API.post('/flashcards', {
        id: flashcardId,
        ...data,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create flashcard');
    }
  },

  // Update flashcard
  async updateFlashcard(flashcardId: string, data: Partial<Flashcard>): Promise<Flashcard> {
    try {
      const response = await API.put(`/flashcards/${flashcardId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update flashcard');
    }
  },

  // Delete flashcard
  async deleteFlashcard(flashcardId: string): Promise<void> {
    try {
      await API.delete(`/flashcards/${flashcardId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete flashcard');
    }
  },
};
