// Decks API
import { Deck } from '../types';
import { generateUUID } from '../utils/uuid';
import API from './client';

export const decksAPI = {
  // Get all decks (with optional user filter)
  async getDecks(userId?: string): Promise<Deck[]> {
    try {
      const params = userId ? { userId } : {};
      const response = await API.get('/decks', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch decks');
    }
  },

  // Get single deck by ID
  async getDeckById(deckId: string): Promise<Deck> {
    try {
      const response = await API.get(`/decks/${deckId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch deck');
    }
  },

  // Create new deck
  async createDeck(data: {
    title: string;
    description?: string;
    owner_id: string;
    is_public?: boolean;
    folder_id?: string | null;
  }): Promise<Deck> {
    try {
      const deckId = generateUUID();

      const response = await API.post('/decks', {
        id: deckId,
        ...data,
        is_public: data.is_public ?? false,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create deck');
    }
  },

  // Update deck
  async updateDeck(deckId: string, data: Partial<Deck>): Promise<Deck> {
    try {
      const response = await API.put(`/decks/${deckId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update deck');
    }
  },

  // Delete deck
  async deleteDeck(deckId: string): Promise<void> {
    try {
      await API.delete(`/decks/${deckId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete deck');
    }
  },

  // Move deck to folder or out of folder
  async moveDeckToFolder(deckId: string, folderId: string | null): Promise<Deck> {
    try {
      const response = await API.put(`/decks/${deckId}/move`, {
        folderId,
      });
      return response.data.deck;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to move deck');
    }
  },
};
