import type {
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    ProfileResponse,
    RegisterRequest,
    RegisterResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    SocialAuthResponse,
    UpdatePasswordRequest,
    UpdatePasswordResponse,
    UpdateProfileRequest,
    UpdateProfileResponse,
} from '../types/auth';
import { apiClient } from './client';
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

    async changePassword(passwordData: UpdatePasswordRequest): Promise<UpdatePasswordResponse> {
        const response = await apiClient.getClient().put<UpdatePasswordResponse>(endpoints.auth_change_password, passwordData);
        return response.data;
    },

    async forgotPassword(email: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
        const response = await apiClient.getClient().post<ForgotPasswordResponse>(endpoints.auth_forgot_password, email);
        return response.data;
    },

    async resetPassword(passwordData: ResetPasswordRequest): Promise<ResetPasswordResponse> {
        const response = await apiClient.getClient().post<ResetPasswordResponse>(endpoints.auth_reset_password, passwordData);
        return response.data;
    },

    async socialAuth(provider: string): Promise<SocialAuthResponse> {
        const response = await apiClient.getClient().get<SocialAuthResponse>(endpoints.auth_social_login.replace('{provider}', provider));
        return response.data;
    },

    async updateProfile(profileData: UpdateProfileRequest): Promise<UpdateProfileResponse> {
        const response = await apiClient.getClient().post<UpdateProfileResponse>(endpoints.auth_update_profile, profileData);
        return response.data;
    },
};
