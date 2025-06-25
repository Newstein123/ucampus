export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  dob: string;
  location: string;
  email_verified_at?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  login: string; // email, username, or phone
  password: string;
}

export interface LoginUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  dob: string;
  location: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  dob: string;
  location: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  data: User;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
} 