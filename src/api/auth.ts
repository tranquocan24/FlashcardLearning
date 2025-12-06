// Authentication API
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types';
import { generateUUID } from '../utils/uuid';
import API from './client';

interface GoogleLoginRequest {
  googleId: string;
  email: string;
  name: string;
  photo?: string;
}

export const authAPI = {
  // Login
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await API.post('/api/auth/login', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  // Register
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      // Generate UUID on client side
      const userId = generateUUID();

      const response = await API.post('/api/auth/register', {
        id: userId,
        ...data,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  },

  // Google Sign-In
  async googleLogin(data: GoogleLoginRequest): Promise<LoginResponse> {
    try {
      console.log('API: Sending Google login request to /api/auth/google');
      console.log('API: Request data:', data);
      const response = await API.post('/api/auth/google', data);
      console.log('API: Response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: Google login request failed');
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      console.error('API: Error message:', error.message);
      throw new Error(error.response?.data?.error || error.message || 'Google sign-in failed');
    }
  },

  // Logout (optional - just clear local storage)
  async logout(): Promise<void> {
    // TODO: Call API to invalidate token if using JWT
    return Promise.resolve();
  },
};
