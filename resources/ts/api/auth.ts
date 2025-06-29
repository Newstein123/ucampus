import { apiClient } from './client';
import type { 
  LoginRequest, 
  RegisterRequest, 
  RegisterResponse, 
  ProfileResponse, 
  LogoutResponse,
  LoginResponse
} from '../types/auth';
import { endpoints } from './endpoints';

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.getClient().post<LoginResponse>(endpoints.auth_login, credentials);
    apiClient.setAuthToken(response.data.data.token);
    return response.data;
  },

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.getClient().post<RegisterResponse>(endpoints.auth_register, userData);
    if (response.data.success) {
      apiClient.setAuthToken(response.data.data.token);
    }
    return response.data;
  },

  async logout(): Promise<LogoutResponse> {
    const response = await apiClient.getClient().post<LogoutResponse>(endpoints.auth_logout);
    apiClient.removeAuthToken();
    return response.data;
  },

  async getProfile(): Promise<ProfileResponse> {
    const response = await apiClient.getClient().get<ProfileResponse>(endpoints.auth_profile);
    return response.data;
  },
}; 