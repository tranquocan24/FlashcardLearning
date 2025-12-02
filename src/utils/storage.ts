import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

export const storage = {
  // Save data
  async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  },

  // Get data
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue === null ? null : JSON.parse(jsonValue);
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  },

  // Remove data
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  },

  // Clear all data
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },

  // User helpers
  async setUser(user: any): Promise<void> {
    return this.setItem(STORAGE_KEYS.USER, user);
  },

  async getUser<T>(): Promise<T | null> {
    return this.getItem<T>(STORAGE_KEYS.USER);
  },

  async removeUser(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.USER);
  },

  // Token helpers
  async setToken(token: string): Promise<void> {
    return this.setItem(STORAGE_KEYS.TOKEN, token);
  },

  async getToken(): Promise<string | null> {
    return this.getItem<string>(STORAGE_KEYS.TOKEN);
  },

  async removeToken(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.TOKEN);
  },
};
