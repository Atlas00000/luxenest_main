/**
 * File upload API service
 */

import { ApiClientError } from './client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
import { tokenStorage } from '../utils/token-storage';

export interface UploadedFile {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimetype: string;
}

/**
 * Upload single file
 */
export const uploadFile = async (file: File): Promise<UploadedFile> => {
  try {
    const accessToken = tokenStorage.getAccessToken();
    
    if (!accessToken) {
      throw new ApiClientError('Authentication required', 401);
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload/single`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMessage = data.error || data.message || 'Upload failed';
      throw new ApiClientError(errorMessage, response.status);
    }

    return data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to upload file');
  }
};

/**
 * Upload multiple files
 */
export const uploadFiles = async (files: File[]): Promise<UploadedFile[]> => {
  try {
    const accessToken = tokenStorage.getAccessToken();
    
    if (!accessToken) {
      throw new ApiClientError('Authentication required', 401);
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_URL}/upload/multiple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMessage = data.error || data.message || 'Upload failed';
      throw new ApiClientError(errorMessage, response.status);
    }

    return data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to upload files');
  }
};

