import { apiClient } from './client';
import { endpoints } from './endpoints';

export interface CreateContactRequest {
    fullname: string;
    email: string;
    message: string;
}

export interface CreateContactResponse {
    success: boolean;
    message: string;
    data: {
        id: number;
        fullname: string;
        email: string;
        message: string;
        created_at: string;
        updated_at: string;
    };
}

export const contactApi = {
    async create(data: CreateContactRequest): Promise<CreateContactResponse> {
        const response = await apiClient.getClient().post<CreateContactResponse>(endpoints.contact_create, data);
        return response.data;
    },
};
