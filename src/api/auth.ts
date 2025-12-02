// Authentication API
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types';
import { generateUUID } from '../utils/uuid';
import API from './index';

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
      const response = await API.post('/api/auth/google', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Google sign-in failed');
    }
  },

  // Logout (optional - just clear local storage)
  async logout(): Promise<void> {
    // TODO: Call API to invalidate token if using JWT
    return Promise.resolve();
  },
};
