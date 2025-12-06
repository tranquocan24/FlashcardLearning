import { Folder } from '../types/models';
import API from './client';

export interface CreateFolderRequest {
    id: string;
    name: string;
}

export interface UpdateFolderRequest {
    name: string;
}

export interface FolderResponse {
    success: boolean;
    folder?: Folder;
    folders?: Folder[];
    message?: string;
    error?: string;
}

export const folderAPI = {
    // Get all folders for current user
    async getFolders(): Promise<FolderResponse> {
        try {
            const response = await API.get('/api/folders');
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to fetch folders');
        }
    },

    // Create new folder
    async createFolder(data: CreateFolderRequest): Promise<FolderResponse> {
        try {
            const response = await API.post('/api/folders', data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to create folder');
        }
    },

    // Update folder
    async updateFolder(folderId: string, data: UpdateFolderRequest): Promise<FolderResponse> {
        try {
            const response = await API.put(`/api/folders/${folderId}`, data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to update folder');
        }
    },

    // Delete folder
    async deleteFolder(folderId: string): Promise<FolderResponse> {
        try {
            const response = await API.delete(`/api/folders/${folderId}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to delete folder');
        }
    },
};
