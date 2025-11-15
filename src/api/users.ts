// Users API
import { User } from '../types';
import API from './index';

export const usersAPI = {
  // Get user by ID
  async getUser(userId: string): Promise<User> {
    try {
      const response = await API.get(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch user');
    }
  },

  // Get all users (for testing)
  async getUsers(): Promise<User[]> {
    try {
      const response = await API.get('/users');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch users');
    }
  },

  // Update user profile
  async updateProfile(userId: string, data: {
    username?: string;
    avatar_url?: string;
  }): Promise<User> {
    try {
      const response = await API.put(`/users/${userId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update profile');
    }
  },

  // Change password
  async changePassword(userId: string, data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean }> {
    try {
      const response = await API.put(`/users/${userId}/password`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to change password');
    }
  },
};
